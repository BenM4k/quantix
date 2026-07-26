import "server-only";

import { auth } from "@/services/better-auth/auth";
import { Err, Ok, type Result } from "@/lib/server-utils";

export type AuthActionResult = Result<{ success: boolean }, { code: string; message: string }>;

export type SignUpInput = {
  email: string;
  password: string;
  name: string;
};

export type SignInInput = {
  email: string;
  password: string;
};

export async function signUpService(
  input: SignUpInput,
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
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    return Err({
      code: err.code || "SIGN_UP_ERROR",
      message: err.message || "An error occurred during registration.",
    });
  }
}

export async function signInService(
  input: SignInInput,
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

    // Check if user has an existing company and set it as active
    try {
      const userOrgs = await auth.api.listOrganizations({ headers: requestHeaders });
      if (userOrgs && userOrgs.length > 0) {
        await auth.api.setActiveOrganization({
          body: { organizationId: userOrgs[0].id },
          headers: requestHeaders,
        });
      }
    } catch {
      // Ignore fallback if list/set fails
    }

    return Ok({ success: true });
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    return Err({
      code: err.code || "SIGN_IN_ERROR",
      message: err.message || "An error occurred during login.",
    });
  }
}
