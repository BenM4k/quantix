"use server";

import { headers } from "next/headers";
import { requireSession } from "@/services/better-auth/session";
import { signInService, signUpService } from "@/services/auth.service";
import { onboardCompanyService } from "@/services/onboarding.service";
import { Err, Ok, type Result } from "@/lib/server-utils";
import { auth } from "@/services/better-auth/auth";

import { signUpSchema, signInSchema, onboardingSchema } from "@/lib/validation/auth";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function signUpAction(
  input: unknown,
): Promise<Result<{ success: boolean }, { code: string; message: string }>> {
  const result = signUpSchema.safeParse(input);

  if (!result.success) {
    return Err({
      code: "INVALID_INPUT",
      message: result.error.issues[0]?.message || "Invalid input data",
    });
  }

  const requestHeaders = await headers();
  return signUpService(result.data, requestHeaders);
}

export async function signInAction(
  input: unknown,
): Promise<Result<{ success: boolean }, { code: string; message: string }>> {
  const result = signInSchema.safeParse(input);

  if (!result.success) {
    return Err({
      code: "INVALID_INPUT",
      message: result.error.issues[0]?.message || "Invalid input data",
    });
  }

  const requestHeaders = await headers();
  return signInService(result.data, requestHeaders);
}

export async function onboardingAction(
  input: unknown,
): Promise<Result<{ success: boolean; organizationId: string }, { code: string; message: string }>> {
  // 1. Check authentication/session
  const sessionResult = await requireSession();
  if (!sessionResult.ok) {
    return Err({
      code: "UNAUTHORIZED",
      message: "You must be logged in to onboard.",
    });
  }

  // 2. Validate input
  const result = onboardingSchema.safeParse(input);
  if (!result.success) {
    return Err({
      code: "INVALID_INPUT",
      message: result.error.issues[0]?.message || "Invalid input data",
    });
  }

  const requestHeaders = await headers();
  return onboardCompanyService(result.data, requestHeaders);
}

export async function signOutAction(): Promise<Result<{ success: boolean }, { code: string; message: string }>> {
  try {
    const requestHeaders = await headers();
    await auth.api.signOut({
      headers: requestHeaders,
    });
    return Ok({ success: true });
  } catch (error: any) {
    return Err({
      code: error.code || "SIGN_OUT_ERROR",
      message: error.message || "An error occurred during logout.",
    });
  }
}
