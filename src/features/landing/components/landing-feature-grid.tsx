import React from "react";
import { ArrowRight, Building2, User } from "lucide-react";

export function LandingFeatureGrid() {
  return (
    <section id="product" className="py-16 md:py-24 border-t border-stone-200/60 dark:border-stone-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-[11px] font-bold tracking-[0.2em] text-stone-500 dark:text-stone-400 uppercase">
            Everything you need, nothing you don&apos;t
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Invoicing */}
          <div className="flex flex-col justify-between p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
            <div className="mb-4">
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                Invoicing that looks professional
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Create beautiful invoices, send them instantly, and get paid faster.
              </p>
            </div>
            {/* Invoice Mini UI */}
            <div className="p-3.5 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/50 text-[10px] space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200/60 dark:border-stone-700">
                <span className="font-bold text-stone-800 dark:text-stone-200">Invoice INV-1040</span>
                <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 font-semibold px-1.5 py-0.5 rounded text-[9px]">● Paid</span>
              </div>
              <div className="flex justify-between text-stone-500 dark:text-stone-400 text-[9px]">
                <div>
                  <div className="font-medium text-stone-700 dark:text-stone-300">Acme Co.</div>
                  <div>acme@example.com</div>
                </div>
                <div className="text-right">
                  <div>Bill to: Bright Ideas Ltd.</div>
                  <div className="font-medium text-stone-800 dark:text-stone-200">$2,410.28</div>
                </div>
              </div>
              <div className="border-t border-stone-200/60 dark:border-stone-700 pt-1.5 space-y-1 text-[9px]">
                <div className="flex justify-between text-stone-600 dark:text-stone-300">
                  <span>Website Design</span>
                  <span>$2,000.00</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-300">
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

          {/* Card 2: Inventory */}
          <div className="flex flex-col justify-between p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
            <div className="mb-4">
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                Inventory that stays in sync
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Track stock, value, and movement across all your products.
              </p>
            </div>
            {/* Products Mini UI */}
            <div className="p-3.5 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/50 text-[10px] flex flex-col justify-between">
              <div>
                <div className="font-semibold text-stone-800 dark:text-stone-200 mb-2">Products</div>
                <table className="w-full text-left text-[9px]">
                  <thead>
                    <tr className="text-stone-400 border-b border-stone-200/60 dark:border-stone-700 pb-1">
                      <th className="pb-1">Product</th>
                      <th className="pb-1 text-center">Stock</th>
                      <th className="pb-1 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-600 dark:text-stone-300">
                    <tr><td className="py-1">Wireless Headphones</td><td className="py-1 text-center">32</td><td className="py-1 text-right">$3,200.00</td></tr>
                    <tr><td className="py-1">Keyboard</td><td className="py-1 text-center">58</td><td className="py-1 text-right">$4,640.00</td></tr>
                    <tr><td className="py-1">Mouse</td><td className="py-1 text-center">101</td><td className="py-1 text-right">$808.00</td></tr>
                    <tr><td className="py-1">USB-C Cable</td><td className="py-1 text-center">200</td><td className="py-1 text-right">$400.00</td></tr>
                    <tr><td className="py-1">Monitor 24&quot;</td><td className="py-1 text-center">15</td><td className="py-1 text-right">$3,300.00</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="pt-2.5 mt-1 border-t border-stone-200/60 dark:border-stone-700 text-right">
                <span className="text-[9px] font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 inline-flex items-center gap-0.5 cursor-pointer">
                  View all products <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Accounting */}
          <div className="flex flex-col justify-between p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
            <div className="mb-4">
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                Accounting you can trust
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Automated books, reconciled bank feeds, and insightful reports.
              </p>
            </div>
            {/* Profit & Loss Mini UI */}
            <div className="p-3.5 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/50 text-[10px] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-stone-800 dark:text-stone-200">Profit & loss</span>
                  <span className="text-stone-400 text-[9px]">August 2025</span>
                </div>
                <div className="space-y-1 text-[9px]">
                  <div className="flex justify-between text-stone-600 dark:text-stone-300">
                    <span>Revenue</span>
                    <span>$24,280.00</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Cost of goods sold</span>
                    <span>($14,630.00)</span>
                  </div>
                  <div className="flex justify-between font-semibold text-stone-900 dark:text-stone-100 border-t border-stone-200/60 dark:border-stone-700 pt-1">
                    <span>Gross profit</span>
                    <span>$9,650.00</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Operating expenses</span>
                    <span>($3,120.00)</span>
                  </div>
                  <div className="flex justify-between font-bold text-stone-900 dark:text-stone-100 border-t border-stone-200/60 dark:border-stone-700 pt-1">
                    <span>Net profit</span>
                    <span>$6,530.00</span>
                  </div>
                </div>
              </div>
              <div className="pt-2.5 mt-1 border-t border-stone-200/60 dark:border-stone-700 text-right">
                <span className="text-[9px] font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 inline-flex items-center gap-0.5 cursor-pointer">
                  View full report <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Multi-company */}
          <div className="flex flex-col justify-between p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
            <div className="mb-4">
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                Multi-company, simple
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Manage multiple companies with separate books and reports.
              </p>
            </div>
            {/* Companies Mini UI */}
            <div className="p-3.5 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/50 text-[10px] flex flex-col justify-between">
              <div>
                <div className="font-semibold text-stone-800 dark:text-stone-200 mb-2">Companies</div>
                <div className="space-y-1.5 text-[9px]">
                  <div className="flex items-center justify-between p-1.5 rounded-md bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-700">
                    <div className="flex items-center gap-1.5 font-medium text-stone-900 dark:text-stone-100">
                      <User className="w-3 h-3 text-stone-400" />
                      <span>Acme Co.</span>
                    </div>
                    <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 font-semibold px-1 py-0.2 rounded text-[8px]">Current</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 text-stone-600 dark:text-stone-300">
                    <Building2 className="w-3 h-3 text-stone-400" />
                    <span>Acme Retail Ltd.</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 text-stone-600 dark:text-stone-300">
                    <Building2 className="w-3 h-3 text-stone-400" />
                    <span>Acme Services Inc.</span>
                  </div>
                </div>
              </div>
              <div className="pt-2.5 mt-1 border-t border-stone-200/60 dark:border-stone-700 text-right">
                <span className="text-[9px] font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 inline-flex items-center gap-0.5 cursor-pointer">
                  Manage companies <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
