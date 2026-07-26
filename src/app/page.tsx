import { getSession } from "@/services/better-auth/session";
import type { Metadata } from "next";
import { LandingHeader } from "@/features/landing/components/landing-header";
import { LandingHero } from "@/features/landing/components/landing-hero";
import { LandingFeatures } from "@/features/landing/components/landing-features";
import { LandingArchitecture } from "@/features/landing/components/landing-architecture";
import { LandingFooter } from "@/features/landing/components/landing-footer";

export const metadata: Metadata = {
  title: "Quantix CD - Modern Multi-Tenant ERP SaaS",
  description:
    "Next-generation ERP SaaS offering strict tenant isolation, real-time ledgers, granular RBAC, and sleek modern layouts.",
};

export default async function LandingPage() {
  const session = await getSession();
  const isLoggedIn = !!session;
  const activeOrganizationId = session?.session?.activeOrganizationId;

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <LandingHeader
        isLoggedIn={isLoggedIn}
        activeOrganizationId={activeOrganizationId}
      />
      <main className="flex-1 z-10">
        <LandingHero isLoggedIn={isLoggedIn} />
        <LandingFeatures />
        <LandingArchitecture />
      </main>
      <LandingFooter isLoggedIn={isLoggedIn} />
    </div>
  );
}
