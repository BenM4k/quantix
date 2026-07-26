import "server-only";

import { withTenantTransaction } from "@/lib/tenant-context";
import { Ok, Err, tryCatch, type Result } from "@/lib/server-utils";
import { canX } from "@/lib/permissions";
import {
  getPaginatedMembers,
  getMemberById,
  updateMemberRole,
  removeMember,
  updateUserProfile,
  getPendingInvitations,
  revokeInvitation,
  type MemberWithUser,
  type PaginationParams,
} from "@/dal/user/queries";
import { invitation } from "@/services/drizzle/schemas";

export type UserServiceError =
  | { code: "FORBIDDEN"; message: string }
  | { code: "NOT_FOUND"; message: string }
  | { code: "DB_ERROR"; message: string };

export async function getMembersService(
  organizationId: string,
  userRole: string,
  params: PaginationParams,
): Promise<Result<{ rows: MemberWithUser[]; total: number }, UserServiceError>> {
  if (!canX(userRole, { id: organizationId }, "user:view")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to view members" });
  }

  return tryCatch(
    () => withTenantTransaction(organizationId, (tx) => getPaginatedMembers(tx, organizationId, params)),
    (cause) => ({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to load members",
    }),
  );
}

export async function getMemberByIdService(
  organizationId: string,
  userRole: string,
  memberId: string,
): Promise<Result<MemberWithUser, UserServiceError>> {
  if (!canX(userRole, { id: organizationId }, "user:view")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to view member details" });
  }

  const res = await tryCatch(
    () => withTenantTransaction(organizationId, (tx) => getMemberById(tx, organizationId, memberId)),
    (cause) => ({
      code: "DB_ERROR" as const,
      message: cause instanceof Error ? cause.message : "Failed to get member",
    }),
  );

  if (!res.ok) return res;
  if (!res.value) return Err({ code: "NOT_FOUND", message: "Member not found" });

  return Ok(res.value);
}

import { sendInvitationEmail } from "@/services/resend/client";

import { auth } from "@/services/better-auth/auth";
import { headers } from "next/headers";

export async function inviteUserService(
  organizationId: string,
  inviterUser: { id: string; name: string; email: string },
  companyName: string,
  userRole: string,
  email: string,
  role: string,
): Promise<Result<{ invitationId: string; email: string }, UserServiceError>> {
  if (!canX(userRole, { id: organizationId }, "user:invite")) {
    return Err({ code: "FORBIDDEN", message: "Only Owners and Admins can invite members" });
  }

  const reqHeaders = await headers();

  const res = await tryCatch(
    async () => {
      const inv = await auth.api.createInvitation({
        headers: reqHeaders,
        body: {
          email,
          role: role as "owner" | "admin" | "accountant" | "staff",
          organizationId,
        },
      });
      return inv;
    },
    (cause) => ({
      code: "DB_ERROR" as const,
      message: cause instanceof Error ? cause.message : "Failed to create invitation via Better Auth",
    }),
  );

  if (!res.ok || !res.value) {
    return Err({ code: "DB_ERROR", message: "Failed to create organization invitation" });
  }

  return Ok({ invitationId: res.value.id, email: res.value.email });
}

export async function updateMemberRoleService(
  organizationId: string,
  userRole: string,
  memberId: string,
  newRole: string,
): Promise<Result<void, UserServiceError>> {
  if (!canX(userRole, { id: organizationId }, "user:update-role")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to change member role" });
  }

  const res = await tryCatch(
    () => withTenantTransaction(organizationId, (tx) => updateMemberRole(tx, organizationId, memberId, newRole)),
    (cause) => ({
      code: "DB_ERROR" as const,
      message: cause instanceof Error ? cause.message : "Failed to update member role",
    }),
  );

  if (!res.ok) return res;
  return Ok(undefined);
}

export async function removeMemberService(
  organizationId: string,
  userRole: string,
  memberId: string,
): Promise<Result<void, UserServiceError>> {
  if (!canX(userRole, { id: organizationId }, "user:remove")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to remove member" });
  }

  const res = await tryCatch(
    () => withTenantTransaction(organizationId, (tx) => removeMember(tx, organizationId, memberId)),
    (cause) => ({
      code: "DB_ERROR" as const,
      message: cause instanceof Error ? cause.message : "Failed to remove member",
    }),
  );

  if (!res.ok) return res;
  return Ok(undefined);
}

export async function updateUserProfileService(
  organizationId: string,
  userRole: string,
  memberId: string,
  data: { name?: string; image?: string | null },
): Promise<Result<void, UserServiceError>> {
  const memberRes = await getMemberByIdService(organizationId, userRole, memberId);
  if (!memberRes.ok) return memberRes;

  const targetUserId = memberRes.value.userId;

  const res = await tryCatch(
    () => withTenantTransaction(organizationId, (tx) => updateUserProfile(tx, targetUserId, data)),
    (cause) => ({
      code: "DB_ERROR" as const,
      message: cause instanceof Error ? cause.message : "Failed to update profile",
    }),
  );

  if (!res.ok) return res;
  return Ok(undefined);
}

import { Invitation } from "@/services/drizzle/schemas";

export async function getPendingInvitationsService(
  organizationId: string,
  userRole: string,
): Promise<Result<Invitation[], UserServiceError>> {
  if (!canX(userRole, { id: organizationId }, "user:view")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied" });
  }

  return tryCatch(
    () => withTenantTransaction(organizationId, (tx) => getPendingInvitations(tx, organizationId)),
    (cause) => ({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to load invitations",
    }),
  );
}

export async function revokeInvitationService(
  organizationId: string,
  userRole: string,
  invitationId: string,
): Promise<Result<void, UserServiceError>> {
  if (!canX(userRole, { id: organizationId }, "user:invite")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied" });
  }

  const res = await tryCatch(
    () => withTenantTransaction(organizationId, (tx) => revokeInvitation(tx, organizationId, invitationId)),
    (cause) => ({
      code: "DB_ERROR" as const,
      message: cause instanceof Error ? cause.message : "Failed to revoke invitation",
    }),
  );

  if (!res.ok) return res;
  return Ok(undefined);
}
