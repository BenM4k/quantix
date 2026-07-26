import "server-only";

import { and, eq, ilike, or, count, asc } from "drizzle-orm";
import { ledgerAccount, journalEntryLine, type LedgerAccountType } from "@/services/drizzle/schemas";
import type { Tx } from "@/services/drizzle";

export async function getLedgerAccountByCode(
  tx: Tx,
  organizationId: string,
  code: string,
) {
  const [account] = await tx
    .select()
    .from(ledgerAccount)
    .where(
      and(
        eq(ledgerAccount.organizationId, organizationId),
        eq(ledgerAccount.code, code),
      ),
    )
    .limit(1);
  return account || null;
}

export async function getLedgerAccountById(
  tx: Tx,
  organizationId: string,
  id: string,
) {
  const [account] = await tx
    .select()
    .from(ledgerAccount)
    .where(
      and(
        eq(ledgerAccount.organizationId, organizationId),
        eq(ledgerAccount.id, id),
      ),
    )
    .limit(1);
  return account || null;
}

export async function getLedgerAccountsList(
  tx: Tx,
  organizationId: string,
  params?: {
    search?: string;
    type?: string;
    page?: number;
    limit?: number;
  },
) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 50;
  const offset = (page - 1) * limit;

  const conditions = [eq(ledgerAccount.organizationId, organizationId)];

  if (params?.type && params.type !== "all") {
    conditions.push(eq(ledgerAccount.type, params.type as LedgerAccountType));
  }

  if (params?.search) {
    const q = `%${params.search}%`;
    conditions.push(
      or(ilike(ledgerAccount.code, q), ilike(ledgerAccount.name, q))!,
    );
  }

  const whereClause = and(...conditions);

  const [totalRes] = await tx
    .select({ total: count() })
    .from(ledgerAccount)
    .where(whereClause);

  const data = await tx
    .select()
    .from(ledgerAccount)
    .where(whereClause)
    .orderBy(asc(ledgerAccount.code))
    .limit(limit)
    .offset(offset);

  return {
    accounts: data,
    total: Number(totalRes?.total ?? 0),
  };
}

export async function getAllActiveLedgerAccounts(
  tx: Tx,
  organizationId: string,
) {
  return tx
    .select()
    .from(ledgerAccount)
    .where(
      and(
        eq(ledgerAccount.organizationId, organizationId),
        eq(ledgerAccount.isActive, true),
      ),
    )
    .orderBy(asc(ledgerAccount.code));
}

export async function hasAccountActivity(
  tx: Tx,
  organizationId: string,
  accountId: string,
): Promise<boolean> {
  const [res] = await tx
    .select({ total: count() })
    .from(journalEntryLine)
    .where(
      and(
        eq(journalEntryLine.organizationId, organizationId),
        eq(journalEntryLine.ledgerAccountId, accountId),
      ),
    );
  return Number(res?.total ?? 0) > 0;
}
