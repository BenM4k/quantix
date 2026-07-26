import "server-only";

import { and, eq } from "drizzle-orm";
import { fiscalPeriod } from "@/services/drizzle/schemas";
import type { Tx } from "@/services/drizzle";

export async function updateFiscalPeriodStatus(
  tx: Tx,
  organizationId: string,
  periodId: string,
  status: "open" | "closed",
  userId: string,
) {
  const [updated] = await tx
    .update(fiscalPeriod)
    .set({
      status,
      closedAt: status === "closed" ? new Date() : null,
      closedBy: status === "closed" ? userId : null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(fiscalPeriod.organizationId, organizationId),
        eq(fiscalPeriod.id, periodId),
      ),
    )
    .returning();

  return updated;
}
