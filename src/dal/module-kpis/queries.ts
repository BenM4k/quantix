import "server-only";

import { eq, and, inArray, count, sum, lte, gte, sql } from "drizzle-orm";
import type { Tx } from "@/services/drizzle";
import { invoice, salesOrder, product, customer, quote } from "@/services/drizzle/schemas";

// ─── Invoice KPIs ─────────────────────────────────────────────────────────────
export type InvoiceKpis = {
  totalRevenue: number;
  outstanding: number;
  paidThisMonth: number;
  overdueCount: number;
};

export async function getInvoiceKpis(tx: Tx, organizationId: string): Promise<InvoiceKpis> {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  const [totalRev, outstanding, paidMonth, overdueRows] = await Promise.all([
    tx.select({ v: sum(invoice.total) }).from(invoice)
      .where(and(eq(invoice.organizationId, organizationId), eq(invoice.status, "paid"))),
    tx.select({ v: sum(invoice.total) }).from(invoice)
      .where(and(eq(invoice.organizationId, organizationId), inArray(invoice.status, ["unpaid", "sent", "partial"]))),
    tx.select({ v: sum(invoice.total) }).from(invoice)
      .where(and(eq(invoice.organizationId, organizationId), eq(invoice.status, "paid"), gte(invoice.issueDate, firstOfMonth))),
    tx.select({ v: count() }).from(invoice)
      .where(and(eq(invoice.organizationId, organizationId), inArray(invoice.status, ["unpaid", "sent", "partial"]), lte(invoice.dueDate, today))),
  ]);

  return {
    totalRevenue: Number(totalRev[0]?.v ?? 0),
    outstanding: Number(outstanding[0]?.v ?? 0),
    paidThisMonth: Number(paidMonth[0]?.v ?? 0),
    overdueCount: Number(overdueRows[0]?.v ?? 0),
  };
}

// ─── Customer KPIs ────────────────────────────────────────────────────────────
export type CustomerKpis = {
  total: number;
  active: number;
  avgPaymentTerms: number;
};

export async function getCustomerKpis(tx: Tx, organizationId: string): Promise<CustomerKpis> {
  const [total, active, avgTerms] = await Promise.all([
    tx.select({ v: count() }).from(customer).where(eq(customer.organizationId, organizationId)),
    tx.select({ v: count() }).from(customer).where(and(eq(customer.organizationId, organizationId), eq(customer.active, true))),
    tx.select({ v: sql<number>`COALESCE(AVG(${customer.paymentTermsDays}), 0)::integer` }).from(customer)
      .where(and(eq(customer.organizationId, organizationId), eq(customer.active, true))),
  ]);
  return {
    total: Number(total[0]?.v ?? 0),
    active: Number(active[0]?.v ?? 0),
    avgPaymentTerms: Number(avgTerms[0]?.v ?? 0),
  };
}

// ─── Order KPIs ───────────────────────────────────────────────────────────────
export type OrderKpis = {
  total: number;
  confirmed: number;
  converted: number;
  cancelled: number;
};

export async function getOrderKpis(tx: Tx, organizationId: string): Promise<OrderKpis> {
  const [total, confirmed, converted, cancelled] = await Promise.all([
    tx.select({ v: count() }).from(salesOrder).where(eq(salesOrder.organizationId, organizationId)),
    tx.select({ v: count() }).from(salesOrder).where(and(eq(salesOrder.organizationId, organizationId), eq(salesOrder.status, "confirmed"))),
    tx.select({ v: count() }).from(salesOrder).where(and(eq(salesOrder.organizationId, organizationId), eq(salesOrder.status, "converted"))),
    tx.select({ v: count() }).from(salesOrder).where(and(eq(salesOrder.organizationId, organizationId), eq(salesOrder.status, "cancelled"))),
  ]);
  return {
    total: Number(total[0]?.v ?? 0),
    confirmed: Number(confirmed[0]?.v ?? 0),
    converted: Number(converted[0]?.v ?? 0),
    cancelled: Number(cancelled[0]?.v ?? 0),
  };
}

// ─── Quote KPIs ───────────────────────────────────────────────────────────────
export type QuoteKpis = {
  total: number;
  accepted: number;
  pending: number;
  expired: number;
};

export async function getQuoteKpis(tx: Tx, organizationId: string): Promise<QuoteKpis> {
  const [total, accepted, pending, expired] = await Promise.all([
    tx.select({ v: count() }).from(quote).where(eq(quote.organizationId, organizationId)),
    tx.select({ v: count() }).from(quote).where(and(eq(quote.organizationId, organizationId), eq(quote.status, "accepted"))),
    tx.select({ v: count() }).from(quote).where(and(eq(quote.organizationId, organizationId), inArray(quote.status, ["draft", "sent"]))),
    tx.select({ v: count() }).from(quote).where(and(eq(quote.organizationId, organizationId), eq(quote.status, "expired"))),
  ]);
  return {
    total: Number(total[0]?.v ?? 0),
    accepted: Number(accepted[0]?.v ?? 0),
    pending: Number(pending[0]?.v ?? 0),
    expired: Number(expired[0]?.v ?? 0),
  };
}

// ─── Product KPIs ─────────────────────────────────────────────────────────────
export type ProductKpis = {
  total: number;
  active: number;
};

export async function getProductKpis(tx: Tx, organizationId: string): Promise<ProductKpis> {
  const [total, active] = await Promise.all([
    tx.select({ v: count() }).from(product).where(eq(product.organizationId, organizationId)),
    tx.select({ v: count() }).from(product).where(and(eq(product.organizationId, organizationId), eq(product.active, true))),
  ]);
  return {
    total: Number(total[0]?.v ?? 0),
    active: Number(active[0]?.v ?? 0),
  };
}
