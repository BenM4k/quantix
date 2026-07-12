import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  uuid,
  unique,
  index,
  timestamp,
} from "drizzle-orm/pg-core";

import {
  uuidPk,
  money,
  quantity,
  timestamps,
  organizationColumn,
} from "./shared.schema";

import { invoiceStatusEnum, paymentMethodEnum } from "./tables.enums";

/* ============================================================
 * Customer
 * ============================================================ */

export const customer = pgTable(
  "customer",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    name: text("name").notNull(),

    email: text("email"),

    phone: text("phone"),

    taxId: text("tax_id"),

    paymentTermsDays: integer("payment_terms_days").notNull().default(0),

    active: boolean("active").notNull().default(true),

    ...timestamps(),
  },
  (table) => [
    unique("customer_org_id_unique").on(table.organizationId, table.id),

    index("customer_org_idx").on(table.organizationId),

    index("customer_active_idx").on(table.organizationId, table.active),

    index("customer_email_idx").on(table.organizationId, table.email),
  ],
);

/* ============================================================
 * Invoice
 *
 * Accounting document.
 *
 * Once posted:
 * immutable.
 *
 * Void creates reversal.
 * ============================================================ */

export const invoice = pgTable(
  "invoice",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    customerId: uuid("customer_id").notNull(),

    fiscalPeriodId: uuid("fiscal_period_id").notNull(),

    invoiceNumber: text("invoice_number").notNull(),

    status: invoiceStatusEnum("status").notNull().default("draft"),

    issueDate: date("issue_date").notNull(),

    dueDate: date("due_date").notNull(),

    subtotal: money("subtotal").notNull().default("0"),

    taxTotal: money("tax_total").notNull().default("0"),

    total: money("total").notNull().default("0"),

    /*
     * Created after accounting posting.
     */
    journalEntryId: uuid("journal_entry_id"),

    createdBy: uuid("created_by").notNull(),

    ...timestamps(),
  },
  (table) => [
    unique("invoice_org_number_unique").on(
      table.organizationId,
      table.invoiceNumber,
    ),

    unique("invoice_org_id_unique").on(table.organizationId, table.id),

    index("invoice_customer_idx").on(table.organizationId, table.customerId),

    index("invoice_status_idx").on(table.organizationId, table.status),

    /*
     * AR aging queries:
     *
     * unpaid invoices
     * ordered by due date
     */
    index("invoice_outstanding_idx").on(
      table.organizationId,
      table.status,
      table.dueDate,
    ),

    index("invoice_period_idx").on(table.fiscalPeriodId),
  ],
);

/* ============================================================
 * Invoice Lines
 *
 * Snapshot of sale.
 *
 * Product can change later.
 * Invoice keeps historical values.
 * ============================================================ */

export const invoiceLine = pgTable(
  "invoice_line",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    invoiceId: uuid("invoice_id").notNull(),

    productId: uuid("product_id").notNull(),

    description: text("description").notNull(),

    quantity: quantity("quantity").notNull(),

    unitPrice: money("unit_price").notNull(),

    taxRateId: uuid("tax_rate_id"),

    lineTotal: money("line_total").notNull(),

    lineOrder: integer("line_order").notNull(),

    ...timestamps(),
  },
  (table) => [
    unique("invoice_line_org_id_unique").on(table.organizationId, table.id),

    index("invoice_line_invoice_idx").on(table.invoiceId, table.lineOrder),

    index("invoice_line_product_idx").on(table.organizationId, table.productId),
  ],
);

/* ============================================================
 * Payment
 *
 * MVP:
 *
 * One payment -> one invoice
 *
 * Future:
 * payment_allocation table
 * ============================================================ */

export const payment = pgTable(
  "payment",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    invoiceId: uuid("invoice_id").notNull(),

    amount: money("amount").notNull(),

    paidAt: timestamp("paid_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    method: paymentMethodEnum("method").notNull(),

    journalEntryId: uuid("journal_entry_id"),

    createdBy: uuid("created_by").notNull(),

    ...timestamps(),
  },
  (table) => [
    unique("payment_org_id_unique").on(table.organizationId, table.id),

    index("payment_invoice_idx").on(table.organizationId, table.invoiceId),

    index("payment_date_idx").on(table.organizationId, table.paidAt),
  ],
);

/* ============================================================
 * Credit Note
 *
 * Future-ready.
 *
 * Reverse invoice value.
 * ============================================================ */

export const creditNote = pgTable(
  "credit_note",
  {
    id: uuidPk(),

    organizationId: organizationColumn(),

    invoiceId: uuid("invoice_id").notNull(),

    amount: money("amount").notNull(),

    reason: text("reason").notNull(),

    journalEntryId: uuid("journal_entry_id"),

    createdBy: uuid("created_by").notNull(),

    ...timestamps(),
  },
  (table) => [
    unique("credit_note_org_id_unique").on(table.organizationId, table.id),

    index("credit_note_invoice_idx").on(table.organizationId, table.invoiceId),
  ],
);

/* ============================================================
 * Types
 * ============================================================ */

export type Customer = typeof customer.$inferSelect;

export type NewCustomer = typeof customer.$inferInsert;

export type Invoice = typeof invoice.$inferSelect;

export type NewInvoice = typeof invoice.$inferInsert;

export type InvoiceLine = typeof invoiceLine.$inferSelect;

export type NewInvoiceLine = typeof invoiceLine.$inferInsert;

export type Payment = typeof payment.$inferSelect;

export type NewPayment = typeof payment.$inferInsert;

export type CreditNote = typeof creditNote.$inferSelect;

export type NewCreditNote = typeof creditNote.$inferInsert;
