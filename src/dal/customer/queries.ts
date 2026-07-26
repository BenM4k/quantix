import "server-only";

import { eq, and, ilike, or, count, asc, desc } from "drizzle-orm";
import { type Tx } from "@/services/drizzle";
import { customer, type Customer, type NewCustomer } from "@/services/drizzle/schemas";

export type CustomerPaginationParams = {
  page: number;
  pageSize: number;
  search?: string;
  sort?: string;
};

export async function getPaginatedCustomers(
  tx: Tx,
  organizationId: string,
  params: CustomerPaginationParams,
): Promise<{ rows: Customer[]; total: number }> {
  const { page = 1, pageSize = 20, search, sort = "name:asc" } = params;
  const offset = (page - 1) * pageSize;

  const conditions = [
    eq(customer.organizationId, organizationId),
    eq(customer.active, true),
  ];

  if (search && search.trim() !== "") {
    const searchPattern = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(customer.name, searchPattern),
        ilike(customer.email, searchPattern),
        ilike(customer.phone, searchPattern),
      )!,
    );
  }

  const whereCondition = and(...conditions);

  const [{ countValue }] = await tx
    .select({ countValue: count() })
    .from(customer)
    .where(whereCondition);

  let orderBy = [asc(customer.name)];
  if (sort) {
    const [field, direction] = sort.split(":");
    const dirFn = direction === "desc" ? desc : asc;
    if (field === "name") orderBy = [dirFn(customer.name)];
    else if (field === "email") orderBy = [dirFn(customer.email)];
    else if (field === "paymentTermsDays") orderBy = [dirFn(customer.paymentTermsDays)];
  }

  const rows = await tx
    .select()
    .from(customer)
    .where(whereCondition)
    .orderBy(...orderBy)
    .limit(pageSize)
    .offset(offset);

  return {
    rows,
    total: Number(countValue),
  };
}

export async function getActiveCustomerById(
  tx: Tx,
  organizationId: string,
  customerId: string,
): Promise<Customer | null> {
  const [result] = await tx
    .select()
    .from(customer)
    .where(
      and(
        eq(customer.id, customerId),
        eq(customer.organizationId, organizationId),
        eq(customer.active, true),
      ),
    )
    .limit(1);
  return result || null;
}

export async function createCustomer(
  tx: Tx,
  organizationId: string,
  data: Omit<NewCustomer, "organizationId">,
): Promise<Customer> {
  const [created] = await tx
    .insert(customer)
    .values({
      ...data,
      organizationId,
    })
    .returning();
  return created;
}

export async function updateCustomer(
  tx: Tx,
  organizationId: string,
  customerId: string,
  data: Partial<NewCustomer>,
): Promise<Customer | null> {
  const [updated] = await tx
    .update(customer)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(customer.id, customerId),
        eq(customer.organizationId, organizationId),
      ),
    )
    .returning();
  return updated || null;
}

export async function deleteCustomer(
  tx: Tx,
  organizationId: string,
  customerId: string,
): Promise<boolean> {
  const [deleted] = await tx
    .update(customer)
    .set({ active: false, updatedAt: new Date() })
    .where(
      and(
        eq(customer.id, customerId),
        eq(customer.organizationId, organizationId),
      ),
    )
    .returning();
  return !!deleted;
}
