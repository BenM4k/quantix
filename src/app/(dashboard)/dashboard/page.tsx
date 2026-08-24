import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireTenantContext } from "@/lib/require-tenant-context";
import { getSession } from "@/services/better-auth/session";
import { db } from "@/services/drizzle";
import { getDashboardStatsService } from "@/services/dashboard/dashboard.service";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";

export const metadata: Metadata = {
  title: "Dashboard | Quantix",
  description: "Your business overview — revenue, orders, invoices at a glance.",
};

export default async function DashboardPage() {
  const contextResult = await requireTenantContext();

  if (!contextResult.ok) {
    const err = contextResult.error;
    if (err.code === "UNAUTHORIZED") redirect("/sign-in");
    if (err.code === "NO_ACTIVE_ORGANIZATION") redirect("/onboarding");
    redirect("/sign-in");
  }

  const { organizationId, role } = contextResult.value;

  const sessionResult = await getSession();
  const user = sessionResult?.user;

  const [org, profile, stats] = await Promise.all([
    db.query.organization.findFirst({ where: { id: organizationId } }),
    db.query.companyProfile.findFirst({ where: { organizationId } }),
    getDashboardStatsService(organizationId),
  ]);

  if (!org) redirect("/onboarding");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader
        user={{ name: user?.name ?? "", email: user?.email ?? "", image: user?.image }}
        company={{ id: org.id, name: org.name }}
        role={role}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <DashboardShell
          stats={stats}
          org={{ id: org.id, name: org.name }}
          profile={profile ?? null}
          role={role}
          userName={user?.name ?? "there"}
        />
      </main>
    </div>
  );
}
