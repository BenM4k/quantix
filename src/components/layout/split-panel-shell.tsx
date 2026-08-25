"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, ArrowUpRight } from "lucide-react";
import { KpiCard } from "./kpi-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent } from "@/components/ui/sheet";

// ─── KPI Row Types ────────────────────────────────────────────────────────────
export interface KpiDef {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: number | null;
  trendLabel?: string;
  iconClassName?: string;
  variant?: "default" | "bars" | "sparkline" | "pills";
}

// ─── Context for Sheet state ─────────────────────────────────────────────────
interface ShellContextValue {
  openDetail: () => void;
}
const ShellContext = React.createContext<ShellContextValue>({ openDetail: () => {} });

// ─── List Row → Table Row ─────────────────────────────────────────────────────
export interface ListRowProps {
  id: string;
  primary: string;
  secondary?: string;
  meta?: string;
  badge?: React.ReactNode;
  amount?: string;
  selected?: boolean;
  onClick?: () => void;
  avatar?: React.ReactNode;
}

export function ListRow({
  primary,
  secondary,
  meta,
  badge,
  amount,
  selected,
  onClick,
  avatar,
}: ListRowProps) {
  const { openDetail } = React.useContext(ShellContext);

  const handleClick = () => {
    onClick?.();
    openDetail();
  };

  return (
    <TableRow
      onClick={handleClick}
      className={cn(
        "cursor-pointer transition-colors border-[#F1F5F9] dark:border-neutral-800/60 group",
        selected
          ? "bg-[#FFF7F3] dark:bg-neutral-800/90"
          : "hover:bg-[#F8FAFC] dark:hover:bg-neutral-800/50",
      )}
    >
      {/* Primary & Secondary */}
      <TableCell className="py-3 pl-5">
        <div className="flex items-center gap-3">
          {avatar ? (
            <div className="shrink-0">{avatar}</div>
          ) : (
            <div
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border",
                selected
                  ? "bg-[#FFF1EB] border-[#FED7C2] text-[#E3530F]"
                  : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]",
              )}
            >
              {primary.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div
              className={cn(
                "font-medium text-sm truncate transition-colors",
                selected
                  ? "text-[#E3530F]"
                  : "text-[#0F172A] dark:text-neutral-100 group-hover:text-[#E3530F]",
              )}
            >
              {primary}
            </div>
            {(secondary || meta) && (
              <div className="text-[11px] text-[#64748B] truncate mt-0.5 font-mono">
                {secondary || meta}
              </div>
            )}
          </div>
        </div>
      </TableCell>

      {/* Badge */}
      <TableCell className="py-3">
        {badge}
      </TableCell>

      {/* Amount */}
      <TableCell className="py-3 text-right font-mono font-semibold text-[#0F172A] dark:text-neutral-100">
        {amount}
      </TableCell>

      {/* Open Sheet action */}
      <TableCell className="py-3 pr-5 text-right">
        <span className="inline-flex items-center text-xs font-medium text-[#64748B] group-hover:text-[#E3530F] transition-colors">
          <span>View</span>
          <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
        </span>
      </TableCell>
    </TableRow>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {Icon && (
        <div className="h-12 w-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-4 text-[#64748B]">
          <Icon className="h-6 w-6 stroke-1" />
        </div>
      )}
      <p className="text-sm font-semibold text-[#0F172A] dark:text-neutral-100">{title}</p>
      {description && (
        <p className="text-xs text-[#64748B] mt-1.5 max-w-[260px] leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ─── Split Panel Shell ─────────────────────────────────────────────────────────
interface SplitPanelShellProps {
  kpis?: KpiDef[];
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;

  // Filter Toolbar
  filterToolbar?: React.ReactNode;

  // Tab bar (rendered inside the table header bar)
  listTabs?: React.ReactNode;

  // List panel — expected to contain <ListRow> elements or <EmptyState>
  listChildren: React.ReactNode;
  listEmpty?: React.ReactNode;
  listTitle?: string;

  // Detail content — rendered in the slide-over Sheet
  detailChildren: React.ReactNode;

  className?: string;
}

export function SplitPanelShell({
  kpis,
  title,
  subtitle,
  headerAction,
  filterToolbar,
  listTabs,
  listChildren,
  listEmpty,
  listTitle = "Records",
  detailChildren,
  className,
}: SplitPanelShellProps) {
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const contextValue = React.useMemo(
    () => ({ openDetail: () => setSheetOpen(true) }),
    [],
  );

  return (
    <ShellContext.Provider value={contextValue}>
      <div className={cn("flex flex-col gap-6", className)}>
        {/* Optional Top KPI Row */}
        {kpis && kpis.length > 0 && (
          <div
            className={cn(
              "grid gap-4",
              kpis.length === 4
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                : kpis.length === 3
                  ? "grid-cols-1 sm:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2",
            )}
          >
            {kpis.map((kpi) => (
              <KpiCard key={kpi.label} {...kpi} />
            ))}
          </div>
        )}

        {/* Page Header */}
        {(title || headerAction) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              {title && (
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A] dark:text-neutral-100">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>
              )}
            </div>
            {headerAction && (
              <div className="shrink-0 flex items-center gap-2">{headerAction}</div>
            )}
          </div>
        )}

        {/* Filter Toolbar */}
        {filterToolbar && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {filterToolbar}
          </div>
        )}

        {/* Ledgerly Data Table Card */}
        <div className="rounded-xl border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">

          {/* Table top bar: title + optional tab strip */}
          <div className="px-5 py-4 border-b border-[#F1F5F9] dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-neutral-100">
                {listTitle}
              </h3>
            </div>

            {/* Tab bar (listTabs) re-styled to match Ledgerly segment */}
            {listTabs && (
              <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#F1F5F9] dark:bg-neutral-800 border border-[#E2E8F0] dark:border-neutral-700 text-xs [&>button]:px-3 [&>button]:py-1.5 [&>button]:rounded-md [&>button]:font-medium [&>button]:transition-colors [&>button]:cursor-pointer">
                {listTabs}
              </div>
            )}
          </div>

          {/* Real Table */}
          <Table>
            <TableHeader className="bg-[#F8FAFC] dark:bg-neutral-900/90 border-b border-[#E2E8F0] dark:border-neutral-800">
              <TableRow className="hover:bg-transparent border-[#E2E8F0] dark:border-neutral-800">
                <TableHead className="py-3 pl-5 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">
                  DESCRIPTION
                </TableHead>
                <TableHead className="py-3 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">
                  STATUS
                </TableHead>
                <TableHead className="py-3 text-right text-[10px] font-bold text-[#64748B] uppercase tracking-widest">
                  AMOUNT
                </TableHead>
                <TableHead className="py-3 pr-5 text-right text-[10px] font-bold text-[#64748B] uppercase tracking-widest">
                  DETAILS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-[#F1F5F9] dark:divide-neutral-800/80 text-xs">
              {listEmpty ?? listChildren}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Slide-over Sheet for detail */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl p-0 flex flex-col h-full bg-white dark:bg-neutral-900 border-l border-[#E2E8F0] dark:border-neutral-800"
        >
          <div className="flex-1 overflow-y-auto">
            {detailChildren}
          </div>
        </SheetContent>
      </Sheet>
    </ShellContext.Provider>
  );
}

export { KpiCard };
