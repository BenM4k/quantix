import React from "react";
import { headers } from "next/headers";
import { getAuthContext } from "@/lib/auth-context";
import { auth } from "@/services/better-auth/auth";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TopNav } from "@/components/navigation/top-nav";

export type UserOrganization = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
};

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reqHeaders = await headers();
  const { user, company, role } = await getAuthContext();

  let organizations: UserOrganization[] = [];
  try {
    const list = await auth.api.listOrganizations({ headers: reqHeaders });
    if (list) {
      organizations = list.map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        logo: org.logo ?? null,
      }));
    }
  } catch {
    // Ignore error fallback
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col w-full bg-background antialiased selection:bg-indigo-500/20">
        <TopNav
          company={company}
          user={user}
          role={role}
          organizations={organizations}
        />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
}
