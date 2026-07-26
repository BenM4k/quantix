import "server-only";

import { withTenantTransaction } from "@/lib/tenant-context";
import { Ok, Err, tryCatch, type Result } from "@/lib/server-utils";
import { canX } from "@/lib/permissions";
import {
  getPaginatedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductPaginationParams,
} from "@/dal/product/queries";
import { type Product } from "@/services/drizzle/schemas";
import { type ProductInput } from "@/lib/schemas/product";

export type ProductServiceError =
  | { code: "FORBIDDEN"; message: string }
  | { code: "NOT_FOUND"; message: string }
  | { code: "DB_ERROR"; message: string };

export async function getProductsService(
  organizationId: string,
  userRole: string,
  params: ProductPaginationParams,
): Promise<Result<{ rows: Product[]; total: number }, ProductServiceError>> {
  if (!canX(userRole, { id: organizationId }, "product:view")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to view products" });
  }

  return tryCatch(
    () => withTenantTransaction(organizationId, (tx) => getPaginatedProducts(tx, organizationId, params)),
    (cause) => ({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to load products",
    }),
  );
}

export async function getProductByIdService(
  organizationId: string,
  userRole: string,
  productId: string,
): Promise<Result<Product, ProductServiceError>> {
  if (!canX(userRole, { id: organizationId }, "product:view")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to view product" });
  }

  const res = await tryCatch(
    () => withTenantTransaction(organizationId, (tx) => getProductById(tx, organizationId, productId)),
    (cause) => ({
      code: "DB_ERROR" as const,
      message: cause instanceof Error ? cause.message : "Failed to fetch product",
    }),
  );

  if (!res.ok) return res;
  if (!res.value) return Err({ code: "NOT_FOUND", message: "Product not found" });

  return Ok(res.value);
}

export async function createProductService(
  organizationId: string,
  userRole: string,
  input: ProductInput,
): Promise<Result<Product, ProductServiceError>> {
  if (!canX(userRole, { id: organizationId }, "product:create")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to create product" });
  }

  return tryCatch(
    () =>
      withTenantTransaction(organizationId, (tx) =>
        createProduct(tx, organizationId, {
          sku: input.sku,
          name: input.name,
          uom: input.uom,
          sellPrice: String(input.sellPrice),
          costPrice: String(input.costPrice),
          taxRateId: input.taxRateId || null,
          reorderThreshold: input.reorderThreshold !== undefined && input.reorderThreshold !== null ? String(input.reorderThreshold) : null,
          imageUrl: input.imageUrl || null,
          active: input.active,
        }),
      ),
    (cause) => ({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to create product",
    }),
  );
}

export async function updateProductService(
  organizationId: string,
  userRole: string,
  productId: string,
  input: ProductInput,
): Promise<Result<Product, ProductServiceError>> {
  if (!canX(userRole, { id: organizationId }, "product:update")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to update product" });
  }

  const res = await tryCatch(
    () =>
      withTenantTransaction(organizationId, (tx) =>
        updateProduct(tx, organizationId, productId, {
          sku: input.sku,
          name: input.name,
          uom: input.uom,
          sellPrice: String(input.sellPrice),
          costPrice: String(input.costPrice),
          taxRateId: input.taxRateId || null,
          reorderThreshold: input.reorderThreshold !== undefined && input.reorderThreshold !== null ? String(input.reorderThreshold) : null,
          imageUrl: input.imageUrl || null,
          active: input.active,
        }),
      ),
    (cause) => ({
      code: "DB_ERROR" as const,
      message: cause instanceof Error ? cause.message : "Failed to update product",
    }),
  );

  if (!res.ok) return res;
  if (!res.value) return Err({ code: "NOT_FOUND", message: "Product not found" });

  return Ok(res.value);
}

export async function deleteProductService(
  organizationId: string,
  userRole: string,
  productId: string,
): Promise<Result<void, ProductServiceError>> {
  if (!canX(userRole, { id: organizationId }, "product:delete")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to delete product" });
  }

  const res = await tryCatch(
    () => withTenantTransaction(organizationId, (tx) => deleteProduct(tx, organizationId, productId)),
    (cause) => ({
      code: "DB_ERROR" as const,
      message: cause instanceof Error ? cause.message : "Failed to delete product",
    }),
  );

  if (!res.ok) return res;
  return Ok(undefined);
}
