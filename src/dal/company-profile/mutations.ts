import "server-only";

import { eq } from "drizzle-orm";
import type { Tx } from "@/services/drizzle";
import { companyProfile, NewCompanyProfile, CompanyProfile } from "@/services/drizzle/schemas";

export async function createCompanyProfile(
  tx: Tx,
  input: NewCompanyProfile,
) {
  const [profile] = await tx
    .insert(companyProfile)
    .values(input)
    .returning();
  return profile;
}

export async function updateCompanyProfile(
  tx: Tx,
  organizationId: string,
  data: Partial<NewCompanyProfile>,
): Promise<CompanyProfile | null> {
  const [updated] = await tx
    .update(companyProfile)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(companyProfile.organizationId, organizationId))
    .returning();

  return updated ?? null;
}
