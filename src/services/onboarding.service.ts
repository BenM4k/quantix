import "server-only";

import { auth } from "@/services/better-auth/auth";
import { withTenantTransaction } from "@/lib/tenant-context";
import { createCompanyProfile } from "@/dal/company-profile/mutations";
import { seedDefaultChartOfAccounts } from "@/dal/ledger-account/mutations";
import { fiscalYear, fiscalPeriod } from "@/services/drizzle/schemas";
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

    // 3. Create Company Profile, seed Chart of Accounts, and create initial Fiscal Year/Periods
    await withTenantTransaction(org.id, async (tx) => {
      await createCompanyProfile(tx, {
        organizationId: org.id,
        companyType: input.companyType,
        baseCurrency: input.baseCurrency,
        dateFormat: "YYYY-MM-DD",
        fiscalYearStartMonth: 1,
        fiscalYearStartDay: 1,
      });

      // Seed Default Chart of Accounts automatically
      await seedDefaultChartOfAccounts(tx, org.id);

      // Create current Fiscal Year & monthly Periods
      const currentYear = new Date().getFullYear();
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;

      const [fy] = await tx
        .insert(fiscalYear)
        .values({
          organizationId: org.id,
          label: `FY ${currentYear}`,
          startDate,
          endDate,
          status: "open",
        })
        .returning();

      if (fy) {
        for (let m = 1; m <= 12; m++) {
          const mStr = m.toString().padStart(2, "0");
          const lastDay = new Date(currentYear, m, 0).getDate();
          const pStart = `${currentYear}-${mStr}-01`;
          const pEnd = `${currentYear}-${mStr}-${lastDay.toString().padStart(2, "0")}`;

          await tx.insert(fiscalPeriod).values({
            organizationId: org.id,
            fiscalYearId: fy.id,
            periodNumber: m,
            startDate: pStart,
            endDate: pEnd,
            status: "open",
          });
        }
      }
    });

    return Ok({ success: true, organizationId: org.id });
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    return Err({
      code: err.code || "ONBOARDING_ERROR",
      message: err.message || "An error occurred during onboarding.",
    });
  }
}
