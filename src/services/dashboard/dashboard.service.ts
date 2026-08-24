import "server-only";

import { withTenantTransaction } from "@/lib/tenant-context";
import { getDashboardStats, type DashboardStats } from "@/dal/dashboard/queries";

export async function getDashboardStatsService(
  organizationId: string,
): Promise<DashboardStats> {
  return withTenantTransaction(organizationId, (tx) =>
    getDashboardStats(tx, organizationId),
  );
}
