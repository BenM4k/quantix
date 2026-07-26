import "server-only";

import { eq, and, count } from "drizzle-orm";
import type { Tx } from "@/services/drizzle";
import { companyProfile, journalEntry, taxRate, type CompanyProfile, type TaxRate } from "@/services/drizzle/schemas";

export async function getCompanyProfile(
  tx: Tx,
  organizationId: string,
): Promise<CompanyProfile | null> {
  const [profile] = await tx
    .select()
    .from(companyProfile)
    .where(eq(companyProfile.organizationId, organizationId))
    .limit(1);

  return profile ?? null;
}

export async function hasJournalEntries(
  tx: Tx,
  organizationId: string,
): Promise<boolean> {
  const [{ total }] = await tx
    .select({ total: count() })
    .from(journalEntry)
    .where(eq(journalEntry.organizationId, organizationId));

  return Number(total) > 0;
}

export async function getCompanyTaxRates(
  tx: Tx,
  organizationId: string,
): Promise<TaxRate[]> {
  return tx
    .select()
    .from(taxRate)
    .where(and(eq(taxRate.organizationId, organizationId), eq(taxRate.active, true)));
}
