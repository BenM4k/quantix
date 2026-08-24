import { requireTenantContext } from "@/lib/require-tenant-context";
import { getInvoiceListService, getInvoiceDetailService } from "@/services/sales/invoice.service";
import { fetchInvoiceKpis } from "@/services/module-kpis/module-kpis.service";
import { InvoicesClient } from "./invoices-client";

import { CategorySubNav } from "@/components/navigation/category-sub-nav";

interface PageProps {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
    selected?: string;
  }>;
}

export default async function InvoicesPage({ params, searchParams }: PageProps) {
  const { companyId } = await params;
  const sParams = await searchParams;
  const ctx = await requireTenantContext();

  if (!ctx.ok) throw new Error(ctx.error.message);

  const page = sParams.page ? parseInt(sParams.page, 10) : 1;

  const [res, kpis] = await Promise.all([
    getInvoiceListService(companyId, ctx.value.role, {
      search: sParams.search,
      status: sParams.status,
      page,
      limit: 50,
    }),
    fetchInvoiceKpis(ctx.value.organizationId),
  ]);

  const invoices = res.ok ? res.value.rows : [];
  const total    = res.ok ? res.value.total : 0;

  let selectedDetail = null;
  if (sParams.selected) {
    const detailRes = await getInvoiceDetailService(companyId, ctx.value.role, sParams.selected);
    if (detailRes.ok) selectedDetail = detailRes.value;
  }

  return (
    <InvoicesClient
      companyId={companyId}
      invoices={invoices}
      totalInvoices={total}
      selectedInvoiceDetail={selectedDetail}
      userRole={ctx.value.role}
      kpis={kpis}
    />
  );
}
