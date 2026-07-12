import "server-only";

import { and, eq } from "drizzle-orm";
import { ledgerAccount } from "@/services/drizzle/schemas";
import type { Tx } from "@/services/drizzle";

export async function getLedgerAccountByCode(
  tx: Tx,
  organizationId: string,
  code: string,
) {
  return tx.query.ledgerAccount.findFirst({
    where: {
      organizationId,
      code,
    },
  });
}

export async function getLedgerAccountById(
  tx: Tx,
  organizationId: string,
  id: string,
) {
  return tx.query.ledgerAccount.findFirst({
    where: {
      organizationId,
      id,
    },
  });
}
