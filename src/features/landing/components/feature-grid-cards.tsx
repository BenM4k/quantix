import React from "react";
import { ArrowRight } from "lucide-react";

/** Lead card — Accounting. col-span-2 row-span-2 in the bento grid. */
export function AccountingLeadCard() {
  return (
    <div className="md:col-span-2 md:row-span-2 flex flex-col p-7 rounded-2xl bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 shadow-xl shadow-stone-300/40 dark:shadow-none">
      {/* Eyebrow */}
      <span className="text-[10px] font-bold tracking-widest text-primary uppercase mb-2">
        Core differentiator
      </span>

      {/* Header */}
      <h3 className="font-semibold text-base text-stone-900 dark:text-stone-100">
        Accounting you can trust
      </h3>
      <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed mb-6">
        Every sale writes the journal entry. Every payment closes the ledger.
        Your P&amp;L and balance sheet are never more than one click away —
        with zero accounting knowledge required.
      </p>

      {/* Spacious P&L mockup — flex-1 so it fills remaining height */}
      <div className="flex-1 flex flex-col p-5 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/50">
        <div className="flex justify-between items-center mb-5">
          <span className="font-semibold text-sm text-stone-800 dark:text-stone-200">
            Profit &amp; loss
          </span>
          <span className="text-xs text-stone-400">August 2025</span>
        </div>

        <div className="space-y-3 text-xs flex-1">
          <div className="flex justify-between text-stone-600 dark:text-stone-300">
            <span>Revenue</span>
            <span className="font-medium">$24,280.00</span>
          </div>
          <div className="flex justify-between text-stone-400">
            <span>Cost of goods sold</span>
            <span>($14,630.00)</span>
          </div>
          <div className="flex justify-between font-semibold text-stone-900 dark:text-stone-100 border-t border-stone-200/60 dark:border-stone-700 pt-3">
            <span>Gross profit</span>
            <span>$9,650.00</span>
          </div>
          <div className="flex justify-between text-stone-400">
            <span>Operating expenses</span>
            <span>($3,120.00)</span>
          </div>
          <div className="flex justify-between font-bold text-sm border-t border-stone-200/60 dark:border-stone-700 pt-3">
            <span className="text-stone-900 dark:text-stone-100">Net profit</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              $6,530.00
            </span>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-stone-200/60 dark:border-stone-700 flex items-center justify-between">
          <span className="text-[11px] text-stone-400">
            Updated on every sale, automatically
          </span>
          <span className="text-[11px] font-medium text-primary inline-flex items-center gap-1 cursor-pointer hover:underline">
            View report <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}

/** Secondary card — same border/shadow-sm style, compact. */
export function InvoicingCard() {
  return (
    <div className="flex flex-col p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
      <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-1">
        Invoicing that looks professional
      </h3>
      <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
        Create, send, and get paid. One click from quote to invoice.
      </p>

      <div className="flex-1 p-3.5 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/50 text-[10px] space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/60 dark:border-stone-700">
          <span className="font-bold text-stone-800 dark:text-stone-200">
            INV-1040
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 font-semibold px-1.5 py-0.5 rounded text-[9px]">
            ● Paid
          </span>
        </div>
        <div className="flex justify-between text-[9px]">
          <div>
            <div className="font-medium text-stone-700 dark:text-stone-300">
              Acme Co.
            </div>
            <div className="text-stone-400">to: Bright Ideas Ltd.</div>
          </div>
          <div className="font-medium text-stone-800 dark:text-stone-200">
            $2,410.28
          </div>
        </div>
        <div className="border-t border-stone-200/60 dark:border-stone-700 pt-1.5 space-y-1 text-[9px] text-stone-600 dark:text-stone-300">
          <div className="flex justify-between">
            <span>Website Design</span>
            <span>$2,000.00</span>
          </div>
          <div className="flex justify-between">
            <span>Brand Guidelines</span>
            <span>$410.28</span>
          </div>
          <div className="flex justify-between font-bold text-stone-900 dark:text-stone-100 border-t border-stone-200/60 dark:border-stone-700 pt-1">
            <span>Total</span>
            <span>$2,410.28</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Secondary card — Inventory. */
export function InventoryCard() {
  return (
    <div className="flex flex-col p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
      <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-1">
        Inventory that stays in sync
      </h3>
      <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
        Real-time stock levels and valuations across all products.
      </p>

      <div className="flex-1 p-3.5 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/50 text-[10px]">
        <div className="font-semibold text-stone-800 dark:text-stone-200 mb-2">
          Products
        </div>
        <table className="w-full text-left text-[9px]">
          <thead>
            <tr className="text-stone-400 border-b border-stone-200/60 dark:border-stone-700">
              <th className="pb-1">Product</th>
              <th className="pb-1 text-center">Qty</th>
              <th className="pb-1 text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-600 dark:text-stone-300">
            <tr>
              <td className="py-1">Wireless Headphones</td>
              <td className="py-1 text-center">32</td>
              <td className="py-1 text-right">$3,200</td>
            </tr>
            <tr>
              <td className="py-1">Keyboard</td>
              <td className="py-1 text-center">58</td>
              <td className="py-1 text-right">$4,640</td>
            </tr>
            <tr>
              <td className="py-1">Mouse</td>
              <td className="py-1 text-center">101</td>
              <td className="py-1 text-right">$808</td>
            </tr>
            <tr>
              <td className="py-1">Monitor 24&quot;</td>
              <td className="py-1 text-center">15</td>
              <td className="py-1 text-right">$3,300</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
