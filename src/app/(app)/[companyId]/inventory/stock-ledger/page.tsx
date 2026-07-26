import "server-only";

import { redirect } from "next/navigation";
import { requireTenantContext } from "@/lib/require-tenant-context";
import { getStockLedgerEntriesService } from "@/services/inventory/stock-ledger.service";
import { getPaginatedProducts } from "@/dal/product/queries";
import { withTenantTransaction } from "@/lib/tenant-context";
import { StockLedgerClient } from "./stock-ledger-client";

interface StockLedgerPageProps {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    productId?: string;
    movementType?: string;
    search?: string;
  }>;
}

export default async function StockLedgerPage({
  params,
  searchParams,
}: StockLedgerPageProps) {
  const { companyId } = await params;
  const sParams = await searchParams;

  const ctx = await requireTenantContext();
  if (!ctx.ok) {
    redirect("/sign-in");
  }

  const page = sParams.page ? parseInt(sParams.page, 10) : 1;
  const pageSize = sParams.pageSize ? parseInt(sParams.pageSize, 10) : 20;

  const ledgerResult = await getStockLedgerEntriesService(
    ctx.value.organizationId,
    ctx.value.role,
    {
      page,
      pageSize,
      productId: sParams.productId,
      movementType: sParams.movementType,
      search: sParams.search,
    },
  );

  const productsRes = await withTenantTransaction(
    ctx.value.organizationId,
    (tx) => getPaginatedProducts(tx, ctx.value.organizationId, { page: 1, pageSize: 200 }),
  );

  const entries = ledgerResult.ok ? ledgerResult.value.rows : [];
  const totalEntries = ledgerResult.ok ? ledgerResult.value.total : 0;

  return (
    <StockLedgerClient
      companyId={companyId}
      entries={entries}
      totalEntries={totalEntries}
      products={productsRes.rows}
      userRole={ctx.value.role}
    />
  );
}
