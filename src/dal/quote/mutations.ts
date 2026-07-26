import "server-only";

import { eq, and } from "drizzle-orm";
import type { Tx } from "@/services/drizzle";
import {
  quote,
  quoteLine,
  type NewQuote,
  type NewQuoteLine,
  type Quote,
  type QuoteLine,
} from "@/services/drizzle/schemas";

export async function insertQuote(
  tx: Tx,
  data: Omit<NewQuote, "id" | "createdAt" | "updatedAt">,
): Promise<Quote> {
  const [created] = await tx.insert(quote).values(data).returning();
  return created;
}

export async function insertQuoteLines(
  tx: Tx,
  lines: Omit<NewQuoteLine, "id" | "createdAt" | "updatedAt">[],
): Promise<QuoteLine[]> {
  if (lines.length === 0) return [];
  return tx.insert(quoteLine).values(lines).returning();
}

export async function deleteQuoteLines(
  tx: Tx,
  organizationId: string,
  quoteId: string,
): Promise<void> {
  await tx
    .delete(quoteLine)
    .where(and(eq(quoteLine.quoteId, quoteId), eq(quoteLine.organizationId, organizationId)));
}

export async function updateQuote(
  tx: Tx,
  organizationId: string,
  id: string,
  data: Partial<NewQuote>,
): Promise<Quote | null> {
  const [updated] = await tx
    .update(quote)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(quote.id, id), eq(quote.organizationId, organizationId)))
    .returning();
  return updated ?? null;
}

export async function updateQuoteStatus(
  tx: Tx,
  organizationId: string,
  id: string,
  status: Quote["status"],
): Promise<Quote | null> {
  return updateQuote(tx, organizationId, id, { status });
}
