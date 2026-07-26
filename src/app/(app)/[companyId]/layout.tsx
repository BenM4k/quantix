import React from "react";
import { headers } from "next/headers";
import { getAuthContext } from "@/lib/auth-context";
import { auth } from "@/services/better-auth/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "./app-sidebar";
import { TopBar } from "./top-bar";

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
      <SidebarProvider>
        <div className="flex min-h-screen w-full relative overflow-hidden bg-background">
          {/* Ambient background matching landing page */}
          <div className="ambient-bg">
            <div
              className="ambient-orb size-[600px] -top-40 -left-40"
              style={{ background: "var(--glow-orange)" }}
            />
            <div
              className="ambient-orb size-[500px] top-1/3 -right-32"
              style={{
                background: "var(--glow-amber)",
                animationDelay: "-7s",
                animationDuration: "25s",
              }}
            />
            <div
              className="ambient-orb size-[400px] -bottom-32 left-1/3"
              style={{
                background: "var(--glow-orange)",
                animationDelay: "-14s",
                animationDuration: "18s",
                opacity: 0.3,
              }}
            />
          </div>
          <div className="vignette" />

          <AppSidebar user={user} company={company} role={role} />
          <div className="flex flex-col flex-1 min-w-0 z-10">
            <TopBar
              company={company}
              user={user}
              organizations={organizations}
            />
            <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
