"use server";

import { requireTenantContext } from "@/lib/require-tenant-context";
import {
  updateCompanySettingsService,
  UpdateCompanyFiscalSettingsInput,
} from "@/services/company/settings.service";

export async function updateCompanySettingsAction(
  companyId: string,
  input: UpdateCompanyFiscalSettingsInput,
) {
  const ctx = await requireTenantContext();
  if (!ctx.ok) return { ok: false, error: ctx.error.message };

  const res = await updateCompanySettingsService(
    companyId,
    input,
    ctx.value.userId,
    ctx.value.role,
  );

  if (!res.ok) return { ok: false, error: res.error.message };

  return { ok: true, data: res.value };
}
