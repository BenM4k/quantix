import React from "react";
import { ShieldCheck, Cloud, Lock, Shield } from "lucide-react";

export function LandingSecurity() {
  return (
    <section className="py-16 md:py-24 border-b border-stone-200/60 dark:border-stone-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-12">
          <span className="text-[11px] font-bold tracking-[0.2em] text-stone-500 dark:text-stone-400 uppercase">
            Your data is safe
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-white mt-2 font-normal">
            Security and reliability
            <br />
            you can count on.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Item 1 */}
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex items-center justify-center text-stone-700 dark:text-stone-300">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
              Bank-grade encryption
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Your data is encrypted in transit and at rest.
            </p>
          </div>

          {/* Item 2 */}
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex items-center justify-center text-stone-700 dark:text-stone-300">
              <Cloud className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
              Daily backups
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Automated backups with point-in-time recovery.
            </p>
          </div>

          {/* Item 3 */}
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex items-center justify-center text-stone-700 dark:text-stone-300">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
              Role-based access
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Granular permissions to keep your data protected.
            </p>
          </div>

          {/* Item 4 */}
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex items-center justify-center text-stone-700 dark:text-stone-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
              SOC 2 roadmap
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              We&apos;re working towards SOC 2 Type II compliance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
