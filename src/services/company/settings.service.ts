import "server-only";

import { withTenantTransaction } from "@/lib/tenant-context";
import { canX } from "@/lib/permissions";
import { Err, Ok, type Result } from "@/lib/server-utils";
import { getCompanyProfile, hasJournalEntries } from "@/dal/company-profile/queries";
import { updateCompanyProfile, createCompanyProfile } from "@/dal/company-profile/mutations";
import { CompanyProfile } from "@/services/drizzle/schemas";

export interface UpdateCompanyFiscalSettingsInput {
  baseCurrency?: string;
  dateFormat?: string;
  fiscalYearStartMonth?: number;
  fiscalYearStartDay?: number;
}

export type CompanySettingsError =
  | { code: "FORBIDDEN"; message: string }
  | { code: "NOT_FOUND"; message: string }
  | { code: "INVALID_INPUT"; message: string }
  | { code: "LOCKED"; message: string }
  | { code: "DB_ERROR"; message: string };

export async function updateCompanySettingsService(
  companyId: string,
  input: UpdateCompanyFiscalSettingsInput,
  userId: string,
  userRole?: string,
): Promise<Result<CompanyProfile, CompanySettingsError>> {
  if (userRole && !canX(userRole, { id: companyId }, "company:manage")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to manage company settings." });
  }

  try {
    return await withTenantTransaction(companyId, async (tx) => {
      let existing = await getCompanyProfile(tx, companyId);
      if (!existing) {
        // Fallback: create default profile if missing
        existing = await createCompanyProfile(tx, {
          organizationId: companyId,
          baseCurrency: "USD",
          dateFormat: "YYYY-MM-DD",
          fiscalYearStartMonth: 1,
          fiscalYearStartDay: 1,
        });
      }

      const hasActivity = await hasJournalEntries(tx, companyId);

      const monthChanged =
        input.fiscalYearStartMonth !== undefined &&
        input.fiscalYearStartMonth !== existing.fiscalYearStartMonth;

      const dayChanged =
        input.fiscalYearStartDay !== undefined &&
        input.fiscalYearStartDay !== existing.fiscalYearStartDay;

      if (hasActivity && (monthChanged || dayChanged)) {
        return Err({
          code: "LOCKED",
          message:
            "Fiscal year start can't be changed once accounting activity exists, since it would reshuffle historical reporting periods.",
        });
      }

      // Input validation
      if (input.fiscalYearStartMonth !== undefined) {
        if (input.fiscalYearStartMonth < 1 || input.fiscalYearStartMonth > 12) {
          return Err({ code: "INVALID_INPUT", message: "Fiscal year start month must be between 1 and 12." });
        }
      }

      if (input.fiscalYearStartDay !== undefined) {
        if (input.fiscalYearStartDay < 1 || input.fiscalYearStartDay > 28) {
          return Err({ code: "INVALID_INPUT", message: "Fiscal year start day must be between 1 and 28." });
        }
      }

      const updated = await updateCompanyProfile(tx, companyId, {
        ...(input.baseCurrency && { baseCurrency: input.baseCurrency }),
        ...(input.dateFormat && { dateFormat: input.dateFormat }),
        ...(!hasActivity && input.fiscalYearStartMonth !== undefined && { fiscalYearStartMonth: input.fiscalYearStartMonth }),
        ...(!hasActivity && input.fiscalYearStartDay !== undefined && { fiscalYearStartDay: input.fiscalYearStartDay }),
      });

      return Ok(updated!);
    });
  } catch (cause) {
    return Err({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to update company settings",
    });
  }
}

export async function getCompanySettingsService(
  companyId: string,
  userRole?: string,
): Promise<Result<{ profile: CompanyProfile; hasAccountingActivity: boolean }, CompanySettingsError>> {
  try {
    return await withTenantTransaction(companyId, async (tx) => {
      let profile = await getCompanyProfile(tx, companyId);
      if (!profile) {
        profile = await createCompanyProfile(tx, {
          organizationId: companyId,
          baseCurrency: "USD",
          dateFormat: "YYYY-MM-DD",
          fiscalYearStartMonth: 1,
          fiscalYearStartDay: 1,
        });
      }
      const hasAccountingActivity = await hasJournalEntries(tx, companyId);
      return Ok({ profile, hasAccountingActivity });
    });
  } catch (cause) {
    return Err({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to fetch company settings",
    });
  }
}
