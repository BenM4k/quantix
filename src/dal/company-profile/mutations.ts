import "server-only";

import type { Tx } from "@/services/drizzle";
import { companyProfile, NewCompanyProfile } from "@/services/drizzle/schemas";

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
