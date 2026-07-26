import { requireTenantContext } from "@/lib/require-tenant-context";
import { withTenantTransaction } from "@/lib/tenant-context";
import {
  getJournalEntryList,
  getJournalEntryWithLinesById,
} from "@/dal/journal-entry/queries";
import { JournalEntriesClient } from "./journal-entries-client";

interface PageProps {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{
    search?: string;
    fiscalPeriodId?: string;
    sourceType?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
    selected?: string;
  }>;
}

export default async function JournalEntriesPage({
  params,
  searchParams,
}: PageProps) {
  const { companyId } = await params;
  const sParams = await searchParams;
  const ctx = await requireTenantContext();

  if (!ctx.ok) {
    throw new Error(ctx.error.message);
  }

  const page = sParams.page ? parseInt(sParams.page, 10) : 1;

  const { entries, total } = await withTenantTransaction(
    companyId,
    async (tx) => {
      return getJournalEntryList(tx, companyId, {
        search: sParams.search,
        fiscalPeriodId: sParams.fiscalPeriodId,
        sourceType: sParams.sourceType,
        startDate: sParams.startDate,
        endDate: sParams.endDate,
        page,
        limit: 50,
      });
    },
  );

  let selectedEntryDetail = null;
  if (sParams.selected) {
    selectedEntryDetail = await withTenantTransaction(
      companyId,
      async (tx) => {
        return getJournalEntryWithLinesById(tx, companyId, sParams.selected!);
      },
    );
  }

  return (
    <JournalEntriesClient
      companyId={companyId}
      entries={entries}
      totalEntries={total}
      selectedEntryDetail={selectedEntryDetail}
      userRole={ctx.value.role}
    />
  );
}
