import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { AnimateOnEnter } from "./animate-on-enter";

export function LandingPricing() {
  return (
    <section
      id="pricing"
      className="py-20 md:py-32 bg-[#FAF4EE] dark:bg-stone-900/40 border-b border-stone-200/60 dark:border-stone-800/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header — centred */}
        <AnimateOnEnter>
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold tracking-[0.2em] text-stone-400 uppercase">
              Simple, transparent pricing
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-white leading-[1.15] font-normal mt-3">
              Everything you need to run your business.
              <br />
              One price. No surprises.
            </h2>
          </div>
        </AnimateOnEnter>

        {/* Pricing cards — centred stack */}
        <div className="max-w-sm mx-auto space-y-5">
          {/* Starter Plan Card — Gentle lift on hover */}
          <AnimateOnEnter delay={0.08}>
            <div className="p-8 sm:p-9 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-md shadow-stone-200/60 dark:shadow-none hover:shadow-xl hover:shadow-stone-300/40 dark:hover:shadow-black/60 hover:-translate-y-0.5 transition-all duration-150 ease-out text-center">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                Starter
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                For solo founders and small teams.
              </p>

              {/* Dominant price */}
              <div className="my-8">
                <div className="flex items-start justify-center gap-1">
                  <span className="text-lg font-medium text-stone-400 mt-4">
                    $
                  </span>
                  <span className="font-serif text-7xl sm:text-8xl font-normal text-stone-900 dark:text-stone-100 leading-none tracking-tight">
                    29
                  </span>
                </div>
                <span className="text-xs text-stone-400 block mt-2">
                  per month · cancel anytime
                </span>
              </div>

              {/* Feature list */}
              <ul className="space-y-2.5 text-xs text-stone-700 dark:text-stone-300 text-left mb-8">
                {[
                  "All core features included",
                  "1 company",
                  "Up to 2 users",
                  "Email support",
                  "No credit card required to start",
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5">
                    <Check className="w-3.5 h-3.5 text-[#FA5A1E] shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className="w-full py-3.5 px-4 rounded-lg bg-[#FA5A1E] hover:bg-[#E0480E] text-white font-medium text-sm text-center transition-all duration-150 shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/35 hover:scale-[1.02] active:scale-[0.99] block"
              >
                Start for free
              </Link>
            </div>
          </AnimateOnEnter>

          {/* Need More Card */}
          <AnimateOnEnter delay={0.14}>
            <div className="p-5 sm:p-6 rounded-xl bg-white/60 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                  Need more?
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Multiple companies or advanced needs — let&apos;s talk.
                </p>
              </div>
              <a
                href="#contact"
                className="shrink-0 py-2.5 px-4 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium text-xs transition-colors whitespace-nowrap"
              >
                Contact us
              </a>
            </div>
          </AnimateOnEnter>
        </div>
      </div>
    </section>
  );
}
