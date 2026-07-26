import "server-only";

import { Tx } from "@/services/drizzle";
import { ledgerAccount } from "@/services/drizzle/schemas";
import { and, eq } from "drizzle-orm";

export const DEFAULT_CHART_OF_ACCOUNTS = [
  { code: "1010", name: "Cash", type: "asset" as const, normalBalance: "debit" as const, isBankAccount: true },
  { code: "1020", name: "Accounts Receivable", type: "asset" as const, normalBalance: "debit" as const, isBankAccount: false },
  { code: "1030", name: "Inventory", type: "asset" as const, normalBalance: "debit" as const, isBankAccount: false },
  { code: "2010", name: "Accounts Payable", type: "liability" as const, normalBalance: "credit" as const, isBankAccount: false },
  { code: "2020", name: "Tax Payable", type: "liability" as const, normalBalance: "credit" as const, isBankAccount: false },
  { code: "3010", name: "Owner's Equity", type: "equity" as const, normalBalance: "credit" as const, isBankAccount: false },
  { code: "4010", name: "Sales Revenue", type: "revenue" as const, normalBalance: "credit" as const, isBankAccount: false },
  { code: "5010", name: "General Expense", type: "expense" as const, normalBalance: "debit" as const, isBankAccount: false },
  { code: "5020", name: "Cost of Goods Sold", type: "expense" as const, normalBalance: "debit" as const, isBankAccount: false },
];

export async function createLedgerAccount(
  tx: Tx,
  input: {
    organizationId: string;
    code: string;
    name: string;
    type: "asset" | "liability" | "equity" | "revenue" | "expense";
    normalBalance: "debit" | "credit";
    parentAccountId?: string | null;
    isBankAccount?: boolean;
    isActive?: boolean;
  },
) {
  const [account] = await tx
    .insert(ledgerAccount)
    .values({
      organizationId: input.organizationId,
      code: input.code,
      name: input.name,
      type: input.type,
      normalBalance: input.normalBalance,
      parentAccountId: input.parentAccountId ?? null,
      isBankAccount: input.isBankAccount ?? false,
      isActive: input.isActive ?? true,
    })
    .returning();
  return account;
}

export async function updateLedgerAccount(
  tx: Tx,
  organizationId: string,
  id: string,
  input: Partial<{
    code: string;
    name: string;
    type: "asset" | "liability" | "equity" | "revenue" | "expense";
    normalBalance: "debit" | "credit";
    parentAccountId: string | null;
    isBankAccount: boolean;
    isActive: boolean;
  }>,
) {
  const [updated] = await tx
    .update(ledgerAccount)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(eq(ledgerAccount.organizationId, organizationId), eq(ledgerAccount.id, id)))
    .returning();
  return updated;
}

export async function seedDefaultChartOfAccounts(tx: Tx, organizationId: string) {
  const existing = await tx.query.ledgerAccount.findFirst({
    where: { organizationId },
  });
  if (existing) return;

  await tx.insert(ledgerAccount).values(
    DEFAULT_CHART_OF_ACCOUNTS.map((acc) => ({
      organizationId,
      code: acc.code,
      name: acc.name,
      type: acc.type,
      normalBalance: acc.normalBalance,
      isBankAccount: acc.isBankAccount,
      isActive: true,
    })),
  );
}
