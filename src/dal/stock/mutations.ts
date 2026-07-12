import "server-only";
import type { Tx } from "@/services/drizzle";
import {
  NewStockLedgerEntry,
  stockLedgerEntry,
} from "@/services/drizzle/schemas";

/**
 * Inserts one stock movement row. Never updates or deletes existing rows —
 * corrections happen via a new offsetting entry, not a mutation of history.
 *
 * Does NOT check available quantity before allowing a negative movement —
 * that's InventoryService's job (it reads getOnHandQuantity, decides
 * OUT_OF_STOCK vs proceed, then calls this).
 */
export async function insertStockMovement(tx: Tx, input: NewStockLedgerEntry) {
  const [row] = await tx.insert(stockLedgerEntry).values(input).returning();
  return row;
}
