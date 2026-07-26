import { requireTenantContext } from "@/lib/require-tenant-context";
import { withTenantTransaction } from "@/lib/tenant-context";
import { getPaginatedCustomers } from "@/dal/customer/queries";
import { getPaginatedProducts } from "@/dal/product/queries";
import { getCompanyTaxRates } from "@/dal/company-profile/queries";
import { NewOrderClient } from "./new-order-client";

interface PageProps {
  params: Promise<{ companyId: string }>;
}

export default async function NewOrderPage({ params }: PageProps) {
  const { companyId } = await params;
  const ctx = await requireTenantContext();
  if (!ctx.ok) throw new Error(ctx.error.message);

  const { customers, products, taxRates } = await withTenantTransaction(companyId, async (tx) => {
    const custRes = await getPaginatedCustomers(tx, companyId, { page: 1, pageSize: 200 });
    const prodRes = await getPaginatedProducts(tx, companyId, { page: 1, pageSize: 200 });
    const trRes = await getCompanyTaxRates(tx, companyId);
    return {
      customers: custRes.rows,
      products: prodRes.rows,
      taxRates: trRes,
    };
  });

  return (
    <NewOrderClient
      companyId={companyId}
      customers={customers}
      products={products}
      taxRates={taxRates}
    />
  );
}
