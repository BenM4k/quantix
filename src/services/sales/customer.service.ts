import "server-only";

import { withTenantTransaction } from "@/lib/tenant-context";
import { Ok, Err, tryCatch, type Result } from "@/lib/server-utils";
import { canX } from "@/lib/permissions";
import {
  getPaginatedCustomers,
  getActiveCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type CustomerPaginationParams,
} from "@/dal/customer/queries";
import { type Customer } from "@/services/drizzle/schemas";
import { type CustomerInput } from "@/lib/schemas/customer";

export type CustomerServiceError =
  | { code: "FORBIDDEN"; message: string }
  | { code: "NOT_FOUND"; message: string }
  | { code: "DB_ERROR"; message: string };

export async function getCustomersService(
  organizationId: string,
  userRole: string,
  params: CustomerPaginationParams,
): Promise<Result<{ rows: Customer[]; total: number }, CustomerServiceError>> {
  if (!canX(userRole, { id: organizationId }, "customer:view")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to view customers" });
  }

  return tryCatch(
    () => withTenantTransaction(organizationId, (tx) => getPaginatedCustomers(tx, organizationId, params)),
    (cause) => ({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to load customers",
    }),
  );
}

export async function getCustomerByIdService(
  organizationId: string,
  userRole: string,
  customerId: string,
): Promise<Result<Customer, CustomerServiceError>> {
  if (!canX(userRole, { id: organizationId }, "customer:view")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to view customer" });
  }

  const res = await tryCatch(
    () => withTenantTransaction(organizationId, (tx) => getActiveCustomerById(tx, organizationId, customerId)),
    (cause) => ({
      code: "DB_ERROR" as const,
      message: cause instanceof Error ? cause.message : "Failed to fetch customer",
    }),
  );

  if (!res.ok) return res;
  if (!res.value) return Err({ code: "NOT_FOUND", message: "Customer not found" });

  return Ok(res.value);
}

export async function createCustomerService(
  organizationId: string,
  userRole: string,
  input: CustomerInput,
): Promise<Result<Customer, CustomerServiceError>> {
  if (!canX(userRole, { id: organizationId }, "customer:create")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to create customer" });
  }

  return tryCatch(
    () =>
      withTenantTransaction(organizationId, (tx) =>
        createCustomer(tx, organizationId, {
          name: input.name,
          email: input.email || null,
          phone: input.phone || null,
          taxId: input.taxId || null,
          paymentTermsDays: input.paymentTermsDays,
          active: input.active,
        }),
      ),
    (cause) => ({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to create customer",
    }),
  );
}

export async function updateCustomerService(
  organizationId: string,
  userRole: string,
  customerId: string,
  input: CustomerInput,
): Promise<Result<Customer, CustomerServiceError>> {
  if (!canX(userRole, { id: organizationId }, "customer:update")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to update customer" });
  }

  const res = await tryCatch(
    () =>
      withTenantTransaction(organizationId, (tx) =>
        updateCustomer(tx, organizationId, customerId, {
          name: input.name,
          email: input.email || null,
          phone: input.phone || null,
          taxId: input.taxId || null,
          paymentTermsDays: input.paymentTermsDays,
          active: input.active,
        }),
      ),
    (cause) => ({
      code: "DB_ERROR" as const,
      message: cause instanceof Error ? cause.message : "Failed to update customer",
    }),
  );

  if (!res.ok) return res;
  if (!res.value) return Err({ code: "NOT_FOUND", message: "Customer not found" });

  return Ok(res.value);
}

export async function deleteCustomerService(
  organizationId: string,
  userRole: string,
  customerId: string,
): Promise<Result<void, CustomerServiceError>> {
  if (!canX(userRole, { id: organizationId }, "customer:delete")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to delete customer" });
  }

  const res = await tryCatch(
    () => withTenantTransaction(organizationId, (tx) => deleteCustomer(tx, organizationId, customerId)),
    (cause) => ({
      code: "DB_ERROR" as const,
      message: cause instanceof Error ? cause.message : "Failed to delete customer",
    }),
  );

  if (!res.ok) return res;
  return Ok(undefined);
}
