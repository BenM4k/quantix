"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/services/better-auth/auth";
import { requireSession } from "@/services/better-auth/session";
import { Err, Ok, type Result } from "@/lib/server-utils";

export async function setActiveCompanyAction(
  organizationId: string,
): Promise<Result<void, { code: string; message: string }>> {
  const sessionResult = await requireSession();
  if (!sessionResult.ok) {
    return Err({ code: "UNAUTHORIZED", message: "Authentication required" });
  }

  try {
    const reqHeaders = await headers();
    await auth.api.setActiveOrganization({
      headers: reqHeaders,
      body: { organizationId },
    });

    return Ok(undefined);
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    return Err({
      code: err.code || "SET_ACTIVE_FAILED",
      message: err.message || "Failed to set active organization",
    });
  }
}
