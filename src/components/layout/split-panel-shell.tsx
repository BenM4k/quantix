"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, LayoutGrid, MoreVertical } from "lucide-react";
import { KpiCard } from "./kpi-card";

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

// ─── List Row (Record Preview inside Left Panel) ───────────────────────────────
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
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-[22px] text-left transition-all duration-200 group text-xs",
        selected
          ? "bg-primary text-primary-foreground shadow-xl shadow-primary/30 font-medium"
          : "text-foreground/80 hover:bg-primary/20 hover:text-foreground",
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {avatar ? (
          <div className="shrink-0">{avatar}</div>
        ) : (
          <div
            className={cn(
              "h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
              selected
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-primary/20 text-foreground group-hover:bg-primary/30",
            )}
          >
            {primary.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p
            className={cn(
              "font-bold truncate text-sm tracking-tight",
              selected ? "text-primary-foreground" : "text-foreground",
            )}
          >
            {primary}
          </p>
          {(secondary || meta) && (
            <p
              className={cn(
                "text-[11px] truncate mt-0.5",
                selected
                  ? "text-primary-foreground/80"
                  : "text-muted-foreground",
              )}
            >
              {secondary || meta}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {badge}
        {amount && (
          <span
            className={cn(
              "font-mono font-bold text-sm tracking-tight",
              selected
                ? "text-primary-foreground"
                : "text-foreground font-semibold",
            )}
          >
            {amount}
          </span>
        )}
      </div>
    </button>
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
    <div className="flex flex-col items-center justify-center py-24 text-center text-foreground/80">
      {Icon && (
        <div className="h-14 w-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-4 text-foreground">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <p className="text-base font-bold text-foreground">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1.5 max-w-[260px] leading-relaxed">
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

  // Filter Toolbar (Search & Filter Pills)
  filterToolbar?: React.ReactNode;

  // Center Cutout Notch Tabs
  listTabs?: React.ReactNode;

  // List panel (left ~35%)
  listChildren: React.ReactNode;
  listEmpty?: React.ReactNode;
  listTitle?: string;

  // Inset Purple Detail Card (right ~65%)
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
  return (
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

      {/* Page Header (if provided) */}
      {(title || headerAction) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && (
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerAction && (
            <div className="shrink-0 flex items-center gap-2">
              {headerAction}
            </div>
          )}
        </div>
      )}

      {/* Filter Pill Toolbar */}
      {filterToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {filterToolbar}
        </div>
      )}

      {/* Large Horizontal Master-Detail Workspace Container (30% Primary with 100% Active) */}
      <div className="rounded-[32px] bg-primary/30 text-foreground border border-primary/25 p-5 lg:p-6 shadow-2xl backdrop-blur-md relative">
        {/* Top Notch Cutout matching the screenshot - C1 continuous horizontal tangent geometry */}
        {listTabs && (
          <div className="absolute left-1/2 -translate-x-1/2 -top-[1px] z-20 flex items-start justify-center pointer-events-auto">
            {/* Left fillet wing: curves smoothly from y=0 to horizontal y=40 */}
            <svg
              className="w-8 h-10 text-background fill-current shrink-0"
              viewBox="0 0 32 40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M32 0H0C16 0 16 40 32 40V0Z" />
            </svg>

            {/* Center Tab Notch Body: 40px height with flat bottom connecting horizontally */}
            <div className="bg-background h-10 px-4 -mx-1 z-10 flex items-center gap-1.5 shrink-0">
              {listTabs}
            </div>

            {/* Right fillet wing: curves smoothly from horizontal y=40 up to y=0 */}
            <svg
              className="w-8 h-10 text-background fill-current shrink-0"
              viewBox="0 0 32 40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 0H32C16 0 16 40 0 40V0Z" />
            </svg>
          </div>
        )}

        {/* Top Header Row */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
          {/* Left Title */}
          <div className="text-base font-extrabold text-foreground tracking-wide pl-1">
            {listTitle}
          </div>

          {/* Right Action Icons */}
          <div className="hidden md:flex items-center gap-2 ml-auto">
            <button className="h-8 w-8 rounded-xl bg-primary/20 border border-primary/30 text-foreground/80 hover:text-foreground hover:bg-primary/30 transition-colors flex items-center justify-center">
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button className="h-8 w-8 rounded-xl bg-primary/20 border border-primary/30 text-foreground/80 hover:text-foreground hover:bg-primary/30 transition-colors flex items-center justify-center">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Master-Detail Split Grid: Left 35%, Right 65% */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2 min-h-[520px]">
          {/* Left Column: Master List Panel (~35%) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-1.5">
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-[600px] scrollbar-thin scrollbar-thumb-primary/20">
              {listEmpty ?? listChildren}
            </div>
          </div>

          {/* Right Column: Inset 50% Primary Detail Card (~65%) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            <div className="h-full rounded-[28px] bg-primary/50 border border-primary/30 p-6 lg:p-7 flex flex-col justify-between shadow-2xl text-foreground">
              {detailChildren}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { KpiCard };
