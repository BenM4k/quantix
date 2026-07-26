"use server";

import { revalidatePath } from "next/cache";
import { requireTenantContext } from "@/lib/require-tenant-context";
import { Err, type Result } from "@/lib/server-utils";
import {
  createJournalEntryService,
  reverseJournalEntryService,
} from "@/services/accounting/journal-entry.service";
import {
  createJournalEntrySchema,
  type CreateJournalEntryInput,
} from "@/lib/schemas/accounting";

export async function createJournalEntryAction(
  companyId: string,
  input: CreateJournalEntryInput,
): Promise<Result<any, { code: string; message: string }>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  const validated = createJournalEntrySchema.safeParse(input);
  if (!validated.success) {
    return Err({
      code: "INVALID_INPUT",
      message: validated.error.issues[0]?.message || "Invalid journal entry input",
    });
  }

  const result = await createJournalEntryService(
    companyId,
    {
      entryDate: validated.data.entryDate,
      description: validated.data.description,
      sourceType: validated.data.sourceType,
      sourceId: validated.data.sourceId,
      lines: validated.data.lines,
    },
    ctx.value.userId,
    ctx.value.role,
  );

  if (result.ok) {
    revalidatePath(`/${companyId}/accounting/journal-entries`);
  }

  return result;
}

export async function reverseJournalEntryAction(
  companyId: string,
  entryId: string,
  reason: string,
): Promise<Result<any, { code: string; message: string }>> {
  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    return Err({ code: "FORBIDDEN", message: ctx.error.message });
  }

  const result = await reverseJournalEntryService(
    companyId,
    entryId,
    reason,
    ctx.value.userId,
    ctx.value.role,
  );

  if (result.ok) {
    revalidatePath(`/${companyId}/accounting/journal-entries`);
  }

  return result;
}
