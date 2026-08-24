import React from "react";
import Link from "next/link";
import { Plus, Package, UserCheck, FileText, ShoppingBag, BookOpen } from "lucide-react";

interface OverviewQuickActionsProps {
  companyId: string;
}

export function OverviewQuickActions({ companyId }: OverviewQuickActionsProps) {
  const base = `/${companyId}`;

  const actions = [
    {
      label: "New Invoice",
      href: `${base}/sales/invoices`,
      icon: FileText,
      color: "hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:hover:bg-indigo-950/40",
    },
    {
      label: "New Sales Order",
      href: `${base}/sales/orders/new`,
      icon: ShoppingBag,
      color: "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-950/40",
    },
    {
      label: "New Product",
      href: `${base}/inventory/products`,
      icon: Package,
      color: "hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 dark:hover:bg-emerald-950/40",
    },
    {
      label: "Add Customer",
      href: `${base}/sales/customers`,
      icon: UserCheck,
      color: "hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 dark:hover:bg-purple-950/40",
    },
    {
      label: "Journal Entry",
      href: `${base}/accounting/journal-entries/new`,
      icon: BookOpen,
      color: "hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 dark:hover:bg-amber-950/40",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <Link
            key={act.label}
            href={act.href}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-card text-xs font-semibold text-foreground shadow-xs transition-all ${act.color}`}
          >
            <Plus className="h-3 w-3" />
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{act.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
