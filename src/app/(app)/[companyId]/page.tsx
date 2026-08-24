import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getAuthContext } from "@/lib/auth-context";
import { getDashboardStatsService } from "@/services/dashboard/dashboard.service";
import { OverviewKpis } from "./components/overview-kpis";
import { OverviewLaunchpads } from "./components/overview-launchpads";
import { OverviewRecentActivity } from "./components/overview-recent-activity";
import { OverviewQuickActions } from "./components/overview-quick-actions";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "ERP Overview | Quantix",
  description: "Executive ERP dashboard and core module launchpad.",
};

async function AsyncOverviewKpis({ companyId }: { companyId: string }) {
  const stats = await getDashboardStatsService(companyId);
  return <OverviewKpis stats={stats} />;
}

async function AsyncOverviewRecentActivity({ companyId }: { companyId: string }) {
  const stats = await getDashboardStatsService(companyId);
  return (
    <OverviewRecentActivity
      companyId={companyId}
      invoices={stats.recentInvoices}
    />
  );
}

function KpisSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-28 rounded-2xl" />
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32 rounded-lg" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>
      <div className="space-y-3 pt-2">
        <Skeleton className="h-8 w-full rounded-xl" />
        <Skeleton className="h-8 w-full rounded-xl" />
        <Skeleton className="h-8 w-full rounded-xl" />
        <Skeleton className="h-8 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default async function CompanyOverviewPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const { company, user, role } = await getAuthContext();

  return (
    <div className="space-y-7">
      {/* Overview Header - Instant static shell */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/60">
              {company.name}
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              Role: {role}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground mt-1">
            Enterprise Overview
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Welcome back, {user.name}. Here is an executive summary of your operations.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <OverviewQuickActions companyId={companyId} />
      </div>

      {/* KPI Metrics - Streamed via Suspense */}
      <Suspense fallback={<KpisSkeleton />}>
        <AsyncOverviewKpis companyId={companyId} />
      </Suspense>

      {/* Main Grid: Modules Launchpad + Streamed Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <OverviewLaunchpads companyId={companyId} />
        </div>
        <div className="space-y-6">
          <Suspense fallback={<ActivitySkeleton />}>
            <AsyncOverviewRecentActivity companyId={companyId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
