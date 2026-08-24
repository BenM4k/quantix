import React from "react";
import { Check, X } from "lucide-react";

export function LandingComparison() {
  return (
    <section className="py-16 md:py-24 bg-[#FAF5F0]/70 dark:bg-stone-900/40 border-y border-stone-200/60 dark:border-stone-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Description */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-white leading-[1.15] font-normal">
              Built for small businesses.
              <br />
              Not bloated enterprises.
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
              Quantix CD is designed for speed, clarity and ease. No consultants. No six-month implementation. Just a system that works.
            </p>
          </div>

          {/* Right Comparison Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Quantix CD Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                Quantix CD
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#FA5A1E]/10 text-[#FA5A1E] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span>Setup in minutes</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#FA5A1E]/10 text-[#FA5A1E] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span>Easy to use</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#FA5A1E]/10 text-[#FA5A1E] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span>Built for small teams</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#FA5A1E]/10 text-[#FA5A1E] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span>Clean, fair pricing</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#FA5A1E]/10 text-[#FA5A1E] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span>Actually get things done</span>
                </li>
              </ul>
            </div>

            {/* Traditional ERPs Card */}
            <div className="p-6 rounded-2xl bg-white/50 dark:bg-stone-900/30 border border-stone-200/60 dark:border-stone-800 space-y-4">
              <h3 className="font-semibold text-base text-stone-700 dark:text-stone-300">
                Traditional ERPs
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-400 flex items-center justify-center shrink-0">
                    <X className="w-2.5 h-2.5 stroke-[2.5]" />
                  </span>
                  <span>Months to implement</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-400 flex items-center justify-center shrink-0">
                    <X className="w-2.5 h-2.5 stroke-[2.5]" />
                  </span>
                  <span>Hard to learn</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-400 flex items-center justify-center shrink-0">
                    <X className="w-2.5 h-2.5 stroke-[2.5]" />
                  </span>
                  <span>Built for large enterprises</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-400 flex items-center justify-center shrink-0">
                    <X className="w-2.5 h-2.5 stroke-[2.5]" />
                  </span>
                  <span>Expensive &amp; complex</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-400 flex items-center justify-center shrink-0">
                    <X className="w-2.5 h-2.5 stroke-[2.5]" />
                  </span>
                  <span>More process, less progress</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
