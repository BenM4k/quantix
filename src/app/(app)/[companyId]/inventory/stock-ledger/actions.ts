"use server";

import { revalidatePath } from "next/cache";
import { requireTenantContext } from "@/lib/require-tenant-context";
import { Err, type Result } from "@/lib/server-utils";
import {
  stockAdjustmentFormSchema,
  type StockAdjustmentFormInput,
} from "@/lib/schemas/stock-adjustment";
import {
  recordMovement,
  rebuildFromLedger,
  getStockLedgerEntriesService,
  type StockLedgerServiceError,
} from "@/services/inventory/stock-ledger.service";
import { StockLedgerEntry, ProductStockSummary } from "@/services/drizzle/schemas";
import { StockLedgerWithDetails } from "@/dal/stock/queries";

export async function recordStockMovementAction(
  companyId: string,
  input: StockAdjustmentFormInput,
): Promise<Result<StockLedgerEntry, StockLedgerServiceError | { code: "INVALID_INPUT"; message: string }>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  const validated = stockAdjustmentFormSchema.safeParse(input);
  if (!validated.success) {
    return Err({
      code: "INVALID_INPUT",
      message: validated.error.issues[0]?.message || "Invalid input data",
    });
  }

  const { productId, direction, quantity, unitCost, reason } = validated.data;

  const movementType = direction === "in" ? "adjustment_in" : "adjustment_out";

  const result = await recordMovement(
    ctx.value.organizationId,
    {
      productId,
      movementType,
      quantity,
      unitCost: direction === "in" ? unitCost ?? 0 : undefined,
      sourceType: "manual",
      reason,
    },
    ctx.value.userId,
    ctx.value.role,
  );

  if (result.ok) {
    revalidatePath(`/${companyId}/inventory/stock-ledger`);
    revalidatePath(`/${companyId}/inventory/products`);
  }

  return result;
}

export async function rebuildStockSummaryAction(
  companyId: string,
  productId: string,
  warehouseId?: string,
): Promise<Result<ProductStockSummary, StockLedgerServiceError>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  const result = await rebuildFromLedger(
    ctx.value.organizationId,
    productId,
    warehouseId,
  );

  if (result.ok) {
    revalidatePath(`/${companyId}/inventory/stock-ledger`);
    revalidatePath(`/${companyId}/inventory/products`);
  }

  return result;
}

export async function getStockLedgerEntriesAction(
  companyId: string,
  params: { page?: number; pageSize?: number; productId?: string; movementType?: string; search?: string },
): Promise<Result<{ rows: StockLedgerWithDetails[]; total: number }, StockLedgerServiceError>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  return getStockLedgerEntriesService(
    ctx.value.organizationId,
    ctx.value.role,
    params,
  );
}
