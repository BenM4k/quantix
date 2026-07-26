"use server";

import { revalidatePath } from "next/cache";
import { requireTenantContext } from "@/lib/require-tenant-context";
import { Ok, Err, type Result } from "@/lib/server-utils";
import { sendInvitationEmail } from "@/services/resend/client";
import {
  inviteUserSchema,
  updateUserRoleSchema,
  updateUserProfileSchema,
  type InviteUserInput,
  type UpdateUserRoleInput,
  type UpdateUserProfileInput,
} from "@/lib/schemas/user";
import {
  inviteUserService,
  updateMemberRoleService,
  removeMemberService,
  updateUserProfileService,
  getMemberByIdService,
  revokeInvitationService,
  type UserServiceError,
} from "@/services/user/user.service";
import { type MemberWithUser } from "@/dal/user/queries";

import { getAuthContext } from "@/lib/auth-context";

export async function inviteUserAction(
  companyId: string,
  input: InviteUserInput,
): Promise<Result<{ invitationId: string; email: string }, UserServiceError | { code: "INVALID_INPUT"; message: string }>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  const validated = inviteUserSchema.safeParse(input);
  if (!validated.success) {
    return Err({
      code: "INVALID_INPUT",
      message: validated.error.issues[0]?.message || "Invalid input data",
    });
  }

  const authCtx = await getAuthContext();

  const result = await inviteUserService(
    ctx.value.organizationId,
    {
      id: authCtx.user.id,
      name: authCtx.user.name,
      email: authCtx.user.email,
    },
    authCtx.company.name,
    ctx.value.role,
    validated.data.email,
    validated.data.role,
  );

  if (result.ok) {
    revalidatePath(`/${companyId}/settings/users`);
  }

  return result;
}

export async function updateMemberRoleAction(
  companyId: string,
  input: UpdateUserRoleInput,
): Promise<Result<void, UserServiceError | { code: "INVALID_INPUT"; message: string }>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  const validated = updateUserRoleSchema.safeParse(input);
  if (!validated.success) {
    return Err({
      code: "INVALID_INPUT",
      message: validated.error.issues[0]?.message || "Invalid input data",
    });
  }

  const result = await updateMemberRoleService(
    ctx.value.organizationId,
    ctx.value.role,
    validated.data.memberId,
    validated.data.role,
  );

  if (result.ok) {
    revalidatePath(`/${companyId}/settings/users`);
  }

  return result;
}

export async function removeMemberAction(
  companyId: string,
  memberId: string,
): Promise<Result<void, UserServiceError>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  const result = await removeMemberService(
    ctx.value.organizationId,
    ctx.value.role,
    memberId,
  );

  if (result.ok) {
    revalidatePath(`/${companyId}/settings/users`);
  }

  return result;
}

export async function updateUserProfileAction(
  companyId: string,
  input: UpdateUserProfileInput,
): Promise<Result<void, UserServiceError | { code: "INVALID_INPUT"; message: string }>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  const validated = updateUserProfileSchema.safeParse(input);
  if (!validated.success) {
    return Err({
      code: "INVALID_INPUT",
      message: validated.error.issues[0]?.message || "Invalid input data",
    });
  }

  const result = await updateUserProfileService(
    ctx.value.organizationId,
    ctx.value.role,
    validated.data.memberId,
    {
      name: validated.data.name,
      image: validated.data.imageUrl,
    },
  );

  if (result.ok) {
    revalidatePath(`/${companyId}/settings/users`);
  }

  return result;
}

export async function getMemberDetailAction(
  companyId: string,
  memberId: string,
): Promise<Result<MemberWithUser, UserServiceError>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  return getMemberByIdService(ctx.value.organizationId, ctx.value.role, memberId);
}

export async function revokeInvitationAction(
  companyId: string,
  invitationId: string,
): Promise<Result<void, UserServiceError>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  const result = await revokeInvitationService(
    ctx.value.organizationId,
    ctx.value.role,
    invitationId,
  );

  if (result.ok) {
    revalidatePath(`/${companyId}/settings/users`);
  }

  return result;
}

export async function resendInvitationAction(
  companyId: string,
  invitationId: string,
  email: string,
  role: string,
): Promise<Result<void, UserServiceError>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  const authCtx = await getAuthContext();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteLink = `${baseUrl}/accept-invitation?id=${invitationId}`;

  const sendResult = await sendInvitationEmail(email, {
    invitedByName: authCtx.user.name,
    invitedByEmail: authCtx.user.email,
    companyName: authCtx.company.name,
    role,
    inviteLink,
  });

  if (!sendResult.success) {
    return Err({
      code: "DB_ERROR",
      message: "Failed to dispatch email via Resend",
    });
  }

  revalidatePath(`/${companyId}/settings/users`);
  return Ok(undefined);
}
