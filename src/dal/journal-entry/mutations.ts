import type { Tx } from "@/services/drizzle";
import {
  journalEntry,
  journalEntryLine,
  NewJournalEntry,
  NewJournalEntryLine,
} from "@/services/drizzle/schemas";
import "server-only";

type JournalLineInput = Omit<
  NewJournalEntryLine,
  "id" | "journalEntryId" | "organizationId" | "createdAt" | "updatedAt"
>;

type CreateJournalEntryInput = Omit<
  NewJournalEntry,
  "id" | "createdAt" | "updatedAt"
> & {
  lines: JournalLineInput[];
};

/**
 * Pure persistence: inserts the journal_entry header and its lines in one
 * DB round-trip inside the caller's transaction.
 *
 * Deliberately NOT checked here (this belongs in JournalService, per your
 * architecture's "DAL never contains business logic" rule):
 *   - Σdebit == Σcredit
 *   - fiscal period is open
 *   - permission / feature-flag checks
 *
 * If the caller passes unbalanced lines, this function will happily insert
 * them — that's intentional. The Service is expected to have already
 * validated the balance before calling this.
 */
export async function createJournalEntry(
  tx: Tx,
  input: CreateJournalEntryInput,
) {
  const [entry] = await tx
    .insert(journalEntry)
    .values({
      organizationId: input.organizationId,
      fiscalPeriodId: input.fiscalPeriodId,
      entryNumber: input.entryNumber,
      entryDate: input.entryDate,
      memo: input.memo,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      status: input.status ?? "posted",
      createdBy: input.createdBy,
    })
    .returning();

  if (input.lines.length === 0) {
    // A journal entry with zero lines is never valid — but again, this is
    // a shape/integrity check, not a business rule, so it's fine here.
    throw new Error("createJournalEntry: at least one line is required");
  }

  const lines = await tx
    .insert(journalEntryLine)
    .values(
      input.lines.map((line, index) => ({
        organizationId: input.organizationId,
        journalEntryId: entry.id,
        ledgerAccountId: line.ledgerAccountId,
        debit: line.debit ?? "0",
        credit: line.credit ?? "0",
        departmentId: line.departmentId ?? null,
        description: line.description ?? null,
        lineOrder: line.lineOrder ?? index,
      })),
    )
    .returning();

  return { ...entry, lines };
}
