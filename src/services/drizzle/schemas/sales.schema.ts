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

import {
  invoiceStatusEnum,
  paymentMethodEnum,
  quoteStatusEnum,
  orderStatusEnum,
} from "./tables.enums";

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
 * Quote
 *
 * Freely editable while draft/sent.
 * No ledger impact.
 * ============================================================ */

export const quote = pgTable(
  "quote",
  {
    id: uuidPk(),
    organizationId: organizationColumn(),
    customerId: uuid("customer_id").notNull(),
    quoteNumber: text("quote_number").notNull(),
    quoteDate: date("quote_date").notNull(),
    expiryDate: date("expiry_date"),
    status: quoteStatusEnum("status").notNull().default("draft"),
    subtotal: money("subtotal").notNull().default("0"),
    taxTotal: money("tax_total").notNull().default("0"),
    total: money("total").notNull().default("0"),
    notes: text("notes"),
    createdBy: uuid("created_by").notNull(),
    ...timestamps(),
  },
  (table) => [
    unique("quote_org_number_unique").on(table.organizationId, table.quoteNumber),
    unique("quote_org_id_unique").on(table.organizationId, table.id),
    index("quote_org_idx").on(table.organizationId),
    index("quote_customer_idx").on(table.organizationId, table.customerId),
    index("quote_status_idx").on(table.organizationId, table.status),
  ],
);

/* ============================================================
 * Quote Lines
 *
 * Snapshot of line items at the time of the quote.
 * ============================================================ */

export const quoteLine = pgTable(
  "quote_line",
  {
    id: uuidPk(),
    organizationId: organizationColumn(),
    quoteId: uuid("quote_id").notNull(),
    productId: uuid("product_id").notNull(),
    description: text("description").notNull(),
    quantity: quantity("quantity").notNull(),
    unitPrice: money("unit_price").notNull(),
    taxRateId: uuid("tax_rate_id"),
    taxAmount: money("tax_amount").notNull().default("0"),
    lineTotal: money("line_total").notNull(),
    lineOrder: integer("line_order").notNull(),
    ...timestamps(),
  },
  (table) => [
    unique("quote_line_org_id_unique").on(table.organizationId, table.id),
    index("quote_line_quote_idx").on(table.quoteId, table.lineOrder),
    index("quote_line_product_idx").on(table.organizationId, table.productId),
  ],
);

/* ============================================================
 * Sales Order
 *
 * Freely editable while draft/confirmed.
 * No ledger impact.
 * ============================================================ */

export const salesOrder = pgTable(
  "sales_order",
  {
    id: uuidPk(),
    organizationId: organizationColumn(),
    customerId: uuid("customer_id").notNull(),
    orderNumber: text("order_number").notNull(),
    orderDate: date("order_date").notNull(),
    status: orderStatusEnum("status").notNull().default("draft"),
    /*
     * Traceability only — not a live data dependency.
     * Lines are copied at conversion time.
     */
    sourceQuoteId: uuid("source_quote_id"),
    subtotal: money("subtotal").notNull().default("0"),
    taxTotal: money("tax_total").notNull().default("0"),
    total: money("total").notNull().default("0"),
    notes: text("notes"),
    createdBy: uuid("created_by").notNull(),
    ...timestamps(),
  },
  (table) => [
    unique("sales_order_org_number_unique").on(table.organizationId, table.orderNumber),
    unique("sales_order_org_id_unique").on(table.organizationId, table.id),
    index("sales_order_org_idx").on(table.organizationId),
    index("sales_order_customer_idx").on(table.organizationId, table.customerId),
    index("sales_order_status_idx").on(table.organizationId, table.status),
    index("sales_order_quote_idx").on(table.organizationId, table.sourceQuoteId),
  ],
);

/* ============================================================
 * Sales Order Lines
 *
 * Snapshot of line items at conversion time.
 * ============================================================ */

export const salesOrderLine = pgTable(
  "sales_order_line",
  {
    id: uuidPk(),
    organizationId: organizationColumn(),
    orderId: uuid("order_id").notNull(),
    productId: uuid("product_id").notNull(),
    description: text("description").notNull(),
    quantity: quantity("quantity").notNull(),
    unitPrice: money("unit_price").notNull(),
    taxRateId: uuid("tax_rate_id"),
    taxAmount: money("tax_amount").notNull().default("0"),
    lineTotal: money("line_total").notNull(),
    lineOrder: integer("line_order").notNull(),
    ...timestamps(),
  },
  (table) => [
    unique("sales_order_line_org_id_unique").on(table.organizationId, table.id),
    index("sales_order_line_order_idx").on(table.orderId, table.lineOrder),
    index("sales_order_line_product_idx").on(table.organizationId, table.productId),
  ],
);

/* ============================================================
 * Invoice
 *
 * Accounting document.
 * Once posted: immutable.
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
    status: invoiceStatusEnum("status").notNull().default("unpaid"),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    subtotal: money("subtotal").notNull().default("0"),
    taxTotal: money("tax_total").notNull().default("0"),
    total: money("total").notNull().default("0"),
    /* Created after accounting posting. */
    journalEntryId: uuid("journal_entry_id"),
    /* Traceability to source order — not a live data dependency. */
    sourceOrderId: uuid("source_order_id"),
    /* Populated by Inngest job after transaction commit. */
    pdfUrl: text("pdf_url"),
    sentAt: timestamp("sent_at", { withTimezone: true, mode: "date" }),
    notes: text("notes"),
    createdBy: uuid("created_by").notNull(),
    ...timestamps(),
  },
  (table) => [
    unique("invoice_org_number_unique").on(table.organizationId, table.invoiceNumber),
    unique("invoice_org_id_unique").on(table.organizationId, table.id),
    index("invoice_customer_idx").on(table.organizationId, table.customerId),
    index("invoice_status_idx").on(table.organizationId, table.status),
    /* AR aging — unpaid invoices ordered by due date */
    index("invoice_outstanding_idx").on(table.organizationId, table.status, table.dueDate),
    index("invoice_period_idx").on(table.fiscalPeriodId),
    index("invoice_source_order_idx").on(table.organizationId, table.sourceOrderId),
  ],
);

/* ============================================================
 * Invoice Lines
 *
 * Snapshot of sale.
 * Product can change later — invoice keeps historical values.
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
    taxAmount: money("tax_amount").notNull().default("0"),
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
 * MVP: One payment -> one invoice
 * Future: payment_allocation table
 * ============================================================ */

export const payment = pgTable(
  "payment",
  {
    id: uuidPk(),
    organizationId: organizationColumn(),
    invoiceId: uuid("invoice_id").notNull(),
    amount: money("amount").notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true, mode: "date" })
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
 * Future-ready. Reverse invoice value.
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

export type Quote = typeof quote.$inferSelect;
export type NewQuote = typeof quote.$inferInsert;

export type QuoteLine = typeof quoteLine.$inferSelect;
export type NewQuoteLine = typeof quoteLine.$inferInsert;

export type SalesOrder = typeof salesOrder.$inferSelect;
export type NewSalesOrder = typeof salesOrder.$inferInsert;

export type SalesOrderLine = typeof salesOrderLine.$inferSelect;
export type NewSalesOrderLine = typeof salesOrderLine.$inferInsert;

export type Invoice = typeof invoice.$inferSelect;
export type NewInvoice = typeof invoice.$inferInsert;

export type InvoiceLine = typeof invoiceLine.$inferSelect;
export type NewInvoiceLine = typeof invoiceLine.$inferInsert;

export type Payment = typeof payment.$inferSelect;
export type NewPayment = typeof payment.$inferInsert;

export type CreditNote = typeof creditNote.$inferSelect;
export type NewCreditNote = typeof creditNote.$inferInsert;
