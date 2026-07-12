import "server-only";

import { headers } from "next/headers";
import { auth } from "./auth";
import { Err, Ok, type Result } from "@/lib/server-utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

export type SessionError = {
  code: "UNAUTHORIZED";
  message: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the current session, or null if not authenticated.
 * Use this for pages/layouts that need to conditionally render
 * authenticated content without hard-failing.
 */
export async function getSession(): Promise<Session | null> {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Returns the current session as Ok<Session>, or Err if not authenticated.
 * Use this inside every server action that requires a logged-in user.
 *
 * Usage:
 *   const sessionResult = await requireSession();
 *   if (!sessionResult.ok) return sessionResult;
 *   const { user } = sessionResult.value;
 */
export async function requireSession(): Promise<Result<Session, SessionError>> {
  const session = await getSession();

  if (!session) {
    return Err({ code: "UNAUTHORIZED", message: "Authentication required" });
  }

  return Ok(session);
}
