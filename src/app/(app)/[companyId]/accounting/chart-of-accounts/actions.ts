"use server";

import { revalidatePath } from "next/cache";
import { requireTenantContext } from "@/lib/require-tenant-context";
import { Err, type Result } from "@/lib/server-utils";
import {
  createAccountService,
  updateAccountService,
} from "@/services/accounting/ledger-account.service";
import {
  createAccountSchema,
  updateAccountSchema,
  type CreateAccountInput,
  type UpdateAccountInput,
} from "@/lib/schemas/accounting";
import type { LedgerAccount } from "@/services/drizzle/schemas";

export async function createAccountAction(
  companyId: string,
  input: CreateAccountInput,
): Promise<Result<LedgerAccount, { code: string; message: string }>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  const validated = createAccountSchema.safeParse(input);
  if (!validated.success) {
    return Err({
      code: "INVALID_INPUT",
      message: validated.error.issues[0]?.message || "Invalid input data",
    });
  }

  const result = await createAccountService(
    ctx.value.organizationId,
    ctx.value.role,
    validated.data,
  );

  if (result.ok) {
    revalidatePath(`/${companyId}/accounting/chart-of-accounts`);
  }

  return result;
}

export async function updateAccountAction(
  companyId: string,
  accountId: string,
  input: UpdateAccountInput,
): Promise<Result<LedgerAccount, { code: string; message: string }>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  const validated = updateAccountSchema.safeParse(input);
  if (!validated.success) {
    return Err({
      code: "INVALID_INPUT",
      message: validated.error.issues[0]?.message || "Invalid input data",
    });
  }

  const result = await updateAccountService(
    ctx.value.organizationId,
    accountId,
    ctx.value.role,
    validated.data,
  );

  if (result.ok) {
    revalidatePath(`/${companyId}/accounting/chart-of-accounts`);
  }

  return result;
}
