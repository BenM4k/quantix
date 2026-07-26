import { requireTenantContext } from "@/lib/require-tenant-context";
import { getQuoteListService } from "@/services/sales/quote.service";
import { QuotesClient } from "./quotes-client";

interface PageProps {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function QuotesPage({ params, searchParams }: PageProps) {
  const { companyId } = await params;
  const sParams = await searchParams;
  const ctx = await requireTenantContext();

  if (!ctx.ok) {
    throw new Error(ctx.error.message);
  }

  const page = sParams.page ? parseInt(sParams.page, 10) : 1;

  const res = await getQuoteListService(companyId, ctx.value.role, {
    search: sParams.search,
    status: sParams.status,
    page,
    limit: 50,
  });

  const quotes = res.ok ? res.value.rows : [];
  const total = res.ok ? res.value.total : 0;

  return (
    <QuotesClient
      companyId={companyId}
      quotes={quotes}
      totalQuotes={total}
      userRole={ctx.value.role}
    />
  );
}
