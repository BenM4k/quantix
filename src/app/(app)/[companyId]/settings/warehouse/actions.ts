"use server";

import { revalidatePath } from "next/cache";
import { requireTenantContext } from "@/lib/require-tenant-context";
import { Err, type Result } from "@/lib/server-utils";
import { warehouseSchema, type WarehouseInput } from "@/lib/schemas/warehouse";
import { saveWarehouseService, type WarehouseServiceError } from "@/services/warehouse/warehouse.service";
import { type Warehouse } from "@/services/drizzle/schemas";

export async function saveWarehouseAction(
  companyId: string,
  input: WarehouseInput,
): Promise<Result<Warehouse, WarehouseServiceError | { code: "INVALID_INPUT"; message: string }>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  const validated = warehouseSchema.safeParse(input);
  if (!validated.success) {
    return Err({
      code: "INVALID_INPUT",
      message: validated.error.issues[0]?.message || "Invalid input data",
    });
  }

  const result = await saveWarehouseService(
    ctx.value.organizationId,
    ctx.value.role,
    validated.data,
  );

  if (result.ok) {
    revalidatePath(`/${companyId}/settings/warehouse`);
  }

  return result;
}
