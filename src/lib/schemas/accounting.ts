import { z } from "zod";

export const accountTypeSchema = z.enum([
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense",
]);

export const normalBalanceSchema = z.enum(["debit", "credit"]);

export const createAccountSchema = z.object({
  code: z.string().min(1, "Account code is required"),
  name: z.string().min(1, "Account name is required"),
  type: accountTypeSchema,
  normalBalance: normalBalanceSchema,
  parentAccountId: z.string().nullable().optional(),
  isBankAccount: z.boolean(),
  isActive: z.boolean(),
});

export const updateAccountSchema = z.object({
  code: z.string().min(1, "Account code is required"),
  name: z.string().min(1, "Account name is required"),
  type: accountTypeSchema.optional(),
  normalBalance: normalBalanceSchema.optional(),
  parentAccountId: z.string().nullable().optional(),
  isBankAccount: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const journalLineInputSchema = z
  .object({
    accountId: z.string().min(1, "Account is required"),
    debit: z.number().min(0, "Debit amount cannot be negative"),
    credit: z.number().min(0, "Credit amount cannot be negative"),
    description: z.string().nullable().optional(),
  })
  .refine(
    (line) => (line.debit > 0 && line.credit === 0) || (line.credit > 0 && line.debit === 0),
    { message: "Each line must have exactly one non-zero side (debit OR credit)." },
  );

export const createJournalEntrySchema = z
  .object({
    entryDate: z.string().min(1, "Entry date is required"),
    description: z.string().min(1, "Description is required"),
    sourceType: z
      .enum(["manual", "invoice", "payment", "adjustment", "stock_adjustment", "payroll"]),
    sourceId: z.string().nullable().optional(),
    lines: z.array(journalLineInputSchema).min(2, "Journal entry must contain at least 2 lines"),
  })
  .refine(
    (data) => {
      const totalDebit = data.lines.reduce((sum, l) => sum + l.debit, 0);
      const totalCredit = data.lines.reduce((sum, l) => sum + l.credit, 0);
      return Math.abs(totalDebit - totalCredit) < 0.0001;
    },
    { message: "Total debits must equal total credits." },
  );

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type JournalLineInput = z.infer<typeof journalLineInputSchema>;
export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>;
