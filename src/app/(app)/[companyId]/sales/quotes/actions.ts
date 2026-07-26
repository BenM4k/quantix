"use server";

import { requireTenantContext } from "@/lib/require-tenant-context";
import {
  createQuoteService,
  updateQuoteService,
  updateQuoteStatusService,
  convertQuoteToOrderService,
  CreateQuoteInput,
} from "@/services/sales/quote.service";
import { QuoteStatus } from "@/services/drizzle/schemas";

export async function createQuoteAction(companyId: string, input: CreateQuoteInput) {
  const ctx = await requireTenantContext();
  if (!ctx.ok) return { ok: false, error: ctx.error.message };

  const res = await createQuoteService(companyId, input, ctx.value.userId, ctx.value.role);
  if (!res.ok) return { ok: false, error: res.error.message };

  return { ok: true, data: res.value };
}

export async function updateQuoteAction(
  companyId: string,
  quoteId: string,
  input: CreateQuoteInput,
) {
  const ctx = await requireTenantContext();
  if (!ctx.ok) return { ok: false, error: ctx.error.message };

  const res = await updateQuoteService(companyId, quoteId, input, ctx.value.userId, ctx.value.role);
  if (!res.ok) return { ok: false, error: res.error.message };

  return { ok: true, data: res.value };
}

export async function updateQuoteStatusAction(
  companyId: string,
  quoteId: string,
  status: QuoteStatus,
) {
  const ctx = await requireTenantContext();
  if (!ctx.ok) return { ok: false, error: ctx.error.message };

  const res = await updateQuoteStatusService(companyId, quoteId, status, ctx.value.userId, ctx.value.role);
  if (!res.ok) return { ok: false, error: res.error.message };

  return { ok: true, data: res.value };
}

export async function convertQuoteToOrderAction(companyId: string, quoteId: string) {
  const ctx = await requireTenantContext();
  if (!ctx.ok) return { ok: false, error: ctx.error.message };

  const res = await convertQuoteToOrderService(companyId, quoteId, ctx.value.userId, ctx.value.role);
  if (!res.ok) return { ok: false, error: res.error.message };

  return { ok: true, data: res.value };
}
