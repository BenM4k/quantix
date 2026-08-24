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
  ArrowRight,
  User,
} from "lucide-react";

export function HeroDashboardMockup() {
  return (
    <div className="w-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl shadow-stone-300/40 dark:shadow-black/50 p-3 sm:p-5 text-xs text-stone-700 dark:text-stone-300 select-none">
      {/* Top Bar inside mockup */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#FA5A1E]/10 text-[#FA5A1E] flex items-center justify-center font-bold text-xs">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
            Overview
          </span>
        </div>
        <button className="flex items-center gap-1 text-[11px] font-medium text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-800 px-2.5 py-1 rounded-md border border-stone-200/80 dark:border-stone-700">
          <span>August 2025</span>
          <ChevronDown className="w-3 h-3 text-stone-400" />
        </button>
      </div>

      {/* Mockup Body: Sidebar + Main Content */}
      <div className="flex gap-4 pt-3.5">
        {/* Mini Sidebar */}
        <div className="hidden sm:flex flex-col justify-between w-28 shrink-0 pr-3 border-r border-stone-100 dark:border-stone-800 text-[11px]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-stone-100 dark:bg-stone-800 font-semibold text-stone-900 dark:text-stone-100">
              <BarChart3 className="w-3.5 h-3.5 text-[#FA5A1E]" />
              Overview
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-stone-500 hover:text-stone-800 dark:text-stone-400">
              <ShoppingBag className="w-3.5 h-3.5" />
              Sales
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-stone-500 hover:text-stone-800 dark:text-stone-400">
              <FileText className="w-3.5 h-3.5" />
              Invoices
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-stone-500 hover:text-stone-800 dark:text-stone-400">
              <CreditCard className="w-3.5 h-3.5" />
              Payments
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-stone-500 hover:text-stone-800 dark:text-stone-400">
              <Package className="w-3.5 h-3.5" />
              Inventory
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-stone-500 hover:text-stone-800 dark:text-stone-400">
              <BarChart3 className="w-3.5 h-3.5" />
              Reports
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-stone-500 hover:text-stone-800 dark:text-stone-400">
              <Settings className="w-3.5 h-3.5" />
              Settings
            </div>
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
          {/* Stat Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
            <StatCard label="Revenue" value="$24,280.00" growth="+12.5%" />
            <StatCard label="Gross profit" value="$9,650.00" growth="+8.2%" />
            <StatCard label="Receivables" value="$18,620.00" growth="+4.3%" />
            <StatCard label="Cash" value="$7,350.00" growth="+4.1%" />
          </div>

          {/* Chart & Period status Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Cash Flow Chart */}
            <div className="md:col-span-2 p-3 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40">
              <span className="font-semibold text-stone-800 dark:text-stone-200 text-xs">
                Cash flow
              </span>
              <div className="mt-2 h-28 relative flex items-end">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FA5A1E" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#FA5A1E" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,80 Q40,75 75,55 T150,45 T225,25 T300,15 L300,100 L0,100 Z"
                    fill="url(#cashGrad)"
                  />
                  <path
                    d="M0,80 Q40,75 75,55 T150,45 T225,25 T300,15"
                    fill="none"
                    stroke="#FA5A1E"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="flex justify-between text-[9px] text-stone-400 mt-1">
                <span>Aug 1</span>
                <span>Aug 8</span>
                <span>Aug 15</span>
                <span>Aug 22</span>
                <span>Aug 29</span>
              </div>
            </div>

            {/* Period Status */}
            <div className="p-3 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 flex flex-col justify-between text-[11px]">
              <div>
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  Period status
                </span>
                <p className="text-[10px] text-stone-400">August 2025</p>
                <div className="space-y-2 mt-2 text-[10px]">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Transactions complete</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Reconciliation</span>
                    </div>
                    <span className="font-semibold text-[9px] bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">96%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
                    <RotateCw className="w-3.5 h-3.5 text-stone-400" />
                    <span>Review & adjustments</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Statements ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="pt-1">
            <div className="flex items-center justify-between pb-1.5 text-[11px]">
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                Recent activity
              </span>
              <span className="text-[10px] font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 flex items-center gap-1 cursor-pointer">
                View all transactions <ArrowRight className="w-3 h-3" />
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] text-left">
                <thead>
                  <tr className="text-stone-400 uppercase border-b border-stone-100 dark:border-stone-800 text-[9px]">
                    <th className="pb-1 font-medium">Date</th>
                    <th className="pb-1 font-medium">Description</th>
                    <th className="pb-1 font-medium">Type</th>
                    <th className="pb-1 font-medium text-right">Amount</th>
                    <th className="pb-1 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100/60 dark:divide-stone-800/60 text-stone-600 dark:text-stone-300">
                  <tr>
                    <td className="py-1.5">Aug 29, 2025</td>
                    <td className="py-1.5 font-medium text-stone-800 dark:text-stone-200">Invoice INV-1045 paid</td>
                    <td className="py-1.5">Payment</td>
                    <td className="py-1.5 text-right font-medium">$1,250.00</td>
                    <td className="py-1.5 text-right"><span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">● Posted</span></td>
                  </tr>
                  <tr>
                    <td className="py-1.5">Aug 29, 2025</td>
                    <td className="py-1.5 font-medium text-stone-800 dark:text-stone-200">Invoice INV-1044</td>
                    <td className="py-1.5">Sale</td>
                    <td className="py-1.5 text-right font-medium">$2,480.00</td>
                    <td className="py-1.5 text-right"><span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">● Posted</span></td>
                  </tr>
                  <tr>
                    <td className="py-1.5">Aug 28, 2025</td>
                    <td className="py-1.5 font-medium text-stone-800 dark:text-stone-200">Payment received</td>
                    <td className="py-1.5">Payment</td>
                    <td className="py-1.5 text-right font-medium">$840.00</td>
                    <td className="py-1.5 text-right"><span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">● Posted</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  growth,
}: {
  label: string;
  value: string;
  growth: string;
}) {
  return (
    <div className="p-2.5 rounded-lg border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
      <div className="text-[10px] text-stone-400">{label}</div>
      <div className="font-bold text-stone-900 dark:text-stone-100 text-xs mt-0.5">{value}</div>
      <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5 mt-0.5">
        <TrendingUp className="w-2.5 h-2.5" />
        <span>{growth} vs last month</span>
      </div>
    </div>
  );
}
