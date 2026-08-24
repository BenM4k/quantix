import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { withTenantTransaction } from "@/lib/tenant-context";
import { getJournalEntryList } from "@/dal/journal-entry/queries";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  FileText,
  Calendar,
  Scale,
  Plus,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Accounting Overview | Quantix",
  description: "General ledger, chart of accounts, journal entries, and financial close.",
};

const fmt = (v: number | string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(v) || 0);

async function AsyncRecentJournalEntries({ companyId }: { companyId: string }) {
  const entriesData = await withTenantTransaction(companyId, async (tx) =>
    getJournalEntryList(tx, companyId, { page: 1, limit: 6 })
  );

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Recent Transactions</h2>
          <p className="text-xs text-muted-foreground">Latest journal entries</p>
        </div>
        <Link
          href={`/${companyId}/accounting/journal-entries`}
          className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {entriesData.entries.length === 0 ? (
        <div className="py-12 text-center text-xs text-muted-foreground">
          No transactions posted yet.
        </div>
      ) : (
        <div className="space-y-2.5">
          {entriesData.entries.map((entry) => (
            <div
              key={entry.id}
              className="p-3 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between gap-3 text-xs"
            >
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {entry.entryNumber}
                </p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {entry.memo || "General posting"}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono font-bold text-foreground block">
                  {fmt(entry.totalDebit)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(entry.entryDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TransactionsSkeleton() {
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

export default async function AccountingOverviewPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Accounting & General Ledger
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Strict double-entry bookkeeping, chart of accounts master, posted transactions, and period closing.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/${companyId}/accounting/journal-entries/new`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Manual Transaction</span>
          </Link>
          <Link
            href={`/${companyId}/accounting/chart-of-accounts`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
          >
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Manage Accounts</span>
          </Link>
        </div>
      </div>

      {/* Grid: Financial Workspaces (Instant) + Streamed Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Accounting Workspaces */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-foreground">Financial Workspaces</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Chart of Accounts */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 hover:border-indigo-500/40 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <BookOpen className="h-5 w-5" />
                </div>
                <Link
                  href={`/${companyId}/accounting/chart-of-accounts`}
                  className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <h3 className="font-bold text-foreground text-sm">Chart of Accounts</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Assets, liabilities, equity, revenues, and expenses with debit/credit balance enforcement.
              </p>
            </div>

            {/* Journal Entries */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 hover:border-indigo-500/40 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <FileText className="h-5 w-5" />
                </div>
                <Link
                  href={`/${companyId}/accounting/journal-entries`}
                  className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <h3 className="font-bold text-foreground text-sm">Journal Entries</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automated invoice/payment postings and manual adjustments with strict balanced validation.
              </p>
            </div>

            {/* Fiscal Periods */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 hover:border-indigo-500/40 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <Calendar className="h-5 w-5" />
                </div>
                <Link
                  href={`/${companyId}/accounting/periods`}
                  className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <h3 className="font-bold text-foreground text-sm">Fiscal Periods & Closing</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Open, lock, and close monthly/annual periods to prevent unauthorized backdated postings.
              </p>
            </div>

            {/* Financial Reports Hub */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 hover:border-indigo-500/40 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <Scale className="h-5 w-5" />
                </div>
                <Link
                  href={`/${companyId}/reports`}
                  className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  View Reports <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <h3 className="font-bold text-foreground text-sm">Financial Statements Hub</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Generate P&L statements, balance sheets, and tax reports in the dedicated Reports module.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Streamed Recent Transactions Feed */}
        <Suspense fallback={<TransactionsSkeleton />}>
          <AsyncRecentJournalEntries companyId={companyId} />
        </Suspense>
      </div>
    </div>
  );
}
