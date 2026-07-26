import { requireTenantContext } from "@/lib/require-tenant-context";
import { getSession } from "@/services/better-auth/session";
import { redirect } from "next/navigation";
import { db } from "@/services/drizzle";
import LogoutButton from "@/features/auth/components/LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - ERP SaaS",
  description: "Your organization control panel.",
};

export default async function DashboardPage() {
  // 1. Enforce tenant context
  const contextResult = await requireTenantContext();

  if (!contextResult.ok) {
    const err = contextResult.error;
    if (err.code === "UNAUTHORIZED") redirect("/sign-in");
    if (err.code === "NO_ACTIVE_ORGANIZATION") redirect("/onboarding");
    redirect("/sign-in");
  }

  const { organizationId, role } = contextResult.value;

  // 2. Fetch session details
  const sessionResult = await getSession();
  const user = sessionResult?.user;

  // 3. Fetch org and profile data
  const org = await db.query.organization.findFirst({
    where: { id: organizationId },
  });

  const profile = await db.query.companyProfile.findFirst({
    where: { organizationId },
  });

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Header */}
      <header className="glass border-b border-(--glass-border) sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-black text-base text-primary-foreground glow-sm">
              E
            </div>
            <span className="font-extrabold tracking-tight text-base text-foreground">
              Quantix CD
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end text-sm">
              <span className="font-semibold text-foreground">
                {user?.name}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {role}
              </span>
            </div>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex flex-col gap-8 z-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground font-light">
            Welcome to your company workspace.
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Org Card */}
          <div className="p-6 rounded-2xl glass hover:glow-sm hover:border-primary/30 border border-(--glass-border) transition-all duration-300 flex flex-col gap-4">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Organization
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-foreground">{org?.name}</h2>
              <span className="text-xs text-muted-foreground">
                ID: {org?.id}
              </span>
            </div>
          </div>

          {/* Profile Card */}
          <div className="p-6 rounded-2xl glass hover:glow-amber hover:border-accent/30 border border-(--glass-border) transition-all duration-300 flex flex-col gap-4">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              Company Model
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-foreground capitalize">
                {profile?.companyType || "Service"}
              </h2>
              <span className="text-xs text-muted-foreground">
                Type of operations run by tenant
              </span>
            </div>
          </div>

          {/* Currency Card */}
          <div className="p-6 rounded-2xl glass hover:glow-sm hover:border-primary/30 border border-(--glass-border) transition-all duration-300 flex flex-col gap-4">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Localization
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-foreground">
                {profile?.baseCurrency || "USD"}
              </h2>
              <span className="text-xs text-muted-foreground">
                Base currency for accounting
              </span>
            </div>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="p-8 rounded-2xl glass-strong border border-(--glass-border) flex flex-col gap-4 glow-amber">
          <h3 className="text-lg font-bold text-foreground">Getting Started</h3>
          <p className="text-sm leading-relaxed text-muted-foreground max-w-2xl font-light">
            Your SaaS tenant is fully initialized with organization-scoped
            isolation. The database schema has been prepared, and the backend is
            type-safe.
          </p>
        </div>
      </main>
    </div>
  );
}
