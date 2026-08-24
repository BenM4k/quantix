import React from "react";
import { DollarSign, FileText, ShoppingBag, Package, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/layout/kpi-card";

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);

interface OverviewKpisProps {
  stats: {
    totalRevenue: number;
    openInvoiceCount: number;
    openOrderCount: number;
    productCount: number;
  };
}

export function OverviewKpis({ stats }: OverviewKpisProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        label="Total Revenue"
        value={fmt(stats.totalRevenue)}
        icon={DollarSign}
        trend={8.4}
        trendLabel="vs last month"
        iconClassName="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
      />
      <KpiCard
        label="Open Invoices"
        value={`${stats.openInvoiceCount}`}
        icon={FileText}
        trend={null}
        trendLabel="pending collection"
        iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
      />
      <KpiCard
        label="Active Orders"
        value={`${stats.openOrderCount}`}
        icon={ShoppingBag}
        trend={12.0}
        trendLabel="pipeline volume"
        iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
      />
      <KpiCard
        label="Products in Catalog"
        value={`${stats.productCount}`}
        icon={Package}
        trend={null}
        trendLabel="active SKUs"
        iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      />
    </div>
  );
}
