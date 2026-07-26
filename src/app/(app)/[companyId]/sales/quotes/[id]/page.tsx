import { notFound } from "next/navigation";
import { requireTenantContext } from "@/lib/require-tenant-context";
import { withTenantTransaction } from "@/lib/tenant-context";
import { getQuoteDetailService } from "@/services/sales/quote.service";
import { getPaginatedCustomers } from "@/dal/customer/queries";
import { getPaginatedProducts } from "@/dal/product/queries";
import { getCompanyTaxRates } from "@/dal/company-profile/queries";
import { EditQuoteClient } from "./edit-quote-client";

interface PageProps {
  params: Promise<{ companyId: string; id: string }>;
}

export default async function EditQuotePage({ params }: PageProps) {
  const { companyId, id } = await params;
  const ctx = await requireTenantContext();
  if (!ctx.ok) throw new Error(ctx.error.message);

  const res = await getQuoteDetailService(companyId, ctx.value.role, id);
  if (!res.ok) notFound();

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
    <EditQuoteClient
      companyId={companyId}
      quote={res.value}
      customers={customers}
      products={products}
      taxRates={taxRates}
      userRole={ctx.value.role}
    />
  );
}
