import React from "react";
import { fetchSalesKpis } from "@/services/module-kpis/module-kpis.service";
import { CategorySubNav } from "@/components/navigation/category-sub-nav";
import { KpiCard } from "@/components/layout/kpi-card";
import { DollarSign, Clock, ShoppingBag, UserCheck } from "lucide-react";

interface SalesLayoutProps {
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

export default async function SalesLayout({
  children,
  params,
}: SalesLayoutProps) {
  const { companyId } = await params;

  const { invoiceKpis, orderKpis, customerKpis } = await fetchSalesKpis(companyId);

  const subNavItems = [
    { label: "Overview", href: `/${companyId}/sales` },
    { label: "Invoices", href: `/${companyId}/sales/invoices` },
    { label: "Orders", href: `/${companyId}/sales/orders` },
    { label: "Quotes", href: `/${companyId}/sales/quotes` },
    { label: "Customers", href: `/${companyId}/sales/customers` },
  ];

  return (
    <div className="space-y-6">
      {/* Category Sub-Navigation */}
      <CategorySubNav items={subNavItems} />

      {/* Category Neo-Morphic KPI Cards Row matching reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Collected Revenue"
          value={fmt(invoiceKpis.totalRevenue)}
          icon={DollarSign}
          trend={12.5}
          trendLabel="from last month"
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
        />
        <KpiCard
          label="Outstanding Receivables"
          value={fmt(invoiceKpis.outstanding)}
          icon={Clock}
          trend={-4.2}
          trendLabel="overdue reduction"
          variant="bars"
          iconClassName="bg-rose-500/10 text-rose-500 border-rose-500/20"
        />
        <KpiCard
          label="Active Sales Orders"
          value={`${orderKpis.confirmed}`}
          icon={ShoppingBag}
          trend={8.2}
          trendLabel="pipeline volume"
          variant="sparkline"
          iconClassName="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
        />
        <KpiCard
          label="Active Customers"
          value={`${customerKpis.active}`}
          icon={UserCheck}
          trend={null}
          trendLabel={`Net ${customerKpis.avgPaymentTerms}d avg terms`}
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
        />
      </div>

      {/* Route Content */}
      <div>{children}</div>
    </div>
  );
}
