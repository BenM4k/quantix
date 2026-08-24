import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAuthContext } from "@/lib/auth-context";
import { getStockLedgerEntriesService } from "@/services/inventory/stock-ledger.service";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  Layers,
  Plus,
  ArrowRight,
  Warehouse,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Operations Overview | Quantix",
  description: "Operations, inventory management, and stock activity.",
};

async function AsyncRecentStockMovements({
  companyId,
  role,
}: {
  companyId: string;
  role: string;
}) {
  const ledgerRes = await getStockLedgerEntriesService(companyId, role, { page: 1, pageSize: 6 });
  const recentMovements = ledgerRes.ok ? ledgerRes.value.rows : [];

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Recent Movements</h2>
          <p className="text-xs text-muted-foreground">Latest inventory transactions</p>
        </div>
        <Link
          href={`/${companyId}/operations/stock-ledger`}
          className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {recentMovements.length === 0 ? (
        <div className="py-12 text-center text-xs text-muted-foreground">
          No stock movements recorded yet.
        </div>
      ) : (
        <div className="space-y-2.5">
          {recentMovements.map((entry) => {
            const qty = Number(entry.quantity);
            const isPositive = qty > 0;
            return (
              <div
                key={entry.id}
                className="p-3 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {entry.productName}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    #{entry.sequenceNumber} · {entry.movementType}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`font-mono font-bold flex items-center justify-end ${
                      isPositive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
                    )}
                    {isPositive ? `+${qty}` : qty}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StockMovementsSkeleton() {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-36 rounded-lg" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>
      <div className="space-y-2.5 pt-2">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default async function OperationsOverviewPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const { role } = await getAuthContext();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Operations & Inventory
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage product catalog, real-time stock balances, movements, and warehouse configuration.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${companyId}/operations/products`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Product Master</span>
          </Link>
        </div>
      </div>

      {/* Grid: Module Workspaces (Instant) + Streamed Recent Stock Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Operation Workspaces */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-foreground">Operational Workspaces</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 hover:border-indigo-500/40 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Package className="h-5 w-5" />
                </div>
                <Link
                  href={`/${companyId}/operations/products`}
                  className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <h3 className="font-bold text-foreground text-sm">Product Master Catalog</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Configure SKUs, units of measure, sell/cost pricing, and low-stock alert thresholds.
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 hover:border-indigo-500/40 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <Layers className="h-5 w-5" />
                </div>
                <Link
                  href={`/${companyId}/operations/stock-ledger`}
                  className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <h3 className="font-bold text-foreground text-sm">Stock Activity Ledger</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Immutable audit trail of inventory adjustments, receipts, sales issues, and cost layers.
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 hover:border-indigo-500/40 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center border border-slate-500/20">
                  <Warehouse className="h-5 w-5" />
                </div>
                <Link
                  href={`/${companyId}/settings/warehouse`}
                  className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <h3 className="font-bold text-foreground text-sm">Warehouse Facilities</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Manage warehouse locations, address records, and primary fulfillment defaults.
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 hover:border-indigo-500/40 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <Link
                  href={`/${companyId}/reports`}
                  className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  View Reports <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <h3 className="font-bold text-foreground text-sm">Inventory Analytics Hub</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Access stock valuation, inventory turnover, and cost analysis in the Reports module.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Streamed Recent Stock Movements Feed */}
        <Suspense fallback={<StockMovementsSkeleton />}>
          <AsyncRecentStockMovements companyId={companyId} role={role} />
        </Suspense>
      </div>
    </div>
  );
}
