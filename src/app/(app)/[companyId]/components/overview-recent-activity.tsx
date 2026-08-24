import React from "react";
import Link from "next/link";
import { FileText, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecentInvoice } from "@/dal/dashboard/queries";

const fmt = (v: string | number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(v) || 0);

const fmtDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  paid: {
    label: "Paid",
    cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  sent: {
    label: "Sent",
    cls: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  },
  unpaid: {
    label: "Unpaid",
    cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  partial: {
    label: "Partial",
    cls: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  },
  draft: {
    label: "Draft",
    cls: "bg-muted text-muted-foreground border-border",
  },
  void: {
    label: "Void",
    cls: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  },
};

interface OverviewRecentActivityProps {
  companyId: string;
  invoices: RecentInvoice[];
}

export function OverviewRecentActivity({
  companyId,
  invoices,
}: OverviewRecentActivityProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Recent Invoices</h2>
          <p className="text-xs text-muted-foreground">Latest transaction activity</p>
        </div>
        <Link
          href={`/${companyId}/sales/invoices`}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground text-xs flex flex-col items-center">
          <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
          No invoices recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground text-[11px] font-semibold text-left">
                <th className="pb-2.5">Invoice</th>
                <th className="pb-2.5">Customer</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5">Due Date</th>
                <th className="pb-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {invoices.map((inv) => {
                const s = STATUS_MAP[inv.status] ?? STATUS_MAP.draft;
                return (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-semibold text-foreground">
                      <Link
                        href={`/${companyId}/sales/invoices?selected=${inv.id}`}
                        className="hover:underline text-indigo-600 dark:text-indigo-400"
                      >
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="py-3 text-muted-foreground font-medium">
                      {inv.customerName}
                    </td>
                    <td className="py-3">
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full border inline-block",
                          s.cls
                        )}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground font-mono">
                      {fmtDate(inv.dueDate)}
                    </td>
                    <td className="py-3 text-right font-bold font-mono text-foreground">
                      {fmt(inv.total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
