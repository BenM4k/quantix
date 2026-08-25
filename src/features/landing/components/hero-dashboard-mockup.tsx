import React from "react";
import {
  TrendingUp,
  FileText,
  CreditCard,
  Package,
  BarChart3,
  Settings,
  ShoppingBag,
  CheckCircle2,
  Lock,
  RotateCw,
  ChevronDown,
  User,
} from "lucide-react";
import { CountUpNumber } from "./count-up-number";
import { HeroCashFlowChart } from "./hero-cash-flow-chart";

export function HeroDashboardMockup() {
  return (
    <div className="w-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl shadow-stone-300/40 dark:shadow-black/50 p-3 sm:p-5 text-xs text-stone-700 dark:text-stone-300 select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
            Overview
          </span>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-[11px] font-medium text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-800 px-2.5 py-1 rounded-md border border-stone-200/80 dark:border-stone-700"
        >
          <span>August 2025</span>
          <ChevronDown className="w-3 h-3 text-stone-400" />
        </button>
      </div>

      {/* Body: Sidebar + Main */}
      <div className="flex gap-4 pt-3.5">
        {/* Mini Sidebar */}
        <div className="hidden sm:flex flex-col justify-between w-28 shrink-0 pr-3 border-r border-stone-100 dark:border-stone-800 text-[11px]">
          <div className="space-y-1">
            <NavItem
              icon={<BarChart3 className="w-3.5 h-3.5 text-primary" />}
              label="Overview"
              active
            />
            <NavItem
              icon={<ShoppingBag className="w-3.5 h-3.5" />}
              label="Sales"
            />
            <NavItem
              icon={<FileText className="w-3.5 h-3.5" />}
              label="Invoices"
            />
            <NavItem
              icon={<CreditCard className="w-3.5 h-3.5" />}
              label="Payments"
            />
            <NavItem
              icon={<Package className="w-3.5 h-3.5" />}
              label="Inventory"
            />
            <NavItem
              icon={<BarChart3 className="w-3.5 h-3.5" />}
              label="Reports"
            />
            <NavItem
              icon={<Settings className="w-3.5 h-3.5" />}
              label="Settings"
            />
          </div>
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-700 dark:text-stone-300">
            <div className="flex items-center gap-1.5 truncate">
              <User className="w-3 h-3 text-stone-400" />
              <span className="truncate">Acme Co.</span>
            </div>
            <ChevronDown className="w-3 h-3 text-stone-400" />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Hero Stat Row: 1 dominant + 3 supporting */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Dominant stat — Net profit */}
            <div className="col-span-1 p-3.5 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/8 flex flex-col justify-between">
              <div className="text-[10px] font-medium text-stone-500 dark:text-stone-400">
                Net profit
              </div>
              <div className="mt-2">
                <div className="font-serif text-2xl sm:text-3xl font-normal text-stone-900 dark:text-stone-100 leading-none tracking-tight">
                  <CountUpNumber prefix="$" value={6530} />
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <TrendingUp className="w-3 h-3" />
                  <span>+11.4% vs last month</span>
                </div>
              </div>
            </div>

            {/* Supporting stats — 2 stacked on right */}
            <div className="col-span-2 grid grid-rows-2 gap-2">
              <SupportingStat
                label="Revenue"
                value={<CountUpNumber prefix="$" value={24280} />}
                growth="+12.5%"
              />
              <div className="grid grid-cols-2 gap-2">
                <SupportingStat
                  label="Gross profit"
                  value={<CountUpNumber prefix="$" value={9650} />}
                  growth="+8.2%"
                />
                <SupportingStat
                  label="Receivables"
                  value={<CountUpNumber prefix="$" value={18620} />}
                  growth="+4.3%"
                />
              </div>
            </div>
          </div>

          {/* Chart + Period Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Cash Flow Chart Line Animation */}
            <HeroCashFlowChart />

            {/* Period Status */}
            <div className="p-3 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 flex flex-col justify-between text-[11px]">
              <div>
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  Period status
                </span>
                <p className="text-[10px] text-stone-400">August 2025</p>
                <div className="space-y-2 mt-2.5 text-[10px]">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Transactions complete</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Reconciliation</span>
                    </div>
                    <span className="font-semibold text-[9px] bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                      96%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Review &amp; adjustments</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Statements ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] ${
        active
          ? "bg-stone-100 dark:bg-stone-800 font-semibold text-stone-900 dark:text-stone-100"
          : "text-stone-500 dark:text-stone-400"
      }`}
    >
      {icon}
      {label}
    </div>
  );
}

function SupportingStat({
  label,
  value,
  growth,
}: {
  label: string;
  value: React.ReactNode;
  growth: string;
}) {
  return (
    <div className="p-2.5 rounded-lg border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 flex flex-col justify-between">
      <div className="text-[10px] text-stone-400">{label}</div>
      <div className="font-semibold text-stone-900 dark:text-stone-100 text-xs mt-0.5">
        {value}
      </div>
      <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5 mt-0.5">
        <TrendingUp className="w-2.5 h-2.5" />
        <span>{growth}</span>
      </div>
    </div>
  );
}
