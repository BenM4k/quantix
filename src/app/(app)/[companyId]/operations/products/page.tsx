import React from "react";
import { getAuthContext } from "@/lib/auth-context";
import { getProductsService } from "@/services/inventory/product.service";
import { withTenantTransaction } from "@/lib/tenant-context";
import { getBatchProductStockSummaries } from "@/dal/stock/queries";
import { ProductsOperationsClient } from "./components/products-operations-client";

export default async function ProductMasterPage({
  params,
  searchParams,
}: {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { companyId } = await params;
  const resolvedSearchParams = await searchParams;

  const { company, role } = await getAuthContext();

  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = Number(resolvedSearchParams.pageSize) || 20;
  const search =
    typeof resolvedSearchParams.search === "string"
      ? resolvedSearchParams.search
      : undefined;
  const sort =
    typeof resolvedSearchParams.sort === "string"
      ? resolvedSearchParams.sort
      : undefined;
  const taxRateId =
    typeof resolvedSearchParams.taxRateId === "string"
      ? resolvedSearchParams.taxRateId
      : undefined;

  const productsRes = await getProductsService(company.id, role, {
    page,
    pageSize,
    search,
    sort,
    taxRateId,
  });

  const products = productsRes.ok ? productsRes.value.rows : [];
  const totalProducts = productsRes.ok ? productsRes.value.total : 0;

  const productIds = products.map((p) => p.id);
  const stockSummariesMap = await withTenantTransaction(company.id, (tx) =>
    getBatchProductStockSummaries(tx, company.id, productIds),
  );

  const stockSummaries: Record<
    string,
    { quantityOnHand: string; averageCost: string }
  > = {};
  for (const pid of productIds) {
    if (stockSummariesMap[pid]) {
      stockSummaries[pid] = {
        quantityOnHand: stockSummariesMap[pid].quantityOnHand,
        averageCost: stockSummariesMap[pid].averageCost,
      };
    }
  }

  return (
    <ProductsOperationsClient
      companyId={companyId}
      products={products}
      totalProducts={totalProducts}
      stockSummaries={stockSummaries}
      userRole={role}
    />
  );
}
