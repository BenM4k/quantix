import "server-only";

import { and, eq, gte, lte } from "drizzle-orm";
import { fiscalPeriod } from "@/services/drizzle/schemas";
import { Tx } from "@/services/drizzle";

/**
 * Find the open fiscal period covering a given date. Returns undefined if
 * none is open for that date (either it doesn't exist yet, or it's closed) —
 * the Service layer turns that into an Err, not this function.
 */
export async function getOpenPeriodForDate(
  tx: Tx,
  organizationId: string,
  onDate: string,
) {
  return tx.query.fiscalPeriod.findFirst({
    where: {
      organizationId,
      status: "open",
      startDate: { lte: onDate },
      endDate: { gte: onDate },
    },
  });
}

export async function getFiscalPeriodById(
  tx: Tx,
  organizationId: string,
  fiscalPeriodId: string,
) {
  return tx.query.fiscalPeriod.findFirst({
    where: {
      organizationId,
      id: fiscalPeriodId,
    },
  });
}
