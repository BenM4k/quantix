import React from "react";
import { getAuthContext } from "@/lib/auth-context";
import { getMembersService, getPendingInvitationsService } from "@/services/user/user.service";
import { UsersClient } from "./users-client";
import { PageContainer } from "@/components/layout/page-container";

import { CategorySubNav } from "@/components/navigation/category-sub-nav";

export default async function UserManagementPage({
  params,
  searchParams,
}: {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { companyId } = await params;
  const resolvedSearchParams = await searchParams;

  const { company, role } = await getAuthContext();

  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = Number(resolvedSearchParams.pageSize) || 20;
  const search = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : undefined;
  const roleFilter = typeof resolvedSearchParams.role === "string" ? resolvedSearchParams.role : undefined;

  const membersRes = await getMembersService(company.id, role, {
    page,
    pageSize,
    search,
    role: roleFilter,
  });

  const invitationsRes = await getPendingInvitationsService(company.id, role);

  const members = membersRes.ok ? membersRes.value.rows : [];
  const totalMembers = membersRes.ok ? membersRes.value.total : 0;
  const invitations = invitationsRes.ok ? invitationsRes.value : [];

  return (
    <UsersClient
      companyId={companyId}
      members={members}
      totalMembers={totalMembers}
      invitations={invitations}
      userRole={role}
    />
  );
}
