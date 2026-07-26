import { requireTenantContext } from "@/lib/require-tenant-context";
import { withTenantTransaction } from "@/lib/tenant-context";
import {
  getLedgerAccountsList,
  hasAccountActivity,
} from "@/dal/ledger-account/queries";
import { ChartOfAccountsClient } from "./chart-of-accounts-client";

interface PageProps {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{
    search?: string;
    type?: string;
    page?: string;
    selected?: string;
  }>;
}

export default async function ChartOfAccountsPage({
  params,
  searchParams,
}: PageProps) {
  const { companyId } = await params;
  const sParams = await searchParams;
  const ctx = await requireTenantContext();

  if (!ctx.ok) {
    throw new Error(ctx.error.message);
  }

  const page = sParams.page ? parseInt(sParams.page, 10) : 1;

  const { accounts, total } = await withTenantTransaction(
    companyId,
    async (tx) => {
      return getLedgerAccountsList(tx, companyId, {
        search: sParams.search,
        type: sParams.type,
        page,
        limit: 50,
      });
    },
  );

  // Check activity for each account listed to populate lock flags
  const hasActivityMap: Record<string, boolean> = {};
  await withTenantTransaction(companyId, async (tx) => {
    for (const acc of accounts) {
      hasActivityMap[acc.id] = await hasAccountActivity(tx, companyId, acc.id);
    }
  });

  return (
    <ChartOfAccountsClient
      companyId={companyId}
      accounts={accounts}
      totalAccounts={total}
      userRole={ctx.value.role}
      hasActivityMap={hasActivityMap}
    />
  );
}
