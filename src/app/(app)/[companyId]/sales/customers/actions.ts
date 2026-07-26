"use server";

import { revalidatePath } from "next/cache";
import { requireTenantContext } from "@/lib/require-tenant-context";
import { Err, type Result } from "@/lib/server-utils";
import { customerSchema, type CustomerInput } from "@/lib/schemas/customer";
import {
  createCustomerService,
  updateCustomerService,
  deleteCustomerService,
  getCustomerByIdService,
  type CustomerServiceError,
} from "@/services/sales/customer.service";
import { type Customer } from "@/services/drizzle/schemas";

export async function createCustomerAction(
  companyId: string,
  input: CustomerInput,
): Promise<Result<Customer, CustomerServiceError | { code: "INVALID_INPUT"; message: string }>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  const validated = customerSchema.safeParse(input);
  if (!validated.success) {
    return Err({
      code: "INVALID_INPUT",
      message: validated.error.issues[0]?.message || "Invalid input data",
    });
  }

  const result = await createCustomerService(
    ctx.value.organizationId,
    ctx.value.role,
    validated.data,
  );

  if (result.ok) {
    revalidatePath(`/${companyId}/sales/customers`);
  }

  return result;
}

export async function updateCustomerAction(
  companyId: string,
  customerId: string,
  input: CustomerInput,
): Promise<Result<Customer, CustomerServiceError | { code: "INVALID_INPUT"; message: string }>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  const validated = customerSchema.safeParse(input);
  if (!validated.success) {
    return Err({
      code: "INVALID_INPUT",
      message: validated.error.issues[0]?.message || "Invalid input data",
    });
  }

  const result = await updateCustomerService(
    ctx.value.organizationId,
    ctx.value.role,
    customerId,
    validated.data,
  );

  if (result.ok) {
    revalidatePath(`/${companyId}/sales/customers`);
  }

  return result;
}

export async function deleteCustomerAction(
  companyId: string,
  customerId: string,
): Promise<Result<void, CustomerServiceError>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  const result = await deleteCustomerService(
    ctx.value.organizationId,
    ctx.value.role,
    customerId,
  );

  if (result.ok) {
    revalidatePath(`/${companyId}/sales/customers`);
  }

  return result;
}

export async function getCustomerDetailAction(
  companyId: string,
  customerId: string,
): Promise<Result<Customer, CustomerServiceError>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  return getCustomerByIdService(ctx.value.organizationId, ctx.value.role, customerId);
}
