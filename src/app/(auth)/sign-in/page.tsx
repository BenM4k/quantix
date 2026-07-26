import { getSession } from "@/services/better-auth/session";
import { redirect } from "next/navigation";
import SignInForm from "@/features/auth/components/SignInForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - ERP SaaS",
  description: "Sign in to your account.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callback?: string }>;
}) {
  const params = await searchParams;
  const session = await getSession();

  if (session) {
    if (params.callback) {
      redirect(params.callback);
    }
    if (!session.session.activeOrganizationId) {
      redirect("/onboarding");
    } else {
      redirect("/dashboard");
    }
  }

  return <SignInForm />;
}
