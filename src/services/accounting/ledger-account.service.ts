import "server-only";

import { withTenantTransaction } from "@/lib/tenant-context";
import { canX } from "@/lib/permissions";
import { Err, Ok, type Result } from "@/lib/server-utils";
import {
  createLedgerAccount,
  updateLedgerAccount,
} from "@/dal/ledger-account/mutations";
import {
  getLedgerAccountByCode,
  getLedgerAccountById,
  hasAccountActivity,
} from "@/dal/ledger-account/queries";
import {
  createAccountSchema,
  updateAccountSchema,
  type CreateAccountInput,
  type UpdateAccountInput,
} from "@/lib/schemas/accounting";
import type { LedgerAccount } from "@/services/drizzle/schemas";

export async function createAccountService(
  companyId: string,
  userRole: string,
  input: CreateAccountInput,
): Promise<Result<LedgerAccount, { code: string; message: string }>> {
  if (!canX(userRole, { id: companyId }, "account:create")) {
    return Err({
      code: "FORBIDDEN",
      message: "You do not have permission to create ledger accounts.",
    });
  }

  const parsed = createAccountSchema.safeParse(input);
  if (!parsed.success) {
    return Err({
      code: "INVALID_INPUT",
      message: parsed.error.issues[0]?.message || "Invalid account input.",
    });
  }

  return withTenantTransaction(companyId, async (tx) => {
    const existing = await getLedgerAccountByCode(
      tx,
      companyId,
      parsed.data.code,
    );
    if (existing) {
      return Err({
        code: "DUPLICATE_CODE",
        message: `An account with code "${parsed.data.code}" already exists.`,
      });
    }

    const created = await createLedgerAccount(tx, {
      organizationId: companyId,
      ...parsed.data,
    });

    return Ok(created);
  });
}

export async function updateAccountService(
  companyId: string,
  accountId: string,
  userRole: string,
  input: UpdateAccountInput,
): Promise<Result<LedgerAccount, { code: string; message: string }>> {
  if (!canX(userRole, { id: companyId }, "account:edit")) {
    return Err({
      code: "FORBIDDEN",
      message: "You do not have permission to edit ledger accounts.",
    });
  }

  const parsed = updateAccountSchema.safeParse(input);
  if (!parsed.success) {
    return Err({
      code: "INVALID_INPUT",
      message: parsed.error.issues[0]?.message || "Invalid account input.",
    });
  }

  return withTenantTransaction(companyId, async (tx) => {
    const account = await getLedgerAccountById(tx, companyId, accountId);
    if (!account) {
      return Err({
        code: "NOT_FOUND",
        message: "Ledger account not found.",
      });
    }

    const hasActivity = await hasAccountActivity(tx, companyId, accountId);

    // If account has activity, type and normalBalance cannot be changed
    const updateData: Partial<UpdateAccountInput> = { ...parsed.data };
    if (hasActivity) {
      delete updateData.type;
      delete updateData.normalBalance;
    }

    const updated = await updateLedgerAccount(
      tx,
      companyId,
      accountId,
      updateData,
    );

    return Ok(updated);
  });
}
