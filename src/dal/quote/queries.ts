import "server-only";

import { eq, and, ilike, or, count, desc, asc, inArray } from "drizzle-orm";
import type { Tx } from "@/services/drizzle";
import {
  quote,
  quoteLine,
  customer,
  type Quote,
  type QuoteLine,
} from "@/services/drizzle/schemas";

export type QuotePaginationParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

export type QuoteWithCustomer = Quote & { customerName: string };

export async function getPaginatedQuotes(
  tx: Tx,
  organizationId: string,
  params: QuotePaginationParams,
): Promise<{ rows: QuoteWithCustomer[]; total: number }> {
  const { page = 1, limit = 50, search, status } = params;
  const offset = (page - 1) * limit;

  const conditions = [eq(quote.organizationId, organizationId)];

  if (status && status !== "all") {
    conditions.push(eq(quote.status, status as Quote["status"]));
  }
  if (search && search.trim() !== "") {
    conditions.push(ilike(quote.quoteNumber, `%${search.trim()}%`));
  }

  const where = and(...conditions);

  const [{ total: totalCount }] = await tx
    .select({ total: count() })
    .from(quote)
    .where(where);

  const rows = await tx
    .select({
      id: quote.id,
      organizationId: quote.organizationId,
      customerId: quote.customerId,
      quoteNumber: quote.quoteNumber,
      quoteDate: quote.quoteDate,
      expiryDate: quote.expiryDate,
      status: quote.status,
      subtotal: quote.subtotal,
      taxTotal: quote.taxTotal,
      total: quote.total,
      notes: quote.notes,
      createdBy: quote.createdBy,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
      customerName: customer.name,
    })
    .from(quote)
    .leftJoin(customer, and(eq(customer.id, quote.customerId), eq(customer.organizationId, organizationId)))
    .where(where)
    .orderBy(desc(quote.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    rows: rows.map((r) => ({ ...r, customerName: r.customerName ?? "Unknown" })),
    total: Number(totalCount),
  };
}

export type QuoteWithLines = Quote & {
  lines: QuoteLine[];
  customerName: string;
  customerEmail: string | null;
};

export async function getQuoteWithLinesById(
  tx: Tx,
  organizationId: string,
  id: string,
): Promise<QuoteWithLines | null> {
  const [q] = await tx
    .select({
      id: quote.id,
      organizationId: quote.organizationId,
      customerId: quote.customerId,
      quoteNumber: quote.quoteNumber,
      quoteDate: quote.quoteDate,
      expiryDate: quote.expiryDate,
      status: quote.status,
      subtotal: quote.subtotal,
      taxTotal: quote.taxTotal,
      total: quote.total,
      notes: quote.notes,
      createdBy: quote.createdBy,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
      customerName: customer.name,
      customerEmail: customer.email,
    })
    .from(quote)
    .leftJoin(customer, and(eq(customer.id, quote.customerId), eq(customer.organizationId, organizationId)))
    .where(and(eq(quote.id, id), eq(quote.organizationId, organizationId)))
    .limit(1);

  if (!q) return null;

  const lines = await tx
    .select()
    .from(quoteLine)
    .where(and(eq(quoteLine.quoteId, id), eq(quoteLine.organizationId, organizationId)))
    .orderBy(asc(quoteLine.lineOrder));

  return { ...q, customerName: q.customerName ?? "Unknown", customerEmail: q.customerEmail ?? null, lines };
}
