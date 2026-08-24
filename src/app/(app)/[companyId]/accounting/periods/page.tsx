import { requireTenantContext } from "@/lib/require-tenant-context";
import { withTenantTransaction } from "@/lib/tenant-context";
import { getFiscalPeriodsList } from "@/dal/fiscal-period/queries";
import { PeriodsClient } from "./periods-client";

import { CategorySubNav } from "@/components/navigation/category-sub-nav";

interface PageProps {
  params: Promise<{ companyId: string }>;
}

export default async function PeriodsPage({ params }: PageProps) {
  const { companyId } = await params;
  const ctx = await requireTenantContext();

  if (!ctx.ok) {
    throw new Error(ctx.error.message);
  }

  const periods = await withTenantTransaction(companyId, async (tx) => {
    return getFiscalPeriodsList(tx, companyId);
  });

  return (
    <PeriodsClient
      companyId={companyId}
      periods={periods}
      userRole={ctx.value.role}
    />
  );
}
