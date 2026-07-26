import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/services/better-auth/auth";

export type AuthContext = {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  };
  company: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
  };
  role: string;
};

/**
 * Resolves session, verifies active organization membership, and returns user, company, and role.
 * Redirects to /login or /onboarding if invalid.
 */
export async function getAuthContext(): Promise<AuthContext> {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session) {
    redirect("/login");
  }

  let activeOrgId = session.session.activeOrganizationId;

  if (!activeOrgId) {
    try {
      const userOrgs = await auth.api.listOrganizations({ headers: reqHeaders });
      if (userOrgs && userOrgs.length > 0) {
        const firstOrg = userOrgs[0];
        await auth.api.setActiveOrganization({
          headers: reqHeaders,
          body: { organizationId: firstOrg.id },
        });
        activeOrgId = firstOrg.id;
      }
    } catch {
      // Ignore fallback failure
    }
  }

  if (!activeOrgId) {
    redirect("/onboarding");
  }

  const activeOrg = await auth.api.getFullOrganization({
    headers: reqHeaders,
    query: { organizationId: activeOrgId },
  });

  const activeMember = await auth.api.getActiveMember({
    headers: reqHeaders,
  });

  if (!activeOrg || !activeMember) {
    redirect("/onboarding");
  }

  return {
    user: session.user,
    company: {
      id: activeOrg.id,
      name: activeOrg.name,
      slug: activeOrg.slug,
      logo: activeOrg.logo,
    },
    role: activeMember.role,
  };
}
