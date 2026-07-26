import "server-only";

import { and, eq, gte, lte, asc } from "drizzle-orm";
import { fiscalPeriod } from "@/services/drizzle/schemas";
import type { Tx } from "@/services/drizzle";

/**
 * Find the open fiscal period covering a given date. Returns null if
 * none is open for that date.
 */
export async function getOpenPeriodForDate(
  tx: Tx,
  organizationId: string,
  onDate: string,
) {
  const [period] = await tx
    .select()
    .from(fiscalPeriod)
    .where(
      and(
        eq(fiscalPeriod.organizationId, organizationId),
        eq(fiscalPeriod.status, "open"),
        lte(fiscalPeriod.startDate, onDate),
        gte(fiscalPeriod.endDate, onDate),
      ),
    )
    .limit(1);
  return period || null;
}

export async function getFiscalPeriodById(
  tx: Tx,
  organizationId: string,
  fiscalPeriodId: string,
) {
  const [period] = await tx
    .select()
    .from(fiscalPeriod)
    .where(
      and(
        eq(fiscalPeriod.organizationId, organizationId),
        eq(fiscalPeriod.id, fiscalPeriodId),
      ),
    )
    .limit(1);
  return period || null;
}

export async function getFiscalPeriodsList(
  tx: Tx,
  organizationId: string,
) {
  return tx
    .select()
    .from(fiscalPeriod)
    .where(eq(fiscalPeriod.organizationId, organizationId))
    .orderBy(asc(fiscalPeriod.startDate));
}
