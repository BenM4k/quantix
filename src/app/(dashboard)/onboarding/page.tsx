import { getSession } from "@/services/better-auth/session";
import { redirect } from "next/navigation";
import OnboardingForm from "@/features/onboarding/components/OnboardingForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding - ERP SaaS",
  description: "Complete your onboarding configuration.",
};

export default async function OnboardingPage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  if (session.session.activeOrganizationId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950 px-4 py-12 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-900/10 blur-[120px] pointer-events-none" />

      <OnboardingForm />
    </div>
  );
}
