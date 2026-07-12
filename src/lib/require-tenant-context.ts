import "server-only";

import { headers } from "next/headers";
import { auth } from "@/services/better-auth/auth";
import { requireSession } from "@/services/better-auth/session";
import { Err, Ok, type Result } from "@/lib/server-utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * The resolved tenant context every server action operates on.
 * Always comes from the server-side session — never from client input.
 */
export type TenantContext = {
  userId: string;
  organizationId: string;
  /** The user's role inside this organization, as set by Better Auth. */
  role: string;
};

export type TenantContextError =
  | { code: "UNAUTHORIZED"; message: string }
  | { code: "NO_ACTIVE_ORGANIZATION"; message: string }
  | { code: "NOT_A_MEMBER"; message: string };

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

/**
 * The single entry point for all tenant-scoped server actions.
 *
 * Validates:
 *  1. User is authenticated (has a valid session).
 *  2. User has an active organization set on their session.
 *  3. User is an active member of that organization (fetches their role).
 *
 * Returns Ok<TenantContext> with { userId, organizationId, role }, or
 * a typed Err describing exactly what was missing.
 *
 * Usage in a server action:
 *
 *   const ctx = await requireTenantContext();
 *   if (!ctx.ok) return ctx;
 *   const { userId, organizationId, role } = ctx.value;
 *   // now safe to call withTenantTransaction(organizationId, ...)
 */
export async function requireTenantContext(): Promise<
  Result<TenantContext, TenantContextError>
> {
  const sessionResult = await requireSession();

  if (!sessionResult.ok) {
    return sessionResult;
  }

  const { user, session } = sessionResult.value;
  const organizationId = session.activeOrganizationId;

  if (!organizationId) {
    return Err({
      code: "NO_ACTIVE_ORGANIZATION",
      message: "No active organization selected",
    });
  }

  // Fetch the active member record server-side to get the org-scoped role.
  // This is the authoritative source — not a value from the session payload
  // or from client-supplied input.
  const requestHeaders = await headers();

  const member = await auth.api.getActiveMember({
    headers: requestHeaders,
  });

  if (!member) {
    return Err({
      code: "NOT_A_MEMBER",
      message: "User is not a member of the active organization",
    });
  }

  return Ok({
    userId: user.id,
    organizationId,
    role: member.role,
  });
}
