import "server-only";

import { eq, and, ilike, count, desc, asc } from "drizzle-orm";
import type { Tx } from "@/services/drizzle";
import {
  salesOrder,
  salesOrderLine,
  customer,
  quote,
  type SalesOrder,
  type SalesOrderLine,
} from "@/services/drizzle/schemas";

export type OrderPaginationParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

export type OrderWithCustomer = SalesOrder & {
  customerName: string;
  sourceQuoteNumber: string | null;
};

export async function getPaginatedOrders(
  tx: Tx,
  organizationId: string,
  params: OrderPaginationParams,
): Promise<{ rows: OrderWithCustomer[]; total: number }> {
  const { page = 1, limit = 50, search, status } = params;
  const offset = (page - 1) * limit;

  const conditions = [eq(salesOrder.organizationId, organizationId)];

  if (status && status !== "all") {
    conditions.push(eq(salesOrder.status, status as SalesOrder["status"]));
  }
  if (search && search.trim() !== "") {
    conditions.push(ilike(salesOrder.orderNumber, `%${search.trim()}%`));
  }

  const where = and(...conditions);

  const [{ total: totalCount }] = await tx
    .select({ total: count() })
    .from(salesOrder)
    .where(where);

  const rows = await tx
    .select({
      id: salesOrder.id,
      organizationId: salesOrder.organizationId,
      customerId: salesOrder.customerId,
      orderNumber: salesOrder.orderNumber,
      orderDate: salesOrder.orderDate,
      status: salesOrder.status,
      sourceQuoteId: salesOrder.sourceQuoteId,
      subtotal: salesOrder.subtotal,
      taxTotal: salesOrder.taxTotal,
      total: salesOrder.total,
      notes: salesOrder.notes,
      createdBy: salesOrder.createdBy,
      createdAt: salesOrder.createdAt,
      updatedAt: salesOrder.updatedAt,
      customerName: customer.name,
      sourceQuoteNumber: quote.quoteNumber,
    })
    .from(salesOrder)
    .leftJoin(customer, and(eq(customer.id, salesOrder.customerId), eq(customer.organizationId, organizationId)))
    .leftJoin(quote, and(eq(quote.id, salesOrder.sourceQuoteId), eq(quote.organizationId, organizationId)))
    .where(where)
    .orderBy(desc(salesOrder.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    rows: rows.map((r) => ({
      ...r,
      customerName: r.customerName ?? "Unknown",
      sourceQuoteNumber: r.sourceQuoteNumber ?? null,
    })),
    total: Number(totalCount),
  };
}

export type OrderWithLines = SalesOrder & {
  lines: SalesOrderLine[];
  customerName: string;
  customerEmail: string | null;
  sourceQuoteNumber: string | null;
};

export async function getOrderWithLinesById(
  tx: Tx,
  organizationId: string,
  id: string,
): Promise<OrderWithLines | null> {
  const [o] = await tx
    .select({
      id: salesOrder.id,
      organizationId: salesOrder.organizationId,
      customerId: salesOrder.customerId,
      orderNumber: salesOrder.orderNumber,
      orderDate: salesOrder.orderDate,
      status: salesOrder.status,
      sourceQuoteId: salesOrder.sourceQuoteId,
      subtotal: salesOrder.subtotal,
      taxTotal: salesOrder.taxTotal,
      total: salesOrder.total,
      notes: salesOrder.notes,
      createdBy: salesOrder.createdBy,
      createdAt: salesOrder.createdAt,
      updatedAt: salesOrder.updatedAt,
      customerName: customer.name,
      customerEmail: customer.email,
      sourceQuoteNumber: quote.quoteNumber,
    })
    .from(salesOrder)
    .leftJoin(customer, and(eq(customer.id, salesOrder.customerId), eq(customer.organizationId, organizationId)))
    .leftJoin(quote, and(eq(quote.id, salesOrder.sourceQuoteId), eq(quote.organizationId, organizationId)))
    .where(and(eq(salesOrder.id, id), eq(salesOrder.organizationId, organizationId)))
    .limit(1);

  if (!o) return null;

  const lines = await tx
    .select()
    .from(salesOrderLine)
    .where(and(eq(salesOrderLine.orderId, id), eq(salesOrderLine.organizationId, organizationId)))
    .orderBy(asc(salesOrderLine.lineOrder));

  return {
    ...o,
    customerName: o.customerName ?? "Unknown",
    customerEmail: o.customerEmail ?? null,
    sourceQuoteNumber: o.sourceQuoteNumber ?? null,
    lines,
  };
}
