import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/services/better-auth/auth";
import { ProfileClient } from "./profile-client";

export type UserOrganization = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
};

export default async function ProfilePage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session) {
    redirect("/sign-in");
  }

  const activeOrgId = session.session.activeOrganizationId;

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
    // Ignore list error
  }

  return (
    <ProfileClient
      user={session.user}
      activeOrgId={activeOrgId}
      organizations={organizations}
    />
  );
}
