import "server-only";
import { eq, and } from "drizzle-orm";
import type { Tx } from "@/services/drizzle";
import {
  NewStockLedgerEntry,
  stockLedgerEntry,
  productStockSummary,
  ProductStockSummary,
} from "@/services/drizzle/schemas";

/**
 * Inserts one stock movement row. Never updates or deletes existing rows.
 * Stock Ledger entries are strictly insert-only and immutable.
 */
export async function insertStockMovement(tx: Tx, input: NewStockLedgerEntry) {
  const [row] = await tx.insert(stockLedgerEntry).values(input).returning();
  return row;
}

/**
 * Updates or inserts ProductStockSummary cache.
 */
export async function upsertProductStockSummary(
  tx: Tx,
  organizationId: string,
  productId: string,
  warehouseId: string,
  data: {
    quantityOnHand: string;
    averageCost: string;
    lastSequenceNumber: number;
  },
): Promise<ProductStockSummary> {
  const [row] = await tx
    .insert(productStockSummary)
    .values({
      organizationId,
      productId,
      warehouseId,
      quantityOnHand: data.quantityOnHand,
      averageCost: data.averageCost,
      lastSequenceNumber: data.lastSequenceNumber,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        productStockSummary.organizationId,
        productStockSummary.productId,
        productStockSummary.warehouseId,
      ],
      set: {
        quantityOnHand: data.quantityOnHand,
        averageCost: data.averageCost,
        lastSequenceNumber: data.lastSequenceNumber,
        updatedAt: new Date(),
      },
    })
    .returning();

  return row;
}
