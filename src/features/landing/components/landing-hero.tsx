import Link from "next/link";
import { ArrowRight, Play, Check } from "lucide-react";
import { HeroDashboardMockup } from "./hero-dashboard-mockup";

interface LandingHeroProps {
  isLoggedIn: boolean;
  activeOrganizationId?: string | null;
}

export function LandingHero({
  isLoggedIn,
  activeOrganizationId,
}: LandingHeroProps) {
  const getStartedHref = isLoggedIn
    ? activeOrganizationId
      ? `/${activeOrganizationId}/inventory/products`
      : "/profile"
    : "/sign-up";

  return (
    <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-7 text-left">
            <div className="inline-block">
              <span className="text-[11px] font-bold tracking-widest text-[#FA5A1E] uppercase">
                Accounting that works for you
              </span>
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl text-stone-900 dark:text-white leading-[1.08] tracking-tight font-normal">
              Sales in.
              <br />
              Statements{" "}
              <span className="text-[#FA5A1E] font-medium italic">out.</span>
            </h1>

            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed max-w-lg">
              Quantix CD turns your everyday sales activity into trustworthy financial statements — automatically. No accounting knowledge required.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href={getStartedHref}
                className="px-6 py-3 rounded-lg bg-[#FA5A1E] hover:bg-[#E0480E] text-white font-medium text-sm transition-all duration-150 shadow-md shadow-orange-500/25 inline-flex items-center gap-2"
              >
                Start for free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="px-5 py-3 rounded-lg border border-stone-300/80 dark:border-stone-700 bg-white/80 dark:bg-stone-900/80 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-sm font-medium transition-colors inline-flex items-center gap-2 shadow-xs"
              >
                <span>See how it works</span>
                <span className="w-5 h-5 rounded-full bg-[#FA5A1E]/10 text-[#FA5A1E] flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </span>
              </a>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-stone-600 dark:text-stone-400">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-[#FA5A1E]/10 text-[#FA5A1E] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-[#FA5A1E]/10 text-[#FA5A1E] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>Setup in minutes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-[#FA5A1E]/10 text-[#FA5A1E] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Right Column: High Fidelity Mockup */}
          <div className="lg:col-span-7">
            <HeroDashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
