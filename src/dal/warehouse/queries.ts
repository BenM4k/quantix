import "server-only";

import { eq, and } from "drizzle-orm";
import { type Tx } from "@/services/drizzle";
import { warehouse, type Warehouse, type NewWarehouse } from "@/services/drizzle/schemas";

export async function getCompanyWarehouse(
  tx: Tx,
  organizationId: string,
): Promise<Warehouse | null> {
  const [result] = await tx
    .select()
    .from(warehouse)
    .where(eq(warehouse.organizationId, organizationId))
    .limit(1);
  return result || null;
}

export async function upsertWarehouse(
  tx: Tx,
  organizationId: string,
  data: Partial<NewWarehouse> & { name: string },
): Promise<Warehouse> {
  const existing = await getCompanyWarehouse(tx, organizationId);

  if (existing) {
    const [updated] = await tx
      .update(warehouse)
      .set({
        name: data.name,
        address: data.address,
        imageUrl: data.imageUrl,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(warehouse.id, existing.id),
          eq(warehouse.organizationId, organizationId),
        ),
      )
      .returning();
    return updated;
  } else {
    const [created] = await tx
      .insert(warehouse)
      .values({
        organizationId,
        name: data.name,
        address: data.address,
        imageUrl: data.imageUrl,
        isDefault: true,
      })
      .returning();
    return created;
  }
}
