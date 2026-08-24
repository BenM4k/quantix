import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { QuantixLogo } from "./quantix-logo";

interface LandingCtaBannerProps {
  isLoggedIn: boolean;
  activeOrganizationId?: string | null;
}

export function LandingCtaBanner({
  isLoggedIn,
  activeOrganizationId,
}: LandingCtaBannerProps) {
  const ctaHref = isLoggedIn
    ? activeOrganizationId
      ? `/${activeOrganizationId}/inventory/products`
      : "/profile"
    : "/sign-up";

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#FAF4EE] dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4 text-left">
            <QuantixLogo showText={false} iconSize="lg" />
            <div>
              <h2 className="font-semibold text-base sm:text-lg text-stone-900 dark:text-white">
                Your business is already generating the numbers.
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300">
                Let Quantix CD make sense of them.
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <Link
              href={ctaHref}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#FA5A1E] hover:bg-[#E0480E] text-white font-medium text-sm transition-all duration-150 shadow-md shadow-orange-500/25 inline-flex items-center justify-center gap-2"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
