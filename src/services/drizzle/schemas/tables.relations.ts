import { defineRelations } from "drizzle-orm";
import * as auth from "./auth.schema";
import * as company from "./company.schema";
import * as accounting from "./accounting.schema";
import * as inventory from "./inventory.schema";
import * as sales from "./sales.schema";
import * as audit from "./audit.schema";
import * as future from "./future.schema";

const schema = {
  ...auth,
  ...company,
  ...accounting,
  ...inventory,
  ...sales,
  ...audit,
  ...future,
};

export const relations = defineRelations(schema, (r) => ({
  /* --------------------------------------------------------
   * Better Auth — Organization
   * -------------------------------------------------------- */
  organization: {
    profile: r.one.companyProfile({
      from: r.organization.id,
      to: r.companyProfile.organizationId,
    }),
    features: r.many.companyFeature(),
    fiscalYears: r.many.fiscalYear(),
    sequences: r.many.numberingSequence(),
    taxRates: r.many.taxRate(),
    ledgerAccounts: r.many.ledgerAccount(),
    journalEntries: r.many.journalEntry(),
    warehouses: r.many.warehouse(),
    products: r.many.product(),
    customers: r.many.customer(),
    invoices: r.many.invoice(),
    auditLogs: r.many.auditLog(),
  },

  /* --------------------------------------------------------
   * Company
   * -------------------------------------------------------- */
  companyProfile: {
    organization: r.one.organization({
      from: r.companyProfile.organizationId,
      to: r.organization.id,
    }),
  },

  companyFeature: {
    organization: r.one.organization({
      from: r.companyFeature.organizationId,
      to: r.organization.id,
    }),
  },

  fiscalYear: {
    organization: r.one.organization({
      from: r.fiscalYear.organizationId,
      to: r.organization.id,
    }),
    periods: r.many.fiscalPeriod(),
  },

  fiscalPeriod: {
    organization: r.one.organization({
      from: r.fiscalPeriod.organizationId,
      to: r.organization.id,
    }),
    fiscalYear: r.one.fiscalYear({
      from: r.fiscalPeriod.fiscalYearId,
      to: r.fiscalYear.id,
    }),
    closedByUser: r.one.user({
      from: r.fiscalPeriod.closedBy,
      to: r.user.id,
    }),
  },

  numberingSequence: {
    organization: r.one.organization({
      from: r.numberingSequence.organizationId,
      to: r.organization.id,
    }),
  },

  taxRate: {
    organization: r.one.organization({
      from: r.taxRate.organizationId,
      to: r.organization.id,
    }),
  },

  /* --------------------------------------------------------
   * Accounting
   * -------------------------------------------------------- */
  ledgerAccount: {
    organization: r.one.organization({
      from: r.ledgerAccount.organizationId,
      to: r.organization.id,
    }),
    parent: r.one.ledgerAccount({
      from: r.ledgerAccount.parentAccountId,
      to: r.ledgerAccount.id,
    }),
    children: r.many.ledgerAccount(),
    lines: r.many.journalEntryLine(),
  },

  journalEntry: {
    organization: r.one.organization({
      from: r.journalEntry.organizationId,
      to: r.organization.id,
    }),
    lines: r.many.journalEntryLine(),
  },

  journalEntryLine: {
    journal: r.one.journalEntry({
      from: r.journalEntryLine.journalEntryId,
      to: r.journalEntry.id,
    }),
    account: r.one.ledgerAccount({
      from: r.journalEntryLine.ledgerAccountId,
      to: r.ledgerAccount.id,
    }),
  },

  bankAccount: {
    ledgerAccount: r.one.ledgerAccount({
      from: r.bankAccount.ledgerAccountId,
      to: r.ledgerAccount.id,
    }),
  },

  /* --------------------------------------------------------
   * Inventory
   * -------------------------------------------------------- */
  product: {
    organization: r.one.organization({
      from: r.product.organizationId,
      to: r.organization.id,
    }),
    stockEntries: r.many.stockLedgerEntry(),
    invoiceLines: r.many.invoiceLine(),
  },

  warehouse: {
    organization: r.one.organization({
      from: r.warehouse.organizationId,
      to: r.organization.id,
    }),
    stockEntries: r.many.stockLedgerEntry(),
    adjustments: r.many.stockAdjustment(),
  },

  stockLedgerEntry: {
    product: r.one.product({
      from: r.stockLedgerEntry.productId,
      to: r.product.id,
    }),
    warehouse: r.one.warehouse({
      from: r.stockLedgerEntry.warehouseId,
      to: r.warehouse.id,
    }),
  },

  stockAdjustment: {
    warehouse: r.one.warehouse({
      from: r.stockAdjustment.warehouseId,
      to: r.warehouse.id,
    }),
  },

  /* --------------------------------------------------------
   * Sales
   * -------------------------------------------------------- */
  customer: {
    organization: r.one.organization({
      from: r.customer.organizationId,
      to: r.organization.id,
    }),
    invoices: r.many.invoice(),
  },

  invoice: {
    organization: r.one.organization({
      from: r.invoice.organizationId,
      to: r.organization.id,
    }),
    customer: r.one.customer({
      from: r.invoice.customerId,
      to: r.customer.id,
    }),
    lines: r.many.invoiceLine(),
    payments: r.many.payment(),
    creditNotes: r.many.creditNote(),
  },

  invoiceLine: {
    invoice: r.one.invoice({
      from: r.invoiceLine.invoiceId,
      to: r.invoice.id,
    }),
    product: r.one.product({
      from: r.invoiceLine.productId,
      to: r.product.id,
    }),
  },

  payment: {
    invoice: r.one.invoice({
      from: r.payment.invoiceId,
      to: r.invoice.id,
    }),
  },

  creditNote: {
    invoice: r.one.invoice({
      from: r.creditNote.invoiceId,
      to: r.invoice.id,
    }),
  },

  /* --------------------------------------------------------
   * Audit
   * -------------------------------------------------------- */
  auditLog: {
    organization: r.one.organization({
      from: r.auditLog.organizationId,
      to: r.organization.id,
    }),
    user: r.one.user({
      from: r.auditLog.userId,
      to: r.user.id,
    }),
  },
}));
