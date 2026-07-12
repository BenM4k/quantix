import "server-only";

import { auth } from "@/services/better-auth/auth";
import { Err, Ok, type Result } from "@/lib/server-utils";

export type AuthActionResult = Result<{ success: boolean }, { code: string; message: string }>;

export async function signUpService(
  input: any,
  requestHeaders: Headers,
): Promise<AuthActionResult> {
  try {
    const response = await auth.api.signUpEmail({
      body: {
        email: input.email,
        password: input.password,
        name: input.name,
      },
      headers: requestHeaders,
    });

    if (!response) {
      return Err({
        code: "SIGN_UP_FAILED",
        message: "Sign up failed to return a response.",
      });
    }

    return Ok({ success: true });
  } catch (error: any) {
    return Err({
      code: error.code || "SIGN_UP_ERROR",
      message: error.message || "An error occurred during registration.",
    });
  }
}

export async function signInService(
  input: any,
  requestHeaders: Headers,
): Promise<AuthActionResult> {
  try {
    const response = await auth.api.signInEmail({
      body: {
        email: input.email,
        password: input.password,
      },
      headers: requestHeaders,
    });

    if (!response) {
      return Err({
        code: "SIGN_IN_FAILED",
        message: "Sign in failed to return a response.",
      });
    }

    return Ok({ success: true });
  } catch (error: any) {
    return Err({
      code: error.code || "SIGN_IN_ERROR",
      message: error.message || "An error occurred during login.",
    });
  }
}
