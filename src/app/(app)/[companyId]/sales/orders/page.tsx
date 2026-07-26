import { requireTenantContext } from "@/lib/require-tenant-context";
import { getOrderListService } from "@/services/sales/sales-order.service";
import { OrdersClient } from "./orders-client";

interface PageProps {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function OrdersPage({ params, searchParams }: PageProps) {
  const { companyId } = await params;
  const sParams = await searchParams;
  const ctx = await requireTenantContext();

  if (!ctx.ok) throw new Error(ctx.error.message);

  const page = sParams.page ? parseInt(sParams.page, 10) : 1;

  const res = await getOrderListService(companyId, ctx.value.role, {
    search: sParams.search,
    status: sParams.status,
    page,
    limit: 50,
  });

  const orders = res.ok ? res.value.rows : [];
  const total = res.ok ? res.value.total : 0;

  return (
    <OrdersClient
      companyId={companyId}
      orders={orders}
      totalOrders={total}
      userRole={ctx.value.role}
    />
  );
}
