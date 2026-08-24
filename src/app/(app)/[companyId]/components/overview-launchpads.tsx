import React from "react";
import Link from "next/link";
import {
  Layers,
  UserCheck,
  BookOpen,
  BarChart3,
  Sliders,
  ChevronRight,
  Package,
  FileText,
  TrendingUp,
  Building2,
  Calendar,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OverviewLaunchpadsProps {
  companyId: string;
}

export function OverviewLaunchpads({ companyId }: OverviewLaunchpadsProps) {
  const base = `/${companyId}`;

  const modules = [
    {
      title: "Operations",
      description: "Manage catalog products, stock ledger, and inventory valuation.",
      href: `${base}/operations`,
      icon: Layers,
      color: "from-blue-600/10 to-indigo-600/5 text-blue-600 dark:text-blue-400 border-blue-500/20",
      links: [
        { label: "Product Master", href: `${base}/inventory/products`, icon: Package },
        { label: "Stock Activity", href: `${base}/inventory/stock-ledger`, icon: Layers },
      ],
    },
    {
      title: "Sales & Invoicing",
      description: "Customer directories, quotes, sales orders, and invoices.",
      href: `${base}/sales`,
      icon: UserCheck,
      color: "from-indigo-600/10 to-purple-600/5 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      links: [
        { label: "Invoices", href: `${base}/sales/invoices`, icon: FileText },
        { label: "Sales Orders", href: `${base}/sales/orders`, icon: Layers },
        { label: "Customers", href: `${base}/sales/customers`, icon: UserCheck },
      ],
    },
    {
      title: "Accounting & General Ledger",
      description: "Chart of accounts, double-entry journal entries, and fiscal close.",
      href: `${base}/accounting`,
      icon: BookOpen,
      color: "from-amber-600/10 to-orange-600/5 text-amber-600 dark:text-amber-400 border-amber-500/20",
      links: [
        { label: "Chart of Accounts", href: `${base}/accounting/chart-of-accounts`, icon: BookOpen },
        { label: "Transactions", href: `${base}/accounting/journal-entries`, icon: FileText },
        { label: "Fiscal Periods", href: `${base}/accounting/periods`, icon: Calendar },
      ],
    },
    {
      title: "Reports & Financials",
      description: "Profit & Loss statements, Balance Sheets, and AR Aging analytics.",
      href: `${base}/reports`,
      icon: BarChart3,
      color: "from-emerald-600/10 to-teal-600/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      links: [
        { label: "Profit & Loss", href: `${base}/accounting/reports/p-and-l`, icon: TrendingUp },
        { label: "Balance Sheet", href: `${base}/accounting/reports/balance-sheet`, icon: TrendingUp },
        { label: "Stock Valuation", href: `${base}/inventory/reports/stock-valuation`, icon: Package },
      ],
    },
    {
      title: "Settings & Administration",
      description: "Company organization details, warehouses, and user permissions.",
      href: `${base}/settings`,
      icon: Sliders,
      color: "from-slate-600/10 to-zinc-600/5 text-slate-600 dark:text-slate-400 border-slate-500/20",
      links: [
        { label: "Company Profile", href: `${base}/settings/company`, icon: Building2 },
        { label: "Warehouse Setup", href: `${base}/settings/warehouse`, icon: Warehouse },
      ],
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">ERP Core Modules</h2>
        <span className="text-xs text-muted-foreground">Quick Launchpad</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.title}
              className="group rounded-2xl border border-border/80 bg-card p-5 flex flex-col justify-between hover:border-indigo-500/40 hover:shadow-md transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center border",
                      m.color
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <Link
                    href={m.href}
                    className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-indigo-600 transition-colors"
                  >
                    <span>Overview</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <h3 className="font-bold text-sm text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {m.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {m.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap gap-1.5">
                {m.links.map((link) => {
                  const SubIcon = link.icon;
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/60 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 transition-all border border-border/40 text-foreground"
                    >
                      <SubIcon className="h-3 w-3 text-muted-foreground" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
