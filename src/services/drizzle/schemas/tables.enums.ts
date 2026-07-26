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

export const normalBalanceEnum = pgEnum("normal_balance", [
  "debit",
  "credit",
]);

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
  "adjustment",
  "stock_adjustment",
  "payroll",
]);

/* ============================================================
 * Inventory
 * ============================================================ */

export const stockMovementTypeEnum = pgEnum("stock_movement_type", [
  "initial",
  "adjustment_in",
  "adjustment_out",
  "sale",
  "sale_reversal",
]);

/* ============================================================
 * Sales
 * ============================================================ */

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "unpaid",
  "draft",
  "sent",
  "partial",
  "paid",
  "void",
]);

export const quoteStatusEnum = pgEnum("quote_status", [
  "draft",
  "sent",
  "accepted",
  "declined",
  "expired",
  "converted",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "draft",
  "confirmed",
  "converted",
  "cancelled",
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

export type FiscalYearStatus = (typeof fiscalYearStatusEnum.enumValues)[number];
export type FiscalPeriodStatus = (typeof fiscalPeriodStatusEnum.enumValues)[number];
export type NormalBalance = (typeof normalBalanceEnum.enumValues)[number];
export type LedgerAccountType = (typeof ledgerAccountTypeEnum.enumValues)[number];
export type JournalStatus = (typeof journalStatusEnum.enumValues)[number];
export type JournalSourceType = (typeof journalSourceTypeEnum.enumValues)[number];
export type StockMovementType = (typeof stockMovementTypeEnum.enumValues)[number];
export type InvoiceStatus = (typeof invoiceStatusEnum.enumValues)[number];
export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];
export type AuditAction = (typeof auditActionEnum.enumValues)[number];
export type QuoteStatus = (typeof quoteStatusEnum.enumValues)[number];
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
