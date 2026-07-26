import "server-only";

import { withTenantTransaction } from "@/lib/tenant-context";
import { canX } from "@/lib/permissions";
import { Err, Ok, type Result } from "@/lib/server-utils";
import { createJournalEntry } from "@/dal/journal-entry/mutations";
import {
  getJournalEntryWithLinesById,
  getReversalForEntry,
  calculateAccountBalance as dalCalculateAccountBalance,
} from "@/dal/journal-entry/queries";
import { getOpenPeriodForDate } from "@/dal/fiscal-period/queries";
import { getLedgerAccountById } from "@/dal/ledger-account/queries";
import { getNextSequenceNumber } from "@/dal/numbering-sequence/mutations";
import type { Tx } from "@/services/drizzle";

export interface JournalLineParam {
  accountId: string;
  debit: number;
  credit: number;
  description?: string | null;
}

export interface CreateJournalEntryParams {
  entryDate: string;
  description: string;
  sourceType?: "manual" | "invoice" | "payment" | "adjustment" | "stock_adjustment" | "payroll";
  sourceId?: string | null;
  reversalOfEntryId?: string | null;
  lines: JournalLineParam[];
}

export type JournalEntryResult = Result<any, { code: string; message: string }>;

/**
 * Core logic — operates inside a caller-owned transaction.
 * Does NOT open its own transaction. Does NOT do permission checks.
 * Called by createJournalEntryService (standalone) and InvoiceService (shared tx).
 */
export async function createJournalEntryCore(
  tx: Tx,
  companyId: string,
  params: CreateJournalEntryParams,
  userId: string,
): Promise<JournalEntryResult> {
  const { lines, entryDate, description, sourceType = "manual", sourceId, reversalOfEntryId } = params;

  // Step 1: Validate sum(lines.debit) === sum(lines.credit)
  const sumDebit = lines.reduce((s, l) => s + (l.debit || 0), 0);
  const sumCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);

  if (Math.abs(sumDebit - sumCredit) > 0.0001) {
    return Err({
      code: "UNBALANCED_ENTRY",
      message: `Journal entry is out of balance. Total debits (${sumDebit.toFixed(2)}) must equal total credits (${sumCredit.toFixed(2)}).`,
    });
  }

  // Step 2: Validate every line has exactly one non-zero side
  for (const [idx, line] of lines.entries()) {
    const d = line.debit || 0;
    const c = line.credit || 0;
    if ((d > 0 && c > 0) || (d === 0 && c === 0)) {
      return Err({
        code: "INVALID_LINE_SIDE",
        message: `Line ${idx + 1}: Each line must have exactly one non-zero side (either debit or credit).`,
      });
    }
  }

  // Step 3: Resolve fiscal period for entryDate and verify status === "open"
  const period = await getOpenPeriodForDate(tx, companyId, entryDate);
  if (!period) {
    return Err({
      code: "CLOSED_OR_MISSING_PERIOD",
      message: `No open fiscal period exists for entry date ${entryDate}. Cannot post to a closed period.`,
    });
  }

  // Step 4: Validate every accountId belongs to companyId and isActive === true
  const invalidAccountIds: string[] = [];
  for (const line of lines) {
    const acc = await getLedgerAccountById(tx, companyId, line.accountId);
    if (!acc || !acc.isActive) {
      invalidAccountIds.push(line.accountId);
    }
  }

  if (invalidAccountIds.length > 0) {
    return Err({
      code: "INVALID_ACCOUNT",
      message: `Invalid or inactive account(s): ${invalidAccountIds.join(", ")}.`,
    });
  }

  // Step 5: Generate entryNumber
  const entryNumber = await getNextSequenceNumber(tx, companyId, "JOURNAL_ENTRY", "JE-");

  // Step 6 & 7: Insert header & lines
  const entry = await createJournalEntry(tx, {
    organizationId: companyId,
    fiscalPeriodId: period.id,
    entryNumber,
    entryDate,
    memo: description,
    sourceType,
    sourceId: sourceId ?? null,
    reversalOfEntryId: reversalOfEntryId ?? null,
    status: "posted",
    createdBy: userId,
    lines: lines.map((l, index) => ({
      ledgerAccountId: l.accountId,
      debit: (l.debit || 0).toString(),
      credit: (l.credit || 0).toString(),
      description: l.description ?? null,
      lineOrder: index,
    })),
  });

  return Ok(entry);
}

/**
 * Public service — does permission check then opens its own transaction.
 * Use for standalone mutations from server actions.
 */
export async function createJournalEntryService(
  companyId: string,
  params: CreateJournalEntryParams,
  userId: string,
  userRole?: string,
): Promise<JournalEntryResult> {
  if (userRole && !canX(userRole, { id: companyId }, "journal_entry:create")) {
    return Err({
      code: "FORBIDDEN",
      message: "You do not have permission to create journal entries.",
    });
  }

  return withTenantTransaction(companyId, (tx) =>
    createJournalEntryCore(tx, companyId, params, userId),
  );
}

/**
 * Reverses a journal entry by creating an offsetting entry.
 * Validates that the entry hasn't already been reversed.
 */
export async function reverseJournalEntryService(
  companyId: string,
  entryId: string,
  reason: string,
  userId: string,
  userRole?: string,
): Promise<JournalEntryResult> {
  if (userRole && !canX(userRole, { id: companyId }, "journal_entry:reverse")) {
    return Err({
      code: "FORBIDDEN",
      message: "You do not have permission to reverse journal entries.",
    });
  }

  if (!reason || reason.trim() === "") {
    return Err({
      code: "REASON_REQUIRED",
      message: "A reversal reason is required.",
    });
  }

  return withTenantTransaction(companyId, async (tx) => {
    const originalEntry = await getJournalEntryWithLinesById(tx, companyId, entryId);
    if (!originalEntry) {
      return Err({
        code: "NOT_FOUND",
        message: "Journal entry not found.",
      });
    }

    const existingReversal = await getReversalForEntry(tx, companyId, entryId);
    if (existingReversal) {
      return Err({
        code: "ALREADY_REVERSED",
        message: `Journal entry ${originalEntry.entryNumber} has already been reversed by entry ${existingReversal.entryNumber}.`,
      });
    }

    // Build swapped lines
    const reversedLines: JournalLineParam[] = originalEntry.lines.map((l) => ({
      accountId: l.ledgerAccountId,
      debit: parseFloat(l.credit),
      credit: parseFloat(l.debit),
      description: l.description ? `Reversal: ${l.description}` : `Reversal of ${originalEntry.entryNumber}`,
    }));

    const todayStr = new Date().toISOString().split("T")[0];

    // Use createJournalEntryCore directly — no nested transaction
    return createJournalEntryCore(tx, companyId, {
      entryDate: todayStr,
      description: `Reversal of ${originalEntry.entryNumber}: ${reason}`,
      sourceType: "adjustment",
      sourceId: originalEntry.sourceId,
      reversalOfEntryId: entryId,
      lines: reversedLines,
    }, userId);
  });
}

/**
 * Reverses a journal entry inside a caller-owned transaction.
 * Use from InvoiceService.void when already inside a shared tx.
 */
export async function reverseJournalEntryCore(
  tx: Tx,
  companyId: string,
  entryId: string,
  reason: string,
  userId: string,
): Promise<JournalEntryResult> {
  const originalEntry = await getJournalEntryWithLinesById(tx, companyId, entryId);
  if (!originalEntry) {
    return Err({ code: "NOT_FOUND", message: "Journal entry not found." });
  }

  const existingReversal = await getReversalForEntry(tx, companyId, entryId);
  if (existingReversal) {
    return Err({
      code: "ALREADY_REVERSED",
      message: `Journal entry ${originalEntry.entryNumber} has already been reversed by entry ${existingReversal.entryNumber}.`,
    });
  }

  const reversedLines: JournalLineParam[] = originalEntry.lines.map((l) => ({
    accountId: l.ledgerAccountId,
    debit: parseFloat(l.credit),
    credit: parseFloat(l.debit),
    description: l.description ? `Reversal: ${l.description}` : `Reversal of ${originalEntry.entryNumber}`,
  }));

  const todayStr = new Date().toISOString().split("T")[0];

  return createJournalEntryCore(tx, companyId, {
    entryDate: todayStr,
    description: `Reversal of ${originalEntry.entryNumber}: ${reason}`,
    sourceType: "adjustment",
    sourceId: originalEntry.sourceId,
    reversalOfEntryId: entryId,
    lines: reversedLines,
  }, userId);
}

export async function getAccountBalanceService(
  companyId: string,
  accountId: string,
  filter?: { fiscalPeriodId?: string; startDate?: string; endDate?: string },
): Promise<Result<string, { code: string; message: string }>> {
  return withTenantTransaction(companyId, async (tx) => {
    const balance = await dalCalculateAccountBalance(tx, companyId, accountId, filter);
    return Ok(balance);
  });
}
