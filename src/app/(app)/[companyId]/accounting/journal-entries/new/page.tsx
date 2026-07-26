import { requireTenantContext } from "@/lib/require-tenant-context";
import { withTenantTransaction } from "@/lib/tenant-context";
import { getAllActiveLedgerAccounts } from "@/dal/ledger-account/queries";
import { NewJournalEntryClient } from "./new-journal-entry-client";

interface PageProps {
  params: Promise<{ companyId: string }>;
}

export default async function NewJournalEntryPage({ params }: PageProps) {
  const { companyId } = await params;
  const ctx = await requireTenantContext();

  if (!ctx.ok) {
    throw new Error(ctx.error.message);
  }

  const accounts = await withTenantTransaction(companyId, async (tx) => {
    return getAllActiveLedgerAccounts(tx, companyId);
  });

  return (
    <NewJournalEntryClient companyId={companyId} accounts={accounts} />
  );
}
