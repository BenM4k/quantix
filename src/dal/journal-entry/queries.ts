import "server-only";

import { and, eq, gte, lte, count, desc, sum, or, ilike } from "drizzle-orm";
import {
  journalEntry,
  journalEntryLine,
  ledgerAccount,
  type JournalSourceType,
} from "@/services/drizzle/schemas";
import type { Tx } from "@/services/drizzle";

export async function getJournalEntryList(
  tx: Tx,
  organizationId: string,
  params?: {
    search?: string;
    fiscalPeriodId?: string;
    sourceType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  },
) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 50;
  const offset = (page - 1) * limit;

  const conditions = [eq(journalEntry.organizationId, organizationId)];

  if (params?.fiscalPeriodId && params.fiscalPeriodId !== "all") {
    conditions.push(eq(journalEntry.fiscalPeriodId, params.fiscalPeriodId));
  }

  if (params?.sourceType && params.sourceType !== "all") {
    conditions.push(eq(journalEntry.sourceType, params.sourceType as JournalSourceType));
  }

  if (params?.startDate) {
    conditions.push(gte(journalEntry.entryDate, params.startDate));
  }

  if (params?.endDate) {
    conditions.push(lte(journalEntry.entryDate, params.endDate));
  }

  if (params?.search) {
    const q = `%${params.search}%`;
    conditions.push(
      or(ilike(journalEntry.entryNumber, q), ilike(journalEntry.memo, q))!,
    );
  }

  const whereClause = and(...conditions);

  const [totalRes] = await tx
    .select({ total: count() })
    .from(journalEntry)
    .where(whereClause);

  const entries = await tx
    .select()
    .from(journalEntry)
    .where(whereClause)
    .orderBy(desc(journalEntry.entryDate), desc(journalEntry.createdAt))
    .limit(limit)
    .offset(offset);

  // Calculate totals per entry
  const entriesWithTotals = await Promise.all(
    entries.map(async (entry) => {
      const [totals] = await tx
        .select({
          totalDebit: sum(journalEntryLine.debit),
          totalCredit: sum(journalEntryLine.credit),
        })
        .from(journalEntryLine)
        .where(eq(journalEntryLine.journalEntryId, entry.id));

      return {
        ...entry,
        totalDebit: totals?.totalDebit ?? "0",
        totalCredit: totals?.totalCredit ?? "0",
      };
    }),
  );

  return {
    entries: entriesWithTotals,
    total: Number(totalRes?.total ?? 0),
  };
}

export async function getJournalEntryWithLinesById(
  tx: Tx,
  organizationId: string,
  id: string,
) {
  const [entry] = await tx
    .select()
    .from(journalEntry)
    .where(
      and(
        eq(journalEntry.organizationId, organizationId),
        eq(journalEntry.id, id),
      ),
    )
    .limit(1);

  if (!entry) return null;

  const rawLines = await tx
    .select({
      id: journalEntryLine.id,
      journalEntryId: journalEntryLine.journalEntryId,
      ledgerAccountId: journalEntryLine.ledgerAccountId,
      accountCode: ledgerAccount.code,
      accountName: ledgerAccount.name,
      debit: journalEntryLine.debit,
      credit: journalEntryLine.credit,
      description: journalEntryLine.description,
      lineOrder: journalEntryLine.lineOrder,
    })
    .from(journalEntryLine)
    .innerJoin(
      ledgerAccount,
      eq(journalEntryLine.ledgerAccountId, ledgerAccount.id),
    )
    .where(eq(journalEntryLine.journalEntryId, entry.id))
    .orderBy(journalEntryLine.lineOrder);

  // Check if this entry is a reversal of another entry
  let originalEntryNumber: string | null = null;
  if (entry.reversalOfEntryId) {
    const [orig] = await tx
      .select()
      .from(journalEntry)
      .where(
        and(
          eq(journalEntry.organizationId, organizationId),
          eq(journalEntry.id, entry.reversalOfEntryId),
        ),
      )
      .limit(1);
    if (orig) originalEntryNumber = orig.entryNumber;
  }

  // Check if any entry has reversed this entry
  const [reversedBy] = await tx
    .select()
    .from(journalEntry)
    .where(
      and(
        eq(journalEntry.organizationId, organizationId),
        eq(journalEntry.reversalOfEntryId, entry.id),
      ),
    )
    .limit(1);

  return {
    ...entry,
    lines: rawLines,
    originalEntryNumber,
    reversedByEntryId: reversedBy?.id ?? null,
    reversedByEntryNumber: reversedBy?.entryNumber ?? null,
  };
}

export async function getReversalForEntry(
  tx: Tx,
  organizationId: string,
  entryId: string,
) {
  const [reversal] = await tx
    .select()
    .from(journalEntry)
    .where(
      and(
        eq(journalEntry.organizationId, organizationId),
        eq(journalEntry.reversalOfEntryId, entryId),
      ),
    )
    .limit(1);
  return reversal || null;
}

export async function calculateAccountBalance(
  tx: Tx,
  organizationId: string,
  accountId: string,
  filter?: { fiscalPeriodId?: string; startDate?: string; endDate?: string },
) {
  const [account] = await tx
    .select()
    .from(ledgerAccount)
    .where(
      and(
        eq(ledgerAccount.organizationId, organizationId),
        eq(ledgerAccount.id, accountId),
      ),
    )
    .limit(1);

  if (!account) return "0";

  const conditions = [
    eq(journalEntry.organizationId, organizationId),
    eq(journalEntryLine.ledgerAccountId, accountId),
  ];

  if (filter?.fiscalPeriodId) {
    conditions.push(eq(journalEntry.fiscalPeriodId, filter.fiscalPeriodId));
  }
  if (filter?.startDate) {
    conditions.push(gte(journalEntry.entryDate, filter.startDate));
  }
  if (filter?.endDate) {
    conditions.push(lte(journalEntry.entryDate, filter.endDate));
  }

  const [res] = await tx
    .select({
      totalDebit: sum(journalEntryLine.debit),
      totalCredit: sum(journalEntryLine.credit),
    })
    .from(journalEntryLine)
    .innerJoin(
      journalEntry,
      eq(journalEntryLine.journalEntryId, journalEntry.id),
    )
    .where(and(...conditions));

  const totalDebit = parseFloat(res?.totalDebit ?? "0");
  const totalCredit = parseFloat(res?.totalCredit ?? "0");

  const netBalance =
    account.normalBalance === "debit"
      ? totalDebit - totalCredit
      : totalCredit - totalDebit;

  return netBalance.toFixed(4);
}
