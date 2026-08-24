import React from "react";
import { fetchProductKpis } from "@/services/module-kpis/module-kpis.service";
import { getStockLedgerEntriesService } from "@/services/inventory/stock-ledger.service";
import { getAuthContext } from "@/lib/auth-context";
import { CategorySubNav } from "@/components/navigation/category-sub-nav";
import { KpiCard } from "@/components/layout/kpi-card";
import { Package, AlertTriangle, Layers, CheckCircle2 } from "lucide-react";

interface OperationsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ companyId: string }>;
}

export default async function OperationsLayout({
  children,
  params,
}: OperationsLayoutProps) {
  const { companyId } = await params;
  const { role } = await getAuthContext();

  const productKpis = await fetchProductKpis(companyId);
  const ledgerRes = await getStockLedgerEntriesService(companyId, role, { page: 1, pageSize: 1 });

  const subNavItems = [
    { label: "Overview", href: `/${companyId}/operations` },
    { label: "Products", href: `/${companyId}/operations/products` },
    { label: "Stock Ledger", href: `/${companyId}/operations/stock-ledger` },
  ];

  return (
    <div className="space-y-6">
      {/* Category Sub-Navigation */}
      <CategorySubNav items={subNavItems} />

      {/* Category Neo-Morphic KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Products"
          value={`${productKpis.total}`}
          icon={Package}
          trend={null}
          trendLabel="catalog items"
          iconClassName="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
        />
        <KpiCard
          label="Active SKUs"
          value={`${productKpis.active}`}
          icon={CheckCircle2}
          trend={4.2}
          trendLabel="ready for sale"
          variant="bars"
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
        />
        <KpiCard
          label="Inactive SKUs"
          value={`${Math.max(0, productKpis.total - productKpis.active)}`}
          icon={AlertTriangle}
          trend={null}
          trendLabel="archived or draft"
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
        />
        <KpiCard
          label="Recent Stock Audits"
          value={`${ledgerRes.ok ? ledgerRes.value.total : 0}`}
          icon={Layers}
          trend={12.0}
          trendLabel="movements logged"
          variant="sparkline"
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
        />
      </div>

      {/* Route Content */}
      <div>{children}</div>
    </div>
  );
}
