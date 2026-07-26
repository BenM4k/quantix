import "server-only";

import { and, eq, sql, desc, asc, ilike, or, count, inArray } from "drizzle-orm";
import {
  stockLedgerEntry,
  productStockSummary,
  product,
  warehouse,
  type StockLedgerEntry,
  type ProductStockSummary,
} from "@/services/drizzle/schemas";
import type { Tx } from "@/services/drizzle";

export interface StockLedgerPaginationParams {
  page?: number;
  pageSize?: number;
  productId?: string;
  movementType?: string;
  search?: string;
}

export type StockLedgerWithDetails = StockLedgerEntry & {
  productName: string;
  productSku: string;
  warehouseName: string;
};

/**
 * Retrieves the ProductStockSummary for a given product and warehouse.
 */
export async function getProductStockSummary(
  tx: Tx,
  organizationId: string,
  productId: string,
  warehouseId: string,
): Promise<ProductStockSummary | null> {
  const [row] = await tx
    .select()
    .from(productStockSummary)
    .where(
      and(
        eq(productStockSummary.organizationId, organizationId),
        eq(productStockSummary.productId, productId),
        eq(productStockSummary.warehouseId, warehouseId),
      ),
    )
    .limit(1);

  return row || null;
}

/**
 * Locks the ProductStockSummary row for UPDATE using SELECT ... FOR UPDATE.
 * Creates the summary row with 0 values first if it doesn't pre-exist.
 */
export async function lockProductStockSummary(
  tx: Tx,
  organizationId: string,
  productId: string,
  warehouseId: string,
): Promise<ProductStockSummary> {
  // Try to lock existing row
  let rows = await tx
    .select()
    .from(productStockSummary)
    .where(
      and(
        eq(productStockSummary.organizationId, organizationId),
        eq(productStockSummary.productId, productId),
        eq(productStockSummary.warehouseId, warehouseId),
      ),
    )
    .for("update");

  if (rows.length > 0) {
    return rows[0]!;
  }

  // Row doesn't exist: insert initial row with 0 stock / 0 average cost
  await tx
    .insert(productStockSummary)
    .values({
      organizationId,
      productId,
      warehouseId,
      quantityOnHand: "0",
      averageCost: "0",
      lastSequenceNumber: 0,
    })
    .onConflictDoNothing();

  // Re-select with FOR UPDATE to guarantee lock
  rows = await tx
    .select()
    .from(productStockSummary)
    .where(
      and(
        eq(productStockSummary.organizationId, organizationId),
        eq(productStockSummary.productId, productId),
        eq(productStockSummary.warehouseId, warehouseId),
      ),
    )
    .for("update");

  return rows[0]!;
}

/**
 * Computes next sequence number for (productId, warehouseId).
 */
export async function getNextSequenceNumber(
  tx: Tx,
  organizationId: string,
  productId: string,
  warehouseId: string,
): Promise<number> {
  const [row] = await tx
    .select({
      maxSeq: sql<number>`coalesce(max(${stockLedgerEntry.sequenceNumber}), 0)`,
    })
    .from(stockLedgerEntry)
    .where(
      and(
        eq(stockLedgerEntry.organizationId, organizationId),
        eq(stockLedgerEntry.productId, productId),
        eq(stockLedgerEntry.warehouseId, warehouseId),
      ),
    );

  return (row?.maxSeq ?? 0) + 1;
}

/**
 * Returns paginated stock ledger entries with product and warehouse details.
 */
export async function getPaginatedStockLedgerEntries(
  tx: Tx,
  organizationId: string,
  params: StockLedgerPaginationParams,
): Promise<{ rows: StockLedgerWithDetails[]; total: number }> {
  const { page = 1, pageSize = 20, productId, movementType, search } = params;
  const offset = (page - 1) * pageSize;

  const conditions = [eq(stockLedgerEntry.organizationId, organizationId)];

  if (productId && productId !== "all") {
    conditions.push(eq(stockLedgerEntry.productId, productId));
  }

  if (movementType && movementType !== "all") {
    conditions.push(
      eq(stockLedgerEntry.movementType, movementType as never),
    );
  }

  if (search && search.trim() !== "") {
    const pattern = `%${search.trim()}%`;
    conditions.push(
      or(ilike(product.name, pattern), ilike(product.sku, pattern))!,
    );
  }

  const whereClause = and(...conditions);

  const [{ countValue }] = await tx
    .select({ countValue: count() })
    .from(stockLedgerEntry)
    .innerJoin(product, eq(stockLedgerEntry.productId, product.id))
    .where(whereClause);

  const rows = await tx
    .select({
      id: stockLedgerEntry.id,
      organizationId: stockLedgerEntry.organizationId,
      productId: stockLedgerEntry.productId,
      warehouseId: stockLedgerEntry.warehouseId,
      quantity: stockLedgerEntry.quantity,
      quantityDelta: stockLedgerEntry.quantityDelta,
      unitCost: stockLedgerEntry.unitCost,
      movementType: stockLedgerEntry.movementType,
      sourceType: stockLedgerEntry.sourceType,
      sourceId: stockLedgerEntry.sourceId,
      reason: stockLedgerEntry.reason,
      sequenceNumber: stockLedgerEntry.sequenceNumber,
      createdBy: stockLedgerEntry.createdBy,
      createdAt: stockLedgerEntry.createdAt,
      updatedAt: stockLedgerEntry.updatedAt,
      productName: product.name,
      productSku: product.sku,
      warehouseName: warehouse.name,
    })
    .from(stockLedgerEntry)
    .innerJoin(product, eq(stockLedgerEntry.productId, product.id))
    .innerJoin(warehouse, eq(stockLedgerEntry.warehouseId, warehouse.id))
    .where(whereClause)
    .orderBy(desc(stockLedgerEntry.sequenceNumber), desc(stockLedgerEntry.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    rows: rows.map((r) => ({
      ...r,
      productName: r.productName,
      productSku: r.productSku,
      warehouseName: r.warehouseName,
    })),
    total: Number(countValue),
  };
}

/**
 * Returns all stock ledger entries for a product/warehouse ordered by sequenceNumber ASC.
 * Used by rebuildFromLedger.
 */
export async function getAllStockLedgerEntriesForProduct(
  tx: Tx,
  organizationId: string,
  productId: string,
  warehouseId: string,
): Promise<StockLedgerEntry[]> {
  return tx
    .select()
    .from(stockLedgerEntry)
    .where(
      and(
        eq(stockLedgerEntry.organizationId, organizationId),
        eq(stockLedgerEntry.productId, productId),
        eq(stockLedgerEntry.warehouseId, warehouseId),
      ),
    )
    .orderBy(asc(stockLedgerEntry.sequenceNumber));
}

/**
 * Returns single stock ledger entry with detail by ID.
 */
export async function getStockLedgerEntryById(
  tx: Tx,
  organizationId: string,
  id: string,
): Promise<StockLedgerWithDetails | null> {
  const [row] = await tx
    .select({
      id: stockLedgerEntry.id,
      organizationId: stockLedgerEntry.organizationId,
      productId: stockLedgerEntry.productId,
      warehouseId: stockLedgerEntry.warehouseId,
      quantity: stockLedgerEntry.quantity,
      quantityDelta: stockLedgerEntry.quantityDelta,
      unitCost: stockLedgerEntry.unitCost,
      movementType: stockLedgerEntry.movementType,
      sourceType: stockLedgerEntry.sourceType,
      sourceId: stockLedgerEntry.sourceId,
      reason: stockLedgerEntry.reason,
      sequenceNumber: stockLedgerEntry.sequenceNumber,
      createdBy: stockLedgerEntry.createdBy,
      createdAt: stockLedgerEntry.createdAt,
      updatedAt: stockLedgerEntry.updatedAt,
      productName: product.name,
      productSku: product.sku,
      warehouseName: warehouse.name,
    })
    .from(stockLedgerEntry)
    .innerJoin(product, eq(stockLedgerEntry.productId, product.id))
    .innerJoin(warehouse, eq(stockLedgerEntry.warehouseId, warehouse.id))
    .where(
      and(
        eq(stockLedgerEntry.id, id),
        eq(stockLedgerEntry.organizationId, organizationId),
      ),
    )
    .limit(1);

  return row || null;
}

/**
 * Returns product stock summaries in batch for a list of product IDs.
 */
export async function getBatchProductStockSummaries(
  tx: Tx,
  organizationId: string,
  productIds: string[],
): Promise<Record<string, ProductStockSummary>> {
  if (productIds.length === 0) return {};

  const rows = await tx
    .select()
    .from(productStockSummary)
    .where(
      and(
        eq(productStockSummary.organizationId, organizationId),
        inArray(productStockSummary.productId, productIds),
      ),
    );

  const result: Record<string, ProductStockSummary> = {};
  for (const row of rows) {
    result[row.productId] = row;
  }
  return result;
}
