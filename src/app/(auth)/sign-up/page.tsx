import { getSession } from "@/services/better-auth/session";
import { redirect } from "next/navigation";
import SignUpForm from "@/features/auth/components/SignUpForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - ERP SaaS",
  description: "Create your tenant account and get started.",
};

export default async function SignUpPage() {
  const session = await getSession();

  if (session) {
    if (!session.session.activeOrganizationId) {
      redirect("/onboarding");
    } else {
      redirect("/dashboard");
    }
  }

  return <SignUpForm />;
}
