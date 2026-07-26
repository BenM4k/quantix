import "server-only";

import { withTenantTransaction } from "@/lib/tenant-context";
import { Ok, Err, tryCatch, type Result } from "@/lib/server-utils";
import { canX } from "@/lib/permissions";
import { getCompanyWarehouse, upsertWarehouse } from "@/dal/warehouse/queries";
import { type Warehouse } from "@/services/drizzle/schemas";
import { type WarehouseInput } from "@/lib/schemas/warehouse";

export type WarehouseServiceError =
  | { code: "FORBIDDEN"; message: string }
  | { code: "DB_ERROR"; message: string };

export async function getWarehouseService(
  organizationId: string,
  userRole: string,
): Promise<Result<Warehouse | null, WarehouseServiceError>> {
  if (!canX(userRole, { id: organizationId }, "warehouse:view")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to view warehouse settings" });
  }

  return tryCatch(
    () => withTenantTransaction(organizationId, (tx) => getCompanyWarehouse(tx, organizationId)),
    (cause) => ({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Database query failed",
    }),
  );
}

export async function saveWarehouseService(
  organizationId: string,
  userRole: string,
  input: WarehouseInput,
): Promise<Result<Warehouse, WarehouseServiceError>> {
  if (!canX(userRole, { id: organizationId }, "warehouse:edit")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to edit warehouse settings" });
  }

  return tryCatch(
    () =>
      withTenantTransaction(organizationId, (tx) =>
        upsertWarehouse(tx, organizationId, {
          name: input.name,
          address: input.address,
          imageUrl: input.imageUrl,
          active: input.active,
        }),
      ),
    (cause) => ({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to update warehouse",
    }),
  );
}
