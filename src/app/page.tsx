import { getSession } from "@/services/better-auth/session";
import type { Metadata } from "next";
import { LandingHeader } from "@/features/landing/components/landing-header";
import { LandingHero } from "@/features/landing/components/landing-hero";
import { LandingCoreLoop } from "@/features/landing/components/landing-core-loop";
import { LandingFeatureGrid } from "@/features/landing/components/landing-feature-grid";
import { LandingComparison } from "@/features/landing/components/landing-comparison";
import { LandingSecurity } from "@/features/landing/components/landing-security";
import { LandingPricing } from "@/features/landing/components/landing-pricing";
import { LandingFAQ } from "@/features/landing/components/landing-faq";
import { LandingCtaBanner } from "@/features/landing/components/landing-cta-banner";
import { LandingFooter } from "@/features/landing/components/landing-footer";

export const metadata: Metadata = {
  title: "Quantix CD — Sales in. Statements out.",
  description:
    "Quantix CD turns your everyday sales activity into trustworthy financial statements — automatically. No accounting knowledge required.",
};

export default async function LandingPage() {
  const session = await getSession();
  const isLoggedIn = !!session;
  const activeOrganizationId = session?.session?.activeOrganizationId;

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col selection:bg-orange-500/20 selection:text-orange-900">
      <LandingHeader
        isLoggedIn={isLoggedIn}
        activeOrganizationId={activeOrganizationId}
      />
      <main className="flex-1">
        <LandingHero
          isLoggedIn={isLoggedIn}
          activeOrganizationId={activeOrganizationId}
        />
        <LandingCoreLoop />
        <LandingFeatureGrid />
        <LandingComparison />
        <LandingSecurity />
        <LandingPricing />
        <LandingFAQ />
        <LandingCtaBanner
          isLoggedIn={isLoggedIn}
          activeOrganizationId={activeOrganizationId}
        />
      </main>
      <LandingFooter />
    </div>
  );
}
