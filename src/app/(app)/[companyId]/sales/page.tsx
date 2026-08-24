import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  ShoppingBag,
  UserCheck,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sales Overview | Quantix",
  description: "Customer accounts, sales pipeline, orders, and invoicing overview.",
};

export default async function SalesOverviewPage({
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
            Sales & Revenue Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track customer quotes, confirmed orders, invoice generation, payments, and receivables aging.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/${companyId}/sales/invoices`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Invoice</span>
          </Link>
          <Link
            href={`/${companyId}/sales/orders/new`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Order</span>
          </Link>
          <Link
            href={`/${companyId}/sales/quotes/new`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Quote</span>
          </Link>
        </div>
      </div>

      {/* Workspaces Launch Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Invoices */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 hover:border-indigo-500/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <Link
              href={`/${companyId}/sales/invoices`}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              Open <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <h3 className="font-bold text-foreground text-sm">Customer Invoices</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Generate invoices, send PDFs, record payments, and track overdue receivables with line-item breakdowns.
          </p>
        </div>

        {/* Sales Orders */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 hover:border-indigo-500/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <Link
              href={`/${companyId}/sales/orders`}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              Open <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <h3 className="font-bold text-foreground text-sm">Sales Orders</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Manage confirmed client orders, fulfill items, convert from quotes, and transition to invoicing.
          </p>
        </div>

        {/* Quotes */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 hover:border-indigo-500/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <Link
              href={`/${companyId}/sales/quotes`}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              Open <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <h3 className="font-bold text-foreground text-sm">Quotes & Estimates</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Draft customer proposals, calculate discount lines, handle revisions, and convert directly to confirmed orders.
          </p>
        </div>

        {/* Customers */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 hover:border-indigo-500/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <UserCheck className="h-5 w-5" />
            </div>
            <Link
              href={`/${companyId}/sales/customers`}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              Open <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <h3 className="font-bold text-foreground text-sm">Customer Directory</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Manage client directory, contact information, billing addresses, tax IDs, and credit terms.
          </p>
        </div>

        {/* Sales & Receivables Reports */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 hover:border-indigo-500/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Clock className="h-5 w-5" />
            </div>
            <Link
              href={`/${companyId}/reports`}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              View Reports <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <h3 className="font-bold text-foreground text-sm">Receivables & AR Reports</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Accounts receivable aging buckets and customer collection reports in the Reports module.
          </p>
        </div>
      </div>
    </div>
  );
}
