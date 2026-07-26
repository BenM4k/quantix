import "server-only";

import { eq, and, ilike, count, desc, asc, gte, lte, sql } from "drizzle-orm";
import type { Tx } from "@/services/drizzle";
import {
  invoice,
  invoiceLine,
  customer,
  payment,
  salesOrder,
  taxRate,
  ledgerAccount,
  bankAccount,
  type Invoice,
  type InvoiceLine,
  type Payment,
  type TaxRate,
  type LedgerAccount,
} from "@/services/drizzle/schemas";

export type InvoicePaginationParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
};

export type InvoiceWithCustomerAndPaid = Invoice & {
  customerName: string;
  amountPaid: string;
  sourceOrderNumber: string | null;
};

export async function getPaginatedInvoices(
  tx: Tx,
  organizationId: string,
  params: InvoicePaginationParams,
): Promise<{ rows: InvoiceWithCustomerAndPaid[]; total: number }> {
  const { page = 1, limit = 50, search, status, customerId, startDate, endDate } = params;
  const offset = (page - 1) * limit;

  const conditions = [eq(invoice.organizationId, organizationId)];

  if (status && status !== "all") {
    conditions.push(eq(invoice.status, status as Invoice["status"]));
  }
  if (customerId && customerId !== "all") {
    conditions.push(eq(invoice.customerId, customerId));
  }
  if (startDate) {
    conditions.push(gte(invoice.issueDate, startDate));
  }
  if (endDate) {
    conditions.push(lte(invoice.issueDate, endDate));
  }
  if (search && search.trim() !== "") {
    conditions.push(ilike(invoice.invoiceNumber, `%${search.trim()}%`));
  }

  const where = and(...conditions);

  const [{ total: totalCount }] = await tx
    .select({ total: count() })
    .from(invoice)
    .where(where);

  // Subquery or aggregation for amount paid
  const rows = await tx
    .select({
      id: invoice.id,
      organizationId: invoice.organizationId,
      customerId: invoice.customerId,
      fiscalPeriodId: invoice.fiscalPeriodId,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      subtotal: invoice.subtotal,
      taxTotal: invoice.taxTotal,
      total: invoice.total,
      journalEntryId: invoice.journalEntryId,
      sourceOrderId: invoice.sourceOrderId,
      pdfUrl: invoice.pdfUrl,
      sentAt: invoice.sentAt,
      notes: invoice.notes,
      createdBy: invoice.createdBy,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      customerName: customer.name,
      sourceOrderNumber: salesOrder.orderNumber,
      amountPaid: sql<string>`COALESCE((SELECT SUM(amount) FROM ${payment} WHERE ${payment.invoiceId} = ${invoice.id} AND ${payment.organizationId} = ${organizationId}), 0)::text`,
    })
    .from(invoice)
    .leftJoin(customer, and(eq(customer.id, invoice.customerId), eq(customer.organizationId, organizationId)))
    .leftJoin(salesOrder, and(eq(salesOrder.id, invoice.sourceOrderId), eq(salesOrder.organizationId, organizationId)))
    .where(where)
    .orderBy(desc(invoice.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    rows: rows.map((r) => ({
      ...r,
      customerName: r.customerName ?? "Unknown",
      sourceOrderNumber: r.sourceOrderNumber ?? null,
      amountPaid: r.amountPaid ?? "0",
    })),
    total: Number(totalCount),
  };
}

export type InvoiceDetailWithLines = Invoice & {
  lines: InvoiceLine[];
  payments: Payment[];
  customerName: string;
  customerEmail: string | null;
  sourceOrderNumber: string | null;
  amountPaid: string;
};

export async function getInvoiceDetailById(
  tx: Tx,
  organizationId: string,
  id: string,
): Promise<InvoiceDetailWithLines | null> {
  const [inv] = await tx
    .select({
      id: invoice.id,
      organizationId: invoice.organizationId,
      customerId: invoice.customerId,
      fiscalPeriodId: invoice.fiscalPeriodId,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      subtotal: invoice.subtotal,
      taxTotal: invoice.taxTotal,
      total: invoice.total,
      journalEntryId: invoice.journalEntryId,
      sourceOrderId: invoice.sourceOrderId,
      pdfUrl: invoice.pdfUrl,
      sentAt: invoice.sentAt,
      notes: invoice.notes,
      createdBy: invoice.createdBy,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      customerName: customer.name,
      customerEmail: customer.email,
      sourceOrderNumber: salesOrder.orderNumber,
      amountPaid: sql<string>`COALESCE((SELECT SUM(amount) FROM ${payment} WHERE ${payment.invoiceId} = ${invoice.id} AND ${payment.organizationId} = ${organizationId}), 0)::text`,
    })
    .from(invoice)
    .leftJoin(customer, and(eq(customer.id, invoice.customerId), eq(customer.organizationId, organizationId)))
    .leftJoin(salesOrder, and(eq(salesOrder.id, invoice.sourceOrderId), eq(salesOrder.organizationId, organizationId)))
    .where(and(eq(invoice.id, id), eq(invoice.organizationId, organizationId)))
    .limit(1);

  if (!inv) return null;

  const lines = await tx
    .select()
    .from(invoiceLine)
    .where(and(eq(invoiceLine.invoiceId, id), eq(invoiceLine.organizationId, organizationId)))
    .orderBy(asc(invoiceLine.lineOrder));

  const payments = await tx
    .select()
    .from(payment)
    .where(and(eq(payment.invoiceId, id), eq(payment.organizationId, organizationId)))
    .orderBy(desc(payment.createdAt));

  return {
    ...inv,
    lines,
    payments,
    customerName: inv.customerName ?? "Unknown",
    customerEmail: inv.customerEmail ?? null,
    sourceOrderNumber: inv.sourceOrderNumber ?? null,
    amountPaid: inv.amountPaid ?? "0",
  };
}

export async function getTaxRateById(
  tx: Tx,
  organizationId: string,
  taxRateId: string,
): Promise<TaxRate | null> {
  const [tr] = await tx
    .select()
    .from(taxRate)
    .where(and(eq(taxRate.id, taxRateId), eq(taxRate.organizationId, organizationId)))
    .limit(1);
  return tr ?? null;
}

export async function getLedgerAccountByCode(
  tx: Tx,
  organizationId: string,
  code: string,
): Promise<LedgerAccount | null> {
  const [acc] = await tx
    .select()
    .from(ledgerAccount)
    .where(and(eq(ledgerAccount.code, code), eq(ledgerAccount.organizationId, organizationId)))
    .limit(1);
  return acc ?? null;
}

export async function getPrimaryBankAccount(
  tx: Tx,
  organizationId: string,
): Promise<LedgerAccount | null> {
  // First try finding bankAccount record linked to ledgerAccount
  const [bankAcc] = await tx
    .select({
      id: ledgerAccount.id,
      organizationId: ledgerAccount.organizationId,
      code: ledgerAccount.code,
      name: ledgerAccount.name,
      type: ledgerAccount.type,
      normalBalance: ledgerAccount.normalBalance,
      parentAccountId: ledgerAccount.parentAccountId,
      isBankAccount: ledgerAccount.isBankAccount,
      departmentId: ledgerAccount.departmentId,
      isActive: ledgerAccount.isActive,
      createdAt: ledgerAccount.createdAt,
      updatedAt: ledgerAccount.updatedAt,
    })
    .from(bankAccount)
    .innerJoin(ledgerAccount, eq(ledgerAccount.id, bankAccount.ledgerAccountId))
    .where(eq(bankAccount.organizationId, organizationId))
    .limit(1);

  if (bankAcc) return bankAcc;

  // Fallback to any active account where isBankAccount is true
  const [fallback] = await tx
    .select()
    .from(ledgerAccount)
    .where(
      and(
        eq(ledgerAccount.organizationId, organizationId),
        eq(ledgerAccount.isBankAccount, true),
        eq(ledgerAccount.isActive, true),
      ),
    )
    .limit(1);

  return fallback ?? null;
}
