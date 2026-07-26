import "server-only";

import { eq, and, sql } from "drizzle-orm";
import type { Tx } from "@/services/drizzle";
import {
  invoice,
  invoiceLine,
  payment,
  type NewInvoice,
  type NewInvoiceLine,
  type NewPayment,
  type Invoice,
  type InvoiceLine,
  type Payment,
} from "@/services/drizzle/schemas";

export async function insertInvoice(
  tx: Tx,
  data: Omit<NewInvoice, "id" | "createdAt" | "updatedAt">,
): Promise<Invoice> {
  const [created] = await tx.insert(invoice).values(data).returning();
  return created;
}

export async function insertInvoiceLines(
  tx: Tx,
  lines: Omit<NewInvoiceLine, "id" | "createdAt" | "updatedAt">[],
): Promise<InvoiceLine[]> {
  if (lines.length === 0) return [];
  return tx.insert(invoiceLine).values(lines).returning();
}

export async function updateInvoice(
  tx: Tx,
  organizationId: string,
  id: string,
  data: Partial<NewInvoice>,
): Promise<Invoice | null> {
  const [updated] = await tx
    .update(invoice)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(invoice.id, id), eq(invoice.organizationId, organizationId)))
    .returning();
  return updated ?? null;
}

export async function updateInvoiceJournalEntry(
  tx: Tx,
  organizationId: string,
  id: string,
  journalEntryId: string,
): Promise<Invoice | null> {
  return updateInvoice(tx, organizationId, id, { journalEntryId });
}

export async function updateInvoicePdfUrl(
  tx: Tx,
  organizationId: string,
  id: string,
  pdfUrl: string,
): Promise<Invoice | null> {
  return updateInvoice(tx, organizationId, id, { pdfUrl });
}

export async function insertPayment(
  tx: Tx,
  data: Omit<NewPayment, "id" | "createdAt" | "updatedAt">,
): Promise<Payment> {
  const [created] = await tx.insert(payment).values(data).returning();
  return created;
}

export async function getInvoicePaymentTotal(
  tx: Tx,
  organizationId: string,
  invoiceId: string,
): Promise<number> {
  const [res] = await tx
    .select({ total: sql<string>`COALESCE(SUM(amount), 0)::text` })
    .from(payment)
    .where(and(eq(payment.invoiceId, invoiceId), eq(payment.organizationId, organizationId)));

  return Number(res?.total ?? 0);
}
