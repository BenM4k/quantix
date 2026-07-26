"use server";

import { requireTenantContext } from "@/lib/require-tenant-context";
import {
  voidInvoiceService,
  createInvoiceService,
  CreateInvoiceInput,
} from "@/services/sales/invoice.service";
import { recordPaymentService, RecordPaymentInput } from "@/services/sales/payment.service";

export async function createInvoiceAction(companyId: string, input: CreateInvoiceInput) {
  const ctx = await requireTenantContext();
  if (!ctx.ok) return { ok: false, error: ctx.error.message };

  const res = await createInvoiceService(companyId, input, ctx.value.userId, ctx.value.role);
  if (!res.ok) return { ok: false, error: res.error.message };

  return { ok: true, data: res.value };
}

export async function voidInvoiceAction(companyId: string, invoiceId: string, reason: string) {
  const ctx = await requireTenantContext();
  if (!ctx.ok) return { ok: false, error: ctx.error.message };

  const res = await voidInvoiceService(companyId, invoiceId, reason, ctx.value.userId, ctx.value.role);
  if (!res.ok) return { ok: false, error: res.error.message };

  return { ok: true, data: res.value };
}

export async function recordPaymentAction(
  companyId: string,
  invoiceId: string,
  input: RecordPaymentInput,
) {
  const ctx = await requireTenantContext();
  if (!ctx.ok) return { ok: false, error: ctx.error.message };

  const res = await recordPaymentService(companyId, invoiceId, input, ctx.value.userId, ctx.value.role);
  if (!res.ok) return { ok: false, error: res.error.message };

  return { ok: true, data: res.value };
}
