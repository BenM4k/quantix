import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp,
  Scale,
  Clock,
  Package,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Reports Hub | Quantix",
  description: "Enterprise reporting, financial statements, and business analytics.",
};

export default async function ReportsOverviewPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;

  const reportGroups = [
    {
      category: "Financial Statements",
      description: "Statutory double-entry accounting reports and financial health analysis.",
      reports: [
        {
          title: "Profit & Loss (Income Statement)",
          description: "Period-over-period revenue, cost of goods sold (COGS), gross margin, and net operating income.",
          href: `/${companyId}/reports/p-and-l`,
          icon: TrendingUp,
          badge: "Financial",
          color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        },
        {
          title: "Balance Sheet Statement",
          description: "Point-in-time snapshot of company Assets, Liabilities, and Equity balances.",
          href: `/${companyId}/reports/balance-sheet`,
          icon: Scale,
          badge: "Financial",
          color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
        },
      ],
    },
    {
      category: "Sales & Cash Collection Analytics",
      description: "Accounts receivable risk management, aging brackets, and customer collection trends.",
      reports: [
        {
          title: "Accounts Receivable Aging Report",
          description: "Aging buckets (Current, 1-30, 31-60, 61-90, 90+ days) for tracking overdue receivables.",
          href: `/${companyId}/reports/ar-aging`,
          icon: Clock,
          badge: "Receivables",
          color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        },
      ],
    },
    {
      category: "Inventory & Valuation",
      description: "Stock asset valuation, unit economics, and inventory carrying cost analysis.",
      reports: [
        {
          title: "Stock Valuation & Cost Basis",
          description: "Live warehouse inventory valuation based on quantity on hand and weighted average unit cost.",
          href: `/${companyId}/reports/stock-valuation`,
          icon: Package,
          badge: "Inventory",
          color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Reports & Analytics Hub
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Comprehensive business intelligence, statutory financial statements, and operational audits.
          </p>
        </div>
      </div>

      {/* Reports Groups */}
      <div className="space-y-6">
        {reportGroups.map((group) => (
          <div key={group.category} className="space-y-3">
            <div>
              <h2 className="text-base font-bold text-foreground">{group.category}</h2>
              <p className="text-xs text-muted-foreground">{group.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.reports.map((rpt) => {
                const Icon = rpt.icon;
                return (
                  <div
                    key={rpt.title}
                    className="group rounded-2xl border border-border/80 bg-card p-5 flex flex-col justify-between hover:border-indigo-500/40 hover:shadow-md transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div
                          className={`h-10 w-10 rounded-xl flex items-center justify-center border ${rpt.color}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
                          {rpt.badge}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {rpt.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {rpt.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">Standard Report</span>
                      <Link
                        href={rpt.href}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        <span>Generate</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
