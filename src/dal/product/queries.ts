import "server-only";

import { eq, and, ilike, or, count, asc, desc } from "drizzle-orm";
import { type Tx } from "@/services/drizzle";
import { product, type Product, type NewProduct } from "@/services/drizzle/schemas";

export type ProductPaginationParams = {
  page: number;
  pageSize: number;
  search?: string;
  taxRateId?: string;
  sort?: string;
};

export async function getPaginatedProducts(
  tx: Tx,
  organizationId: string,
  params: ProductPaginationParams,
): Promise<{ rows: Product[]; total: number }> {
  const { page = 1, pageSize = 20, search, taxRateId, sort = "name:asc" } = params;
  const offset = (page - 1) * pageSize;

  const conditions = [
    eq(product.organizationId, organizationId),
    eq(product.active, true),
  ];

  if (taxRateId && taxRateId !== "all") {
    conditions.push(eq(product.taxRateId, taxRateId));
  }

  if (search && search.trim() !== "") {
    const searchPattern = `%${search.trim()}%`;
    conditions.push(
      or(ilike(product.name, searchPattern), ilike(product.sku, searchPattern))!,
    );
  }

  const whereCondition = and(...conditions);

  const [{ countValue }] = await tx
    .select({ countValue: count() })
    .from(product)
    .where(whereCondition);

  let orderBy = [asc(product.name)];
  if (sort) {
    const [field, direction] = sort.split(":");
    const dirFn = direction === "desc" ? desc : asc;
    if (field === "sku") orderBy = [dirFn(product.sku)];
    else if (field === "name") orderBy = [dirFn(product.name)];
    else if (field === "sellPrice") orderBy = [dirFn(product.sellPrice)];
    else if (field === "costPrice") orderBy = [dirFn(product.costPrice)];
  }

  const rows = await tx
    .select()
    .from(product)
    .where(whereCondition)
    .orderBy(...orderBy)
    .limit(pageSize)
    .offset(offset);

  return {
    rows,
    total: Number(countValue),
  };
}

export async function getProductById(
  tx: Tx,
  organizationId: string,
  productId: string,
): Promise<Product | null> {
  const [result] = await tx
    .select()
    .from(product)
    .where(
      and(
        eq(product.id, productId),
        eq(product.organizationId, organizationId),
      ),
    )
    .limit(1);
  return result || null;
}

export async function createProduct(
  tx: Tx,
  organizationId: string,
  data: Omit<NewProduct, "organizationId">,
): Promise<Product> {
  const [created] = await tx
    .insert(product)
    .values({
      ...data,
      organizationId,
    })
    .returning();
  return created;
}

export async function updateProduct(
  tx: Tx,
  organizationId: string,
  productId: string,
  data: Partial<NewProduct>,
): Promise<Product | null> {
  const [updated] = await tx
    .update(product)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(product.id, productId),
        eq(product.organizationId, organizationId),
      ),
    )
    .returning();
  return updated || null;
}

export async function deleteProduct(
  tx: Tx,
  organizationId: string,
  productId: string,
): Promise<boolean> {
  const [deleted] = await tx
    .update(product)
    .set({ active: false, updatedAt: new Date() })
    .where(
      and(
        eq(product.id, productId),
        eq(product.organizationId, organizationId),
      ),
    )
    .returning();
  return !!deleted;
}
