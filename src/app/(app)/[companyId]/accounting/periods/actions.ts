"use server";

import { revalidatePath } from "next/cache";
import { requireTenantContext } from "@/lib/require-tenant-context";
import { Err, type Result } from "@/lib/server-utils";
import {
  closePeriodService,
  reopenPeriodService,
} from "@/services/accounting/period.service";

export async function closePeriodAction(
  companyId: string,
  periodId: string,
): Promise<Result<any, { code: string; message: string }>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  const result = await closePeriodService(
    companyId,
    periodId,
    ctx.value.userId,
    ctx.value.role,
  );

  if (result.ok) {
    revalidatePath(`/${companyId}/accounting/periods`);
  }

  return result;
}

export async function reopenPeriodAction(
  companyId: string,
  periodId: string,
): Promise<Result<any, { code: string; message: string }>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  const result = await reopenPeriodService(
    companyId,
    periodId,
    ctx.value.userId,
    ctx.value.role,
  );

  if (result.ok) {
    revalidatePath(`/${companyId}/accounting/periods`);
  }

  return result;
}
