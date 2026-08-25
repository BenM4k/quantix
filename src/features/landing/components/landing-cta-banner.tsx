import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { QuantixLogo } from "./quantix-logo";
import { AnimateOnEnter } from "./animate-on-enter";

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
    <section className="py-16 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnEnter>
          <div className="rounded-2xl bg-primary-50 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs">
            <div className="flex items-center gap-5 text-left">
              <QuantixLogo showText={false} iconSize="lg" />
              <div>
                <h2 className="font-semibold text-base sm:text-xl text-stone-900 dark:text-white">
                  Your business is already generating the numbers.
                </h2>
                <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 mt-1">
                  Let Quantix CD make sense of them.
                </p>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <Link
                href={ctaHref}
                className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition-all duration-150 shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 hover:scale-[1.02] active:scale-[0.99] inline-flex items-center justify-center gap-2"
              >
                Start for free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </AnimateOnEnter>
      </div>
    </section>
  );
}
