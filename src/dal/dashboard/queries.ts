import "server-only";

import { eq, and, inArray, notInArray, count, sum, desc } from "drizzle-orm";
import type { Tx } from "@/services/drizzle";
import {
  invoice,
  salesOrder,
  product,
  customer,
} from "@/services/drizzle/schemas";

export type DashboardStats = {
  totalRevenue: number;
  openInvoiceCount: number;
  openOrderCount: number;
  productCount: number;
  recentInvoices: RecentInvoice[];
};

export type RecentInvoice = {
  id: string;
  invoiceNumber: string;
  customerName: string;
  total: string;
  status: string;
  dueDate: string | null;
  issueDate: string;
};

export async function getDashboardStats(
  tx: Tx,
  organizationId: string,
): Promise<DashboardStats> {
  const [
    revenueResult,
    openInvoiceResult,
    openOrderResult,
    productResult,
    recentRows,
  ] = await Promise.all([
    // Total revenue: sum of paid invoice totals
    tx
      .select({ total: sum(invoice.total) })
      .from(invoice)
      .where(
        and(
          eq(invoice.organizationId, organizationId),
          eq(invoice.status, "paid"),
        ),
      ),

    // Open invoices: sent or partial
    tx
      .select({ total: count() })
      .from(invoice)
      .where(
        and(
          eq(invoice.organizationId, organizationId),
          inArray(invoice.status, ["sent", "partial", "unpaid"]),
        ),
      ),

    // Open orders: draft or confirmed
    tx
      .select({ total: count() })
      .from(salesOrder)
      .where(
        and(
          eq(salesOrder.organizationId, organizationId),
          notInArray(salesOrder.status, ["cancelled"]),
        ),
      ),

    // Active product count
    tx
      .select({ total: count() })
      .from(product)
      .where(
        and(
          eq(product.organizationId, organizationId),
          eq(product.active, true),
        ),
      ),

    // Recent 5 invoices with customer name
    tx
      .select({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        status: invoice.status,
        dueDate: invoice.dueDate,
        issueDate: invoice.issueDate,
        customerName: customer.name,
      })
      .from(invoice)
      .leftJoin(
        customer,
        and(
          eq(customer.id, invoice.customerId),
          eq(customer.organizationId, organizationId),
        ),
      )
      .where(eq(invoice.organizationId, organizationId))
      .orderBy(desc(invoice.createdAt))
      .limit(5),
  ]);

  return {
    totalRevenue: Number(revenueResult[0]?.total ?? 0),
    openInvoiceCount: Number(openInvoiceResult[0]?.total ?? 0),
    openOrderCount: Number(openOrderResult[0]?.total ?? 0),
    productCount: Number(productResult[0]?.total ?? 0),
    recentInvoices: recentRows.map((row) => ({
      id: row.id,
      invoiceNumber: row.invoiceNumber,
      customerName: row.customerName ?? "Unknown",
      total: row.total,
      status: row.status,
      dueDate: row.dueDate,
      issueDate: row.issueDate,
    })),
  };
}
