import "server-only";

import { withTenantTransaction } from "@/lib/tenant-context";
import { canX } from "@/lib/permissions";
import { Err, Ok, type Result } from "@/lib/server-utils";
import { updateFiscalPeriodStatus } from "@/dal/fiscal-period/mutations";
import { getFiscalPeriodById } from "@/dal/fiscal-period/queries";
import type { FiscalPeriod } from "@/services/drizzle/schemas";

export type PeriodServiceResult = Result<FiscalPeriod, { code: string; message: string }>;

export async function closePeriodService(
  companyId: string,
  periodId: string,
  userId: string,
  userRole: string,
): Promise<PeriodServiceResult> {
  if (!canX(userRole, { id: companyId }, "period:close")) {
    return Err({
      code: "FORBIDDEN",
      message: "You do not have permission to close fiscal periods.",
    });
  }

  return withTenantTransaction(companyId, async (tx) => {
    const period = await getFiscalPeriodById(tx, companyId, periodId);
    if (!period) {
      return Err({
        code: "NOT_FOUND",
        message: "Fiscal period not found.",
      });
    }

    if (period.status === "closed") {
      return Err({
        code: "ALREADY_CLOSED",
        message: "Fiscal period is already closed.",
      });
    }

    const updated = await updateFiscalPeriodStatus(
      tx,
      companyId,
      periodId,
      "closed",
      userId,
    );

    return Ok(updated);
  });
}

export async function reopenPeriodService(
  companyId: string,
  periodId: string,
  userId: string,
  userRole: string,
): Promise<PeriodServiceResult> {
  if (!canX(userRole, { id: companyId }, "period:close")) {
    return Err({
      code: "FORBIDDEN",
      message: "You do not have permission to reopen fiscal periods.",
    });
  }

  return withTenantTransaction(companyId, async (tx) => {
    const period = await getFiscalPeriodById(tx, companyId, periodId);
    if (!period) {
      return Err({
        code: "NOT_FOUND",
        message: "Fiscal period not found.",
      });
    }

    if (period.status === "open") {
      return Err({
        code: "ALREADY_OPEN",
        message: "Fiscal period is already open.",
      });
    }

    const updated = await updateFiscalPeriodStatus(
      tx,
      companyId,
      periodId,
      "open",
      userId,
    );

    return Ok(updated);
  });
}
