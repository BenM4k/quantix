import "server-only";

import { headers } from "next/headers";
import { auth } from "@/services/better-auth/auth";
import { Err, Ok, type Result } from "@/lib/server-utils";

export type PermissionError = {
  code: "FORBIDDEN";
  message: string;
};

/**
 * Checks whether the current session user has a given permission
 * within their active organization.
 * Server-only context.
 */
export async function requirePermission(
  permission: Record<string, string[]>,
): Promise<Result<true, PermissionError>> {
  const result = await auth.api.hasPermission({
    body: { permissions: permission },
    headers: await headers(),
  });

  if (!result.success) {
    return Err({ code: "FORBIDDEN", message: "Insufficient permissions" });
  }

  return Ok(true);
}
