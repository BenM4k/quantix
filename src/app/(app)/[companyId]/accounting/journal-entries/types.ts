import { JournalEntry } from "@/services/drizzle/schemas";

export interface EntryWithTotals extends JournalEntry {
  totalDebit: string;
  totalCredit: string;
}

export interface JournalEntryDetailLine {
  id: string;
  accountCode: string;
  accountName: string;
  debit: string;
  credit: string;
  description: string | null;
}

export interface JournalEntryDetail {
  id: string;
  entryNumber: string;
  entryDate: string;
  memo: string | null;
  sourceType: string;
  sourceId: string | null;
  reversalOfEntryId: string | null;
  originalEntryNumber: string | null;
  reversedByEntryId: string | null;
  reversedByEntryNumber: string | null;
  lines: JournalEntryDetailLine[];
}
