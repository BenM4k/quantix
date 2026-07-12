import { getSession } from "@/services/better-auth/session";
import { redirect } from "next/navigation";
import SignInForm from "@/features/auth/components/SignInForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - ERP SaaS",
  description: "Sign in to your account.",
};

export default async function SignInPage() {
  const session = await getSession();

  if (session) {
    if (!session.session.activeOrganizationId) {
      redirect("/onboarding");
    } else {
      redirect("/dashboard");
    }
  }

  return <SignInForm />;
}
