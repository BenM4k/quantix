import React from "react";
import { Building2, User } from "lucide-react";
import {
  AccountingLeadCard,
  InvoicingCard,
  InventoryCard,
} from "./feature-grid-cards";
import { AnimateOnEnter } from "./animate-on-enter";

export function LandingFeatureGrid() {
  return (
    <section
      id="product"
      className="py-20 md:py-32 bg-[#FAF5F0]/60 dark:bg-stone-900/20 border-t border-stone-200/60 dark:border-stone-800/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnEnter>
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold tracking-[0.2em] text-stone-400 uppercase">
              Everything you need, nothing you don&apos;t
            </span>
          </div>
        </AnimateOnEnter>

        {/* Bento grid — 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
          {/* Lead: Accounting — 2×2 */}
          <AnimateOnEnter className="md:col-span-2 md:row-span-2 flex flex-col" delay={0.05}>
            <AccountingLeadCard />
          </AnimateOnEnter>

          {/* Secondary: Invoicing */}
          <AnimateOnEnter className="flex flex-col" delay={0.1}>
            <InvoicingCard />
          </AnimateOnEnter>

          {/* Secondary: Inventory */}
          <AnimateOnEnter className="flex flex-col" delay={0.15}>
            <InventoryCard />
          </AnimateOnEnter>

          {/* Multi-company row */}
          <AnimateOnEnter className="md:col-span-3" delay={0.1}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10 p-7 rounded-2xl bg-white/80 dark:bg-stone-900/50 border border-stone-200/70 dark:border-stone-800">
              <div className="sm:w-64 shrink-0">
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                  Multi-company, one login
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                  Separate books and reports per entity. Switch with one click —
                  no re-authentication.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 pl-3.5 pr-4 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm text-xs font-medium text-stone-900 dark:text-stone-100">
                  <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  Acme Co.
                  <span className="ml-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <div className="flex items-center gap-2 pl-3.5 pr-4 py-2.5 rounded-xl border border-stone-200/70 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300">
                  <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  Acme Retail Ltd.
                </div>
                <div className="flex items-center gap-2 pl-3.5 pr-4 py-2.5 rounded-xl border border-stone-200/70 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300">
                  <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  Acme Services Inc.
                </div>
                <div className="flex items-center gap-2 pl-3.5 pr-4 py-2.5 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 text-xs text-stone-400 dark:text-stone-500">
                  + Add company
                </div>
              </div>
            </div>
          </AnimateOnEnter>
        </div>
      </div>
    </section>
  );
}
