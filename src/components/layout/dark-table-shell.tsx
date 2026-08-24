"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DarkTableShellProps {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  filterToolbar?: React.ReactNode;
  tabs?: React.ReactNode;
  search?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DarkTableShell({
  title,
  subtitle,
  headerAction,
  filterToolbar,
  tabs,
  search,
  children,
  className,
}: DarkTableShellProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
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
            <div className="shrink-0 flex items-center gap-2">{headerAction}</div>
          )}
        </div>
      )}

      {/* Filter Toolbar (Pill Filters) */}
      {filterToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {filterToolbar}
        </div>
      )}

      {/* Dark Table Container */}
      <div className="rounded-[32px] bg-[#0E1017] dark:bg-[#0A0B10] border border-zinc-800/80 p-5 lg:p-6 shadow-2xl text-white overflow-hidden">
        {/* Top bar inside container: Tabs + Search */}
        {(tabs || search) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
            <div className="flex items-center gap-2">{tabs}</div>
            <div className="flex items-center gap-2">{search}</div>
          </div>
        )}

        {/* Table Content */}
        <div className="pt-4 overflow-x-auto">{children}</div>
      </div>
    </div>
  );
}
