import { requireTenantContext } from "@/lib/require-tenant-context";
import { getOrderListService } from "@/services/sales/sales-order.service";
import { fetchOrderKpis } from "@/services/module-kpis/module-kpis.service";
import { OrdersClient } from "./orders-client";

import { CategorySubNav } from "@/components/navigation/category-sub-nav";

interface PageProps {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

export default async function OrdersPage({ params, searchParams }: PageProps) {
  const { companyId } = await params;
  const sParams = await searchParams;
  const ctx = await requireTenantContext();
  if (!ctx.ok) throw new Error(ctx.error.message);

  const page = sParams.page ? parseInt(sParams.page, 10) : 1;

  const [res, kpis] = await Promise.all([
    getOrderListService(companyId, ctx.value.role, { search: sParams.search, status: sParams.status, page, limit: 50 }),
    fetchOrderKpis(ctx.value.organizationId),
  ]);

  return (
    <OrdersClient
      companyId={companyId}
      orders={res.ok ? res.value.rows : []}
      totalOrders={res.ok ? res.value.total : 0}
      userRole={ctx.value.role}
      kpis={kpis}
    />
  );
}
