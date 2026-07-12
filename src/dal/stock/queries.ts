import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { stockLedgerEntry } from "@/services/drizzle/schemas";
import type { Tx } from "@/services/drizzle";

/**
 * On-hand quantity is never stored directly — it's always SUM(quantity_delta)
 * over the insert-only ledger, per your "no product.quantity--" rule.
 */
export async function getOnHandQuantity(
  tx: Tx,
  organizationId: string,
  productId: string,
  warehouseId: string,
): Promise<number> {
  const [row] = await tx
    .select({
      onHand: sql<string>`coalesce(sum(${stockLedgerEntry.quantityDelta}), 0)`,
    })
    .from(stockLedgerEntry)
    .where(
      and(
        eq(stockLedgerEntry.organizationId, organizationId),
        eq(stockLedgerEntry.productId, productId),
        eq(stockLedgerEntry.warehouseId, warehouseId),
      ),
    );

  return Number(row?.onHand ?? 0);
}
