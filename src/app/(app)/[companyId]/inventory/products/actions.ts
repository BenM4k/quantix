"use server";

import { revalidatePath } from "next/cache";
import { requireTenantContext } from "@/lib/require-tenant-context";
import { Err, type Result } from "@/lib/server-utils";
import { productSchema, type ProductInput } from "@/lib/schemas/product";
import {
  createProductService,
  updateProductService,
  deleteProductService,
  getProductByIdService,
  type ProductServiceError,
} from "@/services/inventory/product.service";
import { type Product } from "@/services/drizzle/schemas";

export async function createProductAction(
  companyId: string,
  input: ProductInput,
): Promise<Result<Product, ProductServiceError | { code: "INVALID_INPUT"; message: string }>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  const validated = productSchema.safeParse(input);
  if (!validated.success) {
    return Err({
      code: "INVALID_INPUT",
      message: validated.error.issues[0]?.message || "Invalid input data",
    });
  }

  const result = await createProductService(
    ctx.value.organizationId,
    ctx.value.role,
    validated.data,
  );

  if (result.ok) {
    revalidatePath(`/${companyId}/inventory/products`);
  }

  return result;
}

export async function updateProductAction(
  companyId: string,
  productId: string,
  input: ProductInput,
): Promise<Result<Product, ProductServiceError | { code: "INVALID_INPUT"; message: string }>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  const validated = productSchema.safeParse(input);
  if (!validated.success) {
    return Err({
      code: "INVALID_INPUT",
      message: validated.error.issues[0]?.message || "Invalid input data",
    });
  }

  const result = await updateProductService(
    ctx.value.organizationId,
    ctx.value.role,
    productId,
    validated.data,
  );

  if (result.ok) {
    revalidatePath(`/${companyId}/inventory/products`);
  }

  return result;
}

export async function deleteProductAction(
  companyId: string,
  productId: string,
): Promise<Result<void, ProductServiceError>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  const result = await deleteProductService(
    ctx.value.organizationId,
    ctx.value.role,
    productId,
  );

  if (result.ok) {
    revalidatePath(`/${companyId}/inventory/products`);
  }

  return result;
}

export async function getProductDetailAction(
  companyId: string,
  productId: string,
): Promise<Result<Product, ProductServiceError>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  return getProductByIdService(ctx.value.organizationId, ctx.value.role, productId);
}
