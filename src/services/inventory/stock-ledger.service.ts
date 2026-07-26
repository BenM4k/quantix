import "server-only";

import { withTenantTransaction } from "@/lib/tenant-context";
import { canX } from "@/lib/permissions";
import { Err, Ok, type Result } from "@/lib/server-utils";
import {
  getProductStockSummary,
  lockProductStockSummary,
  getPaginatedStockLedgerEntries,
  getAllStockLedgerEntriesForProduct,
  getStockLedgerEntryById,
  type StockLedgerPaginationParams,
  type StockLedgerWithDetails,
} from "@/dal/stock/queries";
import { insertStockMovement, upsertProductStockSummary } from "@/dal/stock/mutations";
import { getProductById } from "@/dal/product/queries";
import { getCompanyWarehouse, upsertWarehouse } from "@/dal/warehouse/queries";
import { StockLedgerEntry, ProductStockSummary } from "@/services/drizzle/schemas";
import type { Tx } from "@/services/drizzle";

export type StockMovementType =
  | "initial"
  | "adjustment_in"
  | "adjustment_out"
  | "sale"
  | "sale_reversal";

export interface RecordStockMovementParams {
  productId: string;
  warehouseId?: string;
  movementType: StockMovementType;
  quantity: number;
  unitCost?: number;
  sourceType?: "manual" | "invoice" | "credit_note";
  sourceId?: string | null;
  reason?: string | null;
}

export type StockLedgerServiceError =
  | { code: "FORBIDDEN"; message: string }
  | { code: "NOT_FOUND"; message: string }
  | { code: "INVALID_INPUT"; message: string }
  | { code: "INSUFFICIENT_STOCK"; message: string }
  | { code: "DB_ERROR"; message: string };

/**
 * Core logic — operates inside a caller-owned transaction.
 * Does NOT open its own transaction. Does NOT do permission checks.
 * Called by recordMovement (standalone) and InvoiceService (shared tx).
 *
 * Returns Ok(entry) with the resolved unit cost accessible via entry.unitCost.
 */
export async function recordMovementCore(
  tx: Tx,
  companyId: string,
  params: RecordStockMovementParams,
  userId: string,
): Promise<Result<StockLedgerEntry, StockLedgerServiceError>> {
  const {
    productId,
    movementType,
    quantity: reqQty,
    unitCost: reqUnitCost,
    sourceType = "manual",
    sourceId = null,
    reason,
  } = params;

  // 1. Resolve Warehouse
  let targetWarehouseId = params.warehouseId;
  if (!targetWarehouseId) {
    const defaultWh = await getCompanyWarehouse(tx, companyId);
    if (defaultWh) {
      targetWarehouseId = defaultWh.id;
    } else {
      const newWh = await upsertWarehouse(tx, companyId, { name: "Main Warehouse" });
      targetWarehouseId = newWh.id;
    }
  }

  // 2. Validate product exists in company
  const product = await getProductById(tx, companyId, productId);
  if (!product) {
    return Err({
      code: "NOT_FOUND",
      message: `Product with ID "${productId}" not found.`,
    });
  }

  // 3. Lock ProductStockSummary row using SELECT ... FOR UPDATE
  const summary = await lockProductStockSummary(tx, companyId, productId, targetWarehouseId);

  // 4. Input validations
  if (reqQty <= 0) {
    return Err({ code: "INVALID_INPUT", message: "Movement quantity must be greater than zero." });
  }

  const isInMovement =
    movementType === "initial" ||
    movementType === "adjustment_in" ||
    movementType === "sale_reversal";

  const isOutMovement =
    movementType === "adjustment_out" || movementType === "sale";

  if (
    (movementType === "adjustment_in" || movementType === "adjustment_out") &&
    (!reason || reason.trim() === "")
  ) {
    return Err({ code: "INVALID_INPUT", message: "Reason is required for stock adjustments." });
  }

  if (isInMovement && (reqUnitCost === undefined || reqUnitCost === null || reqUnitCost < 0)) {
    return Err({
      code: "INVALID_INPUT",
      message: "Unit cost is required and must be non-negative for stock-in movements.",
    });
  }

  const currentQty = Number(summary.quantityOnHand);
  const currentAvgCost = Number(summary.averageCost);

  // Insufficient stock check for stock-out
  if (isOutMovement && reqQty > currentQty) {
    return Err({
      code: "INSUFFICIENT_STOCK",
      message: `Insufficient stock for product "${product.name}". Requested: ${reqQty}, Available: ${currentQty}.`,
    });
  }

  // 5. Compute new quantities & weighted average cost
  let newQty = currentQty;
  let newAvgCost = currentAvgCost;
  let signedQty = reqQty;
  let resolvedUnitCost = reqUnitCost ?? 0;

  if (isInMovement) {
    const inQty = reqQty;
    const inUnitCost = reqUnitCost!;
    newQty = currentQty + inQty;
    newAvgCost = newQty > 0 ? (currentQty * currentAvgCost + inQty * inUnitCost) / newQty : 0;
    signedQty = inQty;
    resolvedUnitCost = inUnitCost;
  } else if (isOutMovement) {
    const outQty = reqQty;
    resolvedUnitCost = currentAvgCost; // movement recorded at current average cost
    newQty = currentQty - outQty;
    newAvgCost = currentAvgCost; // average cost unchanged on stock-out
    signedQty = -outQty;
  }

  // 6. Generate next sequence number
  const nextSeq = summary.lastSequenceNumber + 1;

  // 7. Insert StockLedgerEntry
  const entry = await insertStockMovement(tx, {
    organizationId: companyId,
    productId,
    warehouseId: targetWarehouseId,
    quantity: String(signedQty),
    quantityDelta: String(signedQty),
    unitCost: String(resolvedUnitCost),
    movementType,
    sourceType,
    sourceId,
    reason: reason || null,
    sequenceNumber: nextSeq,
    createdBy: userId,
  });

  // 8. Update ProductStockSummary cache
  await upsertProductStockSummary(tx, companyId, productId, targetWarehouseId, {
    quantityOnHand: String(newQty),
    averageCost: String(newAvgCost),
    lastSequenceNumber: nextSeq,
  });

  return Ok(entry);
}

/**
 * Public service — does permission check then opens its own transaction.
 * Use for standalone mutations from server actions (stock adjustments).
 */
export async function recordMovement(
  companyId: string,
  params: RecordStockMovementParams,
  userId: string,
  userRole?: string,
): Promise<Result<StockLedgerEntry, StockLedgerServiceError>> {
  if (userRole && !canX(userRole, { id: companyId }, "stock:adjust")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to record stock movements." });
  }

  try {
    return await withTenantTransaction(companyId, (tx) =>
      recordMovementCore(tx, companyId, params, userId),
    );
  } catch (cause) {
    return Err({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Database operation failed",
    });
  }
}

/**
 * Rebuilds the ProductStockSummary cache from scratch by replaying all StockLedgerEntry rows.
 */
export async function rebuildFromLedger(
  companyId: string,
  productId: string,
  warehouseId?: string,
): Promise<Result<ProductStockSummary, StockLedgerServiceError>> {
  try {
    return await withTenantTransaction(companyId, async (tx) => {
      let targetWhId = warehouseId;
      if (!targetWhId) {
        const defaultWh = await getCompanyWarehouse(tx, companyId);
        if (!defaultWh) {
          return Err({ code: "NOT_FOUND", message: "Warehouse not found." });
        }
        targetWhId = defaultWh.id;
      }

      const entries = await getAllStockLedgerEntriesForProduct(tx, companyId, productId, targetWhId);

      let currentQty = 0;
      let currentAvgCost = 0;
      let lastSeq = 0;

      for (const entry of entries) {
        const qty = Number(entry.quantity);
        const unitCost = Number(entry.unitCost);

        if (qty > 0) {
          const newQty = currentQty + qty;
          currentAvgCost = newQty > 0 ? (currentQty * currentAvgCost + qty * unitCost) / newQty : 0;
          currentQty = newQty;
        } else if (qty < 0) {
          const outQty = Math.abs(qty);
          currentQty = currentQty - outQty;
        }
        lastSeq = entry.sequenceNumber;
      }

      const updatedSummary = await upsertProductStockSummary(
        tx, companyId, productId, targetWhId,
        { quantityOnHand: String(currentQty), averageCost: String(currentAvgCost), lastSequenceNumber: lastSeq },
      );

      return Ok(updatedSummary);
    });
  } catch (cause) {
    return Err({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to rebuild stock summary",
    });
  }
}

/**
 * Fetches paginated stock ledger entries for the UI table.
 */
export async function getStockLedgerEntriesService(
  companyId: string,
  userRole: string,
  params: StockLedgerPaginationParams,
): Promise<Result<{ rows: StockLedgerWithDetails[]; total: number }, StockLedgerServiceError>> {
  if (!canX(userRole, { id: companyId }, "product:view")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to view stock ledger." });
  }

  try {
    const res = await withTenantTransaction(companyId, (tx) =>
      getPaginatedStockLedgerEntries(tx, companyId, params),
    );
    return Ok(res);
  } catch (cause) {
    return Err({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to fetch stock ledger",
    });
  }
}

/**
 * Fetches StockLedgerEntry detail by ID.
 */
export async function getStockLedgerEntryByIdService(
  companyId: string,
  userRole: string,
  id: string,
): Promise<Result<StockLedgerWithDetails, StockLedgerServiceError>> {
  if (!canX(userRole, { id: companyId }, "product:view")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to view stock ledger detail." });
  }

  try {
    const res = await withTenantTransaction(companyId, (tx) =>
      getStockLedgerEntryById(tx, companyId, id),
    );
    if (!res) {
      return Err({ code: "NOT_FOUND", message: "Stock ledger entry not found." });
    }
    return Ok(res);
  } catch (cause) {
    return Err({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to fetch stock ledger entry",
    });
  }
}

/**
 * Fetches stock summary for product.
 */
export async function getProductStockSummaryService(
  companyId: string,
  userRole: string,
  productId: string,
  warehouseId?: string,
): Promise<Result<ProductStockSummary | null, StockLedgerServiceError>> {
  if (!canX(userRole, { id: companyId }, "product:view")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to view product stock summary." });
  }

  try {
    const res = await withTenantTransaction(companyId, async (tx) => {
      let whId = warehouseId;
      if (!whId) {
        const defaultWh = await getCompanyWarehouse(tx, companyId);
        if (!defaultWh) return null;
        whId = defaultWh.id;
      }
      return getProductStockSummary(tx, companyId, productId, whId);
    });
    return Ok(res);
  } catch (cause) {
    return Err({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to fetch product stock summary",
    });
  }
}
