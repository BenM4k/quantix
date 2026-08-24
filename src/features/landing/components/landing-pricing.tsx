import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";

export function LandingPricing() {
  return (
    <section id="pricing" className="py-16 md:py-24 border-b border-stone-200/60 dark:border-stone-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-[11px] font-bold tracking-[0.2em] text-stone-500 dark:text-stone-400 uppercase">
              Simple, transparent pricing
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-white leading-[1.15] font-normal">
              Everything you need
              <br />
              to run your business.
              <br />
              One price. No surprises.
            </h2>
          </div>

          {/* Right Pricing Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Starter Plan Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                  Starter
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  For solo founders and small teams.
                </p>

                <div className="my-5 flex items-baseline gap-1">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100">
                    $29
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    /month
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 text-xs text-stone-700 dark:text-stone-300 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#FA5A1E] shrink-0" />
                    <span>All core features</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#FA5A1E] shrink-0" />
                    <span>1 company</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#FA5A1E] shrink-0" />
                    <span>Up to 2 users</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#FA5A1E] shrink-0" />
                    <span>Email support</span>
                  </div>
                </div>
              </div>

              <Link
                href="/sign-up"
                className="w-full py-2.5 px-4 rounded-lg bg-[#FA5A1E] hover:bg-[#E0480E] text-white font-medium text-xs sm:text-sm text-center transition-all duration-150 shadow-sm shadow-orange-500/25 block"
              >
                Start for free
              </Link>
            </div>

            {/* Need More Card */}
            <div className="p-6 rounded-2xl bg-white/60 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-base text-stone-900 dark:text-stone-100">
                  Need more?
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                  More companies or advanced needs? Let&apos;s talk.
                </p>
              </div>

              <a
                href="#contact"
                className="w-full py-2.5 px-4 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium text-xs sm:text-sm text-center transition-colors block mt-8"
              >
                Contact us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
