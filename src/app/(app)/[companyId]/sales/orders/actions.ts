"use server";

import { requireTenantContext } from "@/lib/require-tenant-context";
import {
  createSalesOrderService,
  updateSalesOrderService,
  updateOrderStatusService,
  CreateOrderInput,
} from "@/services/sales/sales-order.service";
import { createInvoiceService } from "@/services/sales/invoice.service";
import { OrderStatus } from "@/services/drizzle/schemas";

export async function createSalesOrderAction(companyId: string, input: CreateOrderInput) {
  const ctx = await requireTenantContext();
  if (!ctx.ok) return { ok: false, error: ctx.error.message };

  const res = await createSalesOrderService(companyId, input, ctx.value.userId, ctx.value.role);
  if (!res.ok) return { ok: false, error: res.error.message };

  return { ok: true, data: res.value };
}

export async function updateSalesOrderAction(
  companyId: string,
  orderId: string,
  input: CreateOrderInput,
) {
  const ctx = await requireTenantContext();
  if (!ctx.ok) return { ok: false, error: ctx.error.message };

  const res = await updateSalesOrderService(companyId, orderId, input, ctx.value.userId, ctx.value.role);
  if (!res.ok) return { ok: false, error: res.error.message };

  return { ok: true, data: res.value };
}

export async function updateOrderStatusAction(
  companyId: string,
  orderId: string,
  status: OrderStatus,
) {
  const ctx = await requireTenantContext();
  if (!ctx.ok) return { ok: false, error: ctx.error.message };

  const res = await updateOrderStatusService(companyId, orderId, status, ctx.value.userId, ctx.value.role);
  if (!res.ok) return { ok: false, error: res.error.message };

  return { ok: true, data: res.value };
}

export async function convertOrderToInvoiceAction(companyId: string, orderId: string) {
  const ctx = await requireTenantContext();
  if (!ctx.ok) return { ok: false, error: ctx.error.message };

  const todayStr = new Date().toISOString().split("T")[0];
  const dueDateStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const res = await createInvoiceService(
    companyId,
    {
      customerId: "", // Resolved inside createInvoiceService when sourceOrderId is present
      issueDate: todayStr,
      dueDate: dueDateStr,
      sourceOrderId: orderId,
      lines: [],
    },
    ctx.value.userId,
    ctx.value.role,
  );

  if (!res.ok) return { ok: false, error: res.error.message };

  return { ok: true, data: res.value };
}
