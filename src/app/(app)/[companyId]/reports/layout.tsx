import React from "react";
import { fetchReportsKpis } from "@/services/module-kpis/module-kpis.service";
import { CategorySubNav } from "@/components/navigation/category-sub-nav";
import { KpiCard } from "@/components/layout/kpi-card";
import { DollarSign, Clock, Package, Users } from "lucide-react";

interface ReportsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ companyId: string }>;
}

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);

export default async function ReportsLayout({
  children,
  params,
}: ReportsLayoutProps) {
  const { companyId } = await params;

  const { invoiceKpis, productKpis, customerKpis } = await fetchReportsKpis(companyId);

  const subNavItems = [
    { label: "Overview", href: `/${companyId}/reports` },
    { label: "Profit & Loss", href: `/${companyId}/reports/p-and-l` },
    { label: "Balance Sheet", href: `/${companyId}/reports/balance-sheet` },
    { label: "AR Aging", href: `/${companyId}/reports/ar-aging` },
    { label: "Stock Valuation", href: `/${companyId}/reports/stock-valuation` },
  ];

  return (
    <div className="space-y-6">
      {/* Category Sub-Navigation */}
      <CategorySubNav items={subNavItems} />

      {/* Category Neo-Morphic KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Collected Revenue"
          value={fmt(invoiceKpis.totalRevenue)}
          icon={DollarSign}
          trend={14.2}
          trendLabel="vs last quarter"
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
        />
        <KpiCard
          label="Outstanding AR"
          value={fmt(invoiceKpis.outstanding)}
          icon={Clock}
          trend={-2.1}
          trendLabel={`${invoiceKpis.overdueCount} overdue`}
          variant="bars"
          iconClassName="bg-rose-500/10 text-rose-500 border-rose-500/20"
        />
        <KpiCard
          label="Catalog SKUs"
          value={`${productKpis.total}`}
          icon={Package}
          trend={6.8}
          trendLabel={`${productKpis.active} active for sale`}
          variant="sparkline"
          iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
        />
        <KpiCard
          label="Active Customer Accounts"
          value={`${customerKpis.active}`}
          icon={Users}
          trend={null}
          trendLabel={`Net ${customerKpis.avgPaymentTerms}d average terms`}
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
        />
      </div>

      {/* Route Content */}
      <div>{children}</div>
    </div>
  );
}
