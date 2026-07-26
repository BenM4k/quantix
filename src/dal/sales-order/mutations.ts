import "server-only";

import { eq, and } from "drizzle-orm";
import type { Tx } from "@/services/drizzle";
import {
  salesOrder,
  salesOrderLine,
  type NewSalesOrder,
  type NewSalesOrderLine,
  type SalesOrder,
  type SalesOrderLine,
} from "@/services/drizzle/schemas";

export async function insertSalesOrder(
  tx: Tx,
  data: Omit<NewSalesOrder, "id" | "createdAt" | "updatedAt">,
): Promise<SalesOrder> {
  const [created] = await tx.insert(salesOrder).values(data).returning();
  return created;
}

export async function insertSalesOrderLines(
  tx: Tx,
  lines: Omit<NewSalesOrderLine, "id" | "createdAt" | "updatedAt">[],
): Promise<SalesOrderLine[]> {
  if (lines.length === 0) return [];
  return tx.insert(salesOrderLine).values(lines).returning();
}

export async function deleteSalesOrderLines(
  tx: Tx,
  organizationId: string,
  orderId: string,
): Promise<void> {
  await tx
    .delete(salesOrderLine)
    .where(and(eq(salesOrderLine.orderId, orderId), eq(salesOrderLine.organizationId, organizationId)));
}

export async function updateSalesOrder(
  tx: Tx,
  organizationId: string,
  id: string,
  data: Partial<NewSalesOrder>,
): Promise<SalesOrder | null> {
  const [updated] = await tx
    .update(salesOrder)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(salesOrder.id, id), eq(salesOrder.organizationId, organizationId)))
    .returning();
  return updated ?? null;
}

export async function updateOrderStatus(
  tx: Tx,
  organizationId: string,
  id: string,
  status: SalesOrder["status"],
): Promise<SalesOrder | null> {
  return updateSalesOrder(tx, organizationId, id, { status });
}
