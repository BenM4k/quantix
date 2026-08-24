import {
  boolean,
  integer,
  pgTable,
  text,
  uuid,
  unique,
  index,
  date,
} from "drizzle-orm/pg-core";
import { money, organizationColumn, timestamps, uuidPk } from "./shared.schema";
import {
  journalSourceTypeEnum,
  journalStatusEnum,
  ledgerAccountTypeEnum,
  normalBalanceEnum,
} from "./tables.enums";

/* ============================================================
 * Chart of Accounts
 * ============================================================ */

export const ledgerAccount = pgTable(
  "ledger_account",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    code: text("code").notNull(),

    name: text("name").notNull(),

    type: ledgerAccountTypeEnum("type").notNull(),

    normalBalance: normalBalanceEnum("normal_balance").notNull().default("debit"),

    parentAccountId: uuid("parent_account_id"),

    isBankAccount: boolean("is_bank_account").notNull().default(false),

    // Future:
    // department dimension
    departmentId: uuid("department_id"),

    isActive: boolean("is_active").notNull().default(true),

    ...timestamps(),
  },
  (table) => [
    unique("ledger_account_org_code_unique").on(
      table.organizationId,
      table.code,
    ),

    unique("ledger_account_org_id_unique").on(table.organizationId, table.id),

    index("ledger_account_org_idx").on(table.organizationId),

    index("ledger_account_type_idx").on(table.organizationId, table.type),

    index("ledger_account_active_idx").on(table.organizationId, table.isActive),

    index("ledger_account_parent_idx").on(table.parentAccountId),
  ],
);

/* ============================================================
 * Journal Entry
 *
 * Immutable accounting document.
 *
 * Void = reversing entry.
 * Never update/delete posted entries.
 * ============================================================ */

export const journalEntry = pgTable(
  "journal_entry",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    fiscalPeriodId: uuid("fiscal_period_id").notNull(),

    entryNumber: text("entry_number").notNull(),

    entryDate: date("entry_date").notNull(),

    memo: text("memo"),

    sourceType: journalSourceTypeEnum("source_type").notNull(),

    sourceId: uuid("source_id"),

    reversalOfEntryId: uuid("reversal_of_entry_id"),

    status: journalStatusEnum("status").notNull().default("posted"),

    createdBy: text("created_by").notNull(),

    ...timestamps(),
  },
  (table) => [
    unique("journal_entry_org_number_unique").on(
      table.organizationId,
      table.entryNumber,
    ),

    unique("journal_entry_org_id_unique").on(table.organizationId, table.id),

    index("journal_entry_org_date_idx").on(
      table.organizationId,
      table.entryDate,
    ),

    index("journal_entry_status_idx").on(table.organizationId, table.status),

    index("journal_entry_source_idx").on(table.sourceType, table.sourceId),

    index("journal_entry_reversal_idx").on(table.reversalOfEntryId),

    index("journal_entry_period_idx").on(table.fiscalPeriodId),
  ],
);

/* ============================================================
 * Journal Lines
 *
 * Debit / Credit entries.
 *
 * Rules enforced:
 *
 * debit >= 0
 * credit >= 0
 * cannot both be positive
 * at least one must be positive
 *
 * DB CHECK constraints live separately
 * in constraints.ts
 * ============================================================ */

export const journalEntryLine = pgTable(
  "journal_entry_line",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    journalEntryId: uuid("journal_entry_id").notNull(),

    ledgerAccountId: uuid("ledger_account_id").notNull(),

    debit: money("debit").notNull().default("0"),

    credit: money("credit").notNull().default("0"),

    // Future:
    departmentId: uuid("department_id"),

    description: text("description"),

    lineOrder: integer("line_order").notNull(),

    ...timestamps(),
  },
  (table) => [
    unique("journal_line_org_id_unique").on(table.organizationId, table.id),

    index("journal_line_entry_idx").on(table.journalEntryId, table.lineOrder),

    index("journal_line_account_idx").on(
      table.organizationId,
      table.ledgerAccountId,
    ),

    index("journal_line_department_idx").on(table.departmentId),
  ],
);

/* ============================================================
 * Bank Account
 *
 * Maps a real bank account to GL.
 * ============================================================ */

export const bankAccount = pgTable(
  "bank_account",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    ledgerAccountId: uuid("ledger_account_id").notNull(),

    name: text("name").notNull(),

    accountNumberMasked: text("account_number_masked"),

    openingBalance: money("opening_balance").notNull().default("0"),

    ...timestamps(),
  },
  (table) => [
    unique("bank_account_org_ledger_unique").on(
      table.organizationId,
      table.ledgerAccountId,
    ),

    unique("bank_account_org_id_unique").on(table.organizationId, table.id),

    index("bank_account_org_idx").on(table.organizationId),
  ],
);

/* ============================================================
 * Types
 * ============================================================ */

export type LedgerAccount = typeof ledgerAccount.$inferSelect;

export type NewLedgerAccount = typeof ledgerAccount.$inferInsert;

export type JournalEntry = typeof journalEntry.$inferSelect;

export type NewJournalEntry = typeof journalEntry.$inferInsert;

export type JournalEntryLine = typeof journalEntryLine.$inferSelect;

export type NewJournalEntryLine = typeof journalEntryLine.$inferInsert;

export type BankAccount = typeof bankAccount.$inferSelect;

export type NewBankAccount = typeof bankAccount.$inferInsert;
