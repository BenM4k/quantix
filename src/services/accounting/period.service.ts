import "server-only";

import { withTenantTransaction } from "@/lib/tenant-context";
import { canX } from "@/lib/permissions";
import { Err, Ok, type Result } from "@/lib/server-utils";
import { updateFiscalPeriodStatus } from "@/dal/fiscal-period/mutations";
import { getFiscalPeriodById } from "@/dal/fiscal-period/queries";
import { fiscalPeriod, fiscalYear, companyProfile } from "@/services/drizzle/schemas";
import type { FiscalPeriod } from "@/services/drizzle/schemas";
import { and, eq } from "drizzle-orm";

export type PeriodServiceResult = Result<FiscalPeriod, { code: string; message: string }>;

export async function generateFiscalYearService(
  companyId: string,
  year: number,
  userId: string,
  userRole: string,
): Promise<Result<{ success: boolean }, { code: string; message: string }>> {
  if (!canX(userRole, { id: companyId }, "period:close")) {
    return Err({
      code: "FORBIDDEN",
      message: "You do not have permission to manage fiscal periods.",
    });
  }

  try {
    return await withTenantTransaction(companyId, async (tx) => {
      // 1. Get company profile for fiscal year settings
      const [profile] = await tx
        .select()
        .from(companyProfile)
        .where(eq(companyProfile.organizationId, companyId))
        .limit(1);

      const startMonth = profile?.fiscalYearStartMonth || 1;
      const startDay = profile?.fiscalYearStartDay || 1;

      // 2. Check if the fiscal year already exists
      const label = `FY ${year}`;
      const [existing] = await tx
        .select()
        .from(fiscalYear)
        .where(
          and(
            eq(fiscalYear.organizationId, companyId),
            eq(fiscalYear.label, label),
          ),
        )
        .limit(1);

      if (existing) {
        return Err({
          code: "ALREADY_EXISTS",
          message: `Fiscal Year ${year} already exists.`,
        });
      }

      // 3. Calculate year dates
      const startDate = `${year}-${startMonth.toString().padStart(2, "0")}-${startDay.toString().padStart(2, "0")}`;
      const nextYearStart = new Date(year + 1, startMonth - 1, startDay);
      const yearEnd = new Date(nextYearStart.getTime() - 24 * 60 * 60 * 1000);
      const endDate = `${yearEnd.getFullYear()}-${(yearEnd.getMonth() + 1).toString().padStart(2, "0")}-${yearEnd.getDate().toString().padStart(2, "0")}`;

      // 4. Create Fiscal Year record
      const [fy] = await tx
        .insert(fiscalYear)
        .values({
          organizationId: companyId,
          label,
          startDate,
          endDate,
          status: "open",
        })
        .returning();

      if (!fy) {
        return Err({
          code: "CREATION_FAILED",
          message: "Failed to create fiscal year record.",
        });
      }

      // 5. Create 12 monthly Period records
      for (let m = 0; m < 12; m++) {
        const currentPeriodMonth = (startMonth - 1 + m) % 12;
        const yearOffset = Math.floor((startMonth - 1 + m) / 12);
        const periodYear = year + yearOffset;

        const pStart = `${periodYear}-${(currentPeriodMonth + 1).toString().padStart(2, "0")}-${startDay.toString().padStart(2, "0")}`;

        const nextPeriodMonth = (startMonth + m) % 12;
        const nextYearOffset = Math.floor((startMonth + m) / 12);
        const nextPeriodYear = year + nextYearOffset;

        const nextPeriodStart = new Date(nextPeriodYear, nextPeriodMonth, startDay);
        const periodEnd = new Date(nextPeriodStart.getTime() - 24 * 60 * 60 * 1000);

        const pEnd = `${periodEnd.getFullYear()}-${(periodEnd.getMonth() + 1).toString().padStart(2, "0")}-${periodEnd.getDate().toString().padStart(2, "0")}`;

        await tx.insert(fiscalPeriod).values({
          organizationId: companyId,
          fiscalYearId: fy.id,
          periodNumber: m + 1,
          startDate: pStart,
          endDate: pEnd,
          status: "open",
        });
      }

      return Ok({ success: true });
    });
  } catch (cause) {
    console.error("[generateFiscalYearService] Database error:", cause);
    return Err({
      code: "DB_ERROR",
      message: "Failed to generate fiscal year. Please try again.",
    });
  }
}


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
