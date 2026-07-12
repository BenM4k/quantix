import { pgEnum } from "drizzle-orm/pg-core";

/* ============================================================
 * Company
 * ============================================================ */

export const fiscalYearStatusEnum = pgEnum("fiscal_year_status", [
  "open",
  "closed",
]);

export const fiscalPeriodStatusEnum = pgEnum("fiscal_period_status", [
  "open",
  "closed",
]);

/* ============================================================
 * Accounting
 * ============================================================ */

export const ledgerAccountTypeEnum = pgEnum("ledger_account_type", [
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense",
]);

export const journalStatusEnum = pgEnum("journal_status", ["posted", "void"]);

export const journalSourceTypeEnum = pgEnum("journal_source_type", [
  "invoice",
  "payment",
  "manual",
  "stock_adjustment",
  "payroll",
]);

/* ============================================================
 * Inventory
 * ============================================================ */

export const stockMovementTypeEnum = pgEnum("stock_movement_type", [
  "sale",
  "purchase_receipt",
  "adjustment",
  "transfer_in",
  "transfer_out",
  "initial",
]);

/* ============================================================
 * Sales
 * ============================================================ */

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "partial",
  "paid",
  "void",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "bank_transfer",
  "cash",
  "card",
  "other",
]);

/* ============================================================
 * Audit
 * ============================================================ */

export const auditActionEnum = pgEnum("audit_action", [
  "create",
  "update",
  "delete",
]);
