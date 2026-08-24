import React from "react";
import { withTenantTransaction } from "@/lib/tenant-context";
import { getLedgerAccountsList } from "@/dal/ledger-account/queries";
import { getJournalEntryList } from "@/dal/journal-entry/queries";
import { getFiscalPeriodsList } from "@/dal/fiscal-period/queries";
import { CategorySubNav } from "@/components/navigation/category-sub-nav";
import { KpiCard } from "@/components/layout/kpi-card";
import { BookOpen, FileText, Calendar, Landmark } from "lucide-react";

interface AccountingLayoutProps {
  children: React.ReactNode;
  params: Promise<{ companyId: string }>;
}

export default async function AccountingLayout({
  children,
  params,
}: AccountingLayoutProps) {
  const { companyId } = await params;

  const { accountsData, entriesData, periods } = await withTenantTransaction(
    companyId,
    async (tx) => {
      const accountsData = await getLedgerAccountsList(tx, companyId, { page: 1, limit: 100 });
      const entriesData = await getJournalEntryList(tx, companyId, { page: 1, limit: 6 });
      const periods = await getFiscalPeriodsList(tx, companyId);
      return { accountsData, entriesData, periods };
    }
  );

  const bankAccountsCount = accountsData.accounts.filter((a) => a.isBankAccount).length;
  const openPeriodsCount = periods.filter((p) => p.status === "open").length;

  const subNavItems = [
    { label: "Overview", href: `/${companyId}/accounting` },
    { label: "Chart of Accounts", href: `/${companyId}/accounting/chart-of-accounts` },
    { label: "Transactions", href: `/${companyId}/accounting/journal-entries` },
    { label: "Fiscal Periods", href: `/${companyId}/accounting/periods` },
  ];

  return (
    <div className="space-y-6">
      {/* Category Sub-Navigation */}
      <CategorySubNav items={subNavItems} />

      {/* Category Neo-Morphic KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Chart of Accounts"
          value={`${accountsData.total}`}
          icon={BookOpen}
          trend={null}
          trendLabel="active ledger accounts"
          iconClassName="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
        />
        <KpiCard
          label="Posted Transactions"
          value={`${entriesData.total}`}
          icon={FileText}
          trend={18.5}
          trendLabel="balanced entries"
          variant="sparkline"
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
        />
        <KpiCard
          label="Open Fiscal Periods"
          value={`${openPeriodsCount}`}
          icon={Calendar}
          trend={null}
          trendLabel="accepting postings"
          variant="bars"
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
        />
        <KpiCard
          label="Bank Accounts"
          value={`${bankAccountsCount}`}
          icon={Landmark}
          trend={null}
          trendLabel="cash & depository"
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
        />
      </div>

      {/* Route Content */}
      <div>{children}</div>
    </div>
  );
}
