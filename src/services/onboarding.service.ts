import "server-only";

import { auth } from "@/services/better-auth/auth";
import { withTenantTransaction } from "@/lib/tenant-context";
import { createCompanyProfile } from "@/dal/company-profile/mutations";
import { Err, Ok, type Result } from "@/lib/server-utils";

export type OnboardingResult = Result<
  { success: boolean; organizationId: string },
  { code: string; message: string }
>;

export async function onboardCompanyService(
  input: {
    companyName: string;
    companyType: string;
    baseCurrency: string;
  },
  requestHeaders: Headers,
): Promise<OnboardingResult> {
  try {
    // 1. Create Organization in Better Auth
    const slug = input.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const org = await auth.api.createOrganization({
      body: {
        name: input.companyName,
        slug,
      },
      headers: requestHeaders,
    });

    if (!org) {
      return Err({
        code: "CREATE_ORGANIZATION_FAILED",
        message: "Failed to create organization.",
      });
    }

    // 2. Set the organization as active for this session
    await auth.api.setActiveOrganization({
      body: {
        organizationId: org.id,
      },
      headers: requestHeaders,
    });

    // 3. Create the Company Profile in a tenant transaction
    await withTenantTransaction(org.id, async (tx) => {
      await createCompanyProfile(tx, {
        organizationId: org.id,
        companyType: input.companyType,
        baseCurrency: input.baseCurrency,
        dateFormat: "YYYY-MM-DD",
        fiscalYearStartMonth: 1,
        fiscalYearStartDay: 1,
      });
    });

    return Ok({ success: true, organizationId: org.id });
  } catch (error: any) {
    return Err({
      code: error.code || "ONBOARDING_ERROR",
      message: error.message || "An error occurred during onboarding.",
    });
  }
}
