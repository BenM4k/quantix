import "server-only";

import { withTenantTransaction } from "@/lib/tenant-context";
import { canX } from "@/lib/permissions";
import { Err, Ok, type Result } from "@/lib/server-utils";
import { getNextSequenceNumber } from "@/dal/numbering-sequence/mutations";
import { getActiveCustomerById } from "@/dal/customer/queries";
import { getProductById } from "@/dal/product/queries";
import {
  getPaginatedQuotes,
  getQuoteWithLinesById,
  type QuoteWithCustomer,
  type QuoteWithLines,
} from "@/dal/quote/queries";
import {
  insertQuote,
  insertQuoteLines,
  deleteQuoteLines,
  updateQuote,
  updateQuoteStatus,
} from "@/dal/quote/mutations";
import { insertSalesOrder, insertSalesOrderLines } from "@/dal/sales-order/mutations";
import { Quote, QuoteLine, SalesOrder } from "@/services/drizzle/schemas";

export interface QuoteLineInput {
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRateId?: string | null;
  taxAmount?: number;
}

export interface CreateQuoteInput {
  customerId: string;
  quoteDate: string;
  expiryDate?: string | null;
  notes?: string | null;
  lines: QuoteLineInput[];
}

export type SalesServiceError =
  | { code: "FORBIDDEN"; message: string }
  | { code: "NOT_FOUND"; message: string }
  | { code: "INVALID_INPUT"; message: string }
  | { code: "INVALID_STATUS"; message: string }
  | { code: "DB_ERROR"; message: string };

export async function createQuoteService(
  companyId: string,
  input: CreateQuoteInput,
  userId: string,
  userRole?: string,
): Promise<Result<QuoteWithLines, SalesServiceError>> {
  if (userRole && !canX(userRole, { id: companyId }, "quote:create")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to create quotes." });
  }

  try {
    return await withTenantTransaction(companyId, async (tx) => {
      // Validate customer
      const cust = await getActiveCustomerById(tx, companyId, input.customerId);
      if (!cust) {
        return Err({ code: "NOT_FOUND", message: "Customer not found or inactive." });
      }

      if (!input.lines || input.lines.length === 0) {
        return Err({ code: "INVALID_INPUT", message: "Quote must have at least one line item." });
      }

      // Calculate line totals and grand totals
      let subtotal = 0;
      let taxTotal = 0;

      const processedLines = [];
      for (const [idx, l] of input.lines.entries()) {
        const prod = await getProductById(tx, companyId, l.productId);
        if (!prod || !prod.active) {
          return Err({ code: "NOT_FOUND", message: `Product "${l.productId}" not found or inactive.` });
        }

        const lineSub = l.quantity * l.unitPrice;
        const lineTax = l.taxAmount ?? 0;
        const lineTotal = lineSub + lineTax;

        subtotal += lineSub;
        taxTotal += lineTax;

        processedLines.push({
          organizationId: companyId,
          productId: l.productId,
          description: l.description || prod.name,
          quantity: String(l.quantity),
          unitPrice: String(l.unitPrice),
          taxRateId: l.taxRateId ?? null,
          taxAmount: String(lineTax),
          lineTotal: String(lineTotal),
          lineOrder: idx,
        });
      }

      const total = subtotal + taxTotal;
      const quoteNumber = await getNextSequenceNumber(tx, companyId, "QUOTE", "QT-");

      const createdQuote = await insertQuote(tx, {
        organizationId: companyId,
        customerId: input.customerId,
        quoteNumber,
        quoteDate: input.quoteDate,
        expiryDate: input.expiryDate || null,
        status: "draft",
        subtotal: String(subtotal),
        taxTotal: String(taxTotal),
        total: String(total),
        notes: input.notes || null,
        createdBy: userId,
      });

      const insertedLines = await insertQuoteLines(
        tx,
        processedLines.map((l) => ({ ...l, quoteId: createdQuote.id })),
      );

      return Ok({
        ...createdQuote,
        lines: insertedLines,
        customerName: cust.name,
        customerEmail: cust.email ?? null,
      });
    });
  } catch (cause) {
    console.error("[createQuoteService] Database error:", cause);
    return Err({
      code: "DB_ERROR",
      message: "Failed to create sales quote. Please try again or contact support.",
    });
  }
}

export async function updateQuoteService(
  companyId: string,
  quoteId: string,
  input: CreateQuoteInput,
  userId: string,
  userRole?: string,
): Promise<Result<QuoteWithLines, SalesServiceError>> {
  if (userRole && !canX(userRole, { id: companyId }, "quote:edit")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to edit quotes." });
  }

  try {
    return await withTenantTransaction(companyId, async (tx) => {
      const existing = await getQuoteWithLinesById(tx, companyId, quoteId);
      if (!existing) {
        return Err({ code: "NOT_FOUND", message: "Quote not found." });
      }

      if (existing.status !== "draft" && existing.status !== "sent") {
        return Err({
          code: "INVALID_STATUS",
          message: `Cannot edit quote in "${existing.status}" status. Only draft or sent quotes can be edited.`,
        });
      }

      const cust = await getActiveCustomerById(tx, companyId, input.customerId);
      if (!cust) {
        return Err({ code: "NOT_FOUND", message: "Customer not found or inactive." });
      }

      let subtotal = 0;
      let taxTotal = 0;
      const processedLines = [];

      for (const [idx, l] of input.lines.entries()) {
        const prod = await getProductById(tx, companyId, l.productId);
        if (!prod || !prod.active) {
          return Err({ code: "NOT_FOUND", message: `Product "${l.productId}" not found or inactive.` });
        }

        const lineSub = l.quantity * l.unitPrice;
        const lineTax = l.taxAmount ?? 0;
        const lineTotal = lineSub + lineTax;

        subtotal += lineSub;
        taxTotal += lineTax;

        processedLines.push({
          organizationId: companyId,
          quoteId,
          productId: l.productId,
          description: l.description || prod.name,
          quantity: String(l.quantity),
          unitPrice: String(l.unitPrice),
          taxRateId: l.taxRateId ?? null,
          taxAmount: String(lineTax),
          lineTotal: String(lineTotal),
          lineOrder: idx,
        });
      }

      const total = subtotal + taxTotal;

      await updateQuote(tx, companyId, quoteId, {
        customerId: input.customerId,
        quoteDate: input.quoteDate,
        expiryDate: input.expiryDate || null,
        subtotal: String(subtotal),
        taxTotal: String(taxTotal),
        total: String(total),
        notes: input.notes || null,
      });

      await deleteQuoteLines(tx, companyId, quoteId);
      const insertedLines = await insertQuoteLines(tx, processedLines);

      const updated = await getQuoteWithLinesById(tx, companyId, quoteId);
      return Ok(updated!);
    });
  } catch (cause) {
    console.error("[updateQuoteService] Database error:", cause);
    return Err({
      code: "DB_ERROR",
      message: "Failed to update sales quote. Please try again or contact support.",
    });
  }
}

export async function updateQuoteStatusService(
  companyId: string,
  quoteId: string,
  status: Quote["status"],
  userId: string,
  userRole?: string,
): Promise<Result<Quote, SalesServiceError>> {
  if (userRole && !canX(userRole, { id: companyId }, "quote:edit")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to update quote status." });
  }

  try {
    return await withTenantTransaction(companyId, async (tx) => {
      const existing = await getQuoteWithLinesById(tx, companyId, quoteId);
      if (!existing) {
        return Err({ code: "NOT_FOUND", message: "Quote not found." });
      }

      const updated = await updateQuoteStatus(tx, companyId, quoteId, status);
      return Ok(updated!);
    });
  } catch (cause) {
    console.error("[updateQuoteStatusService] Database error:", cause);
    return Err({
      code: "DB_ERROR",
      message: "Failed to update sales quote status. Please try again or contact support.",
    });
  }
}

export async function convertQuoteToOrderService(
  companyId: string,
  quoteId: string,
  userId: string,
  userRole?: string,
): Promise<Result<SalesOrder, SalesServiceError>> {
  if (userRole && !canX(userRole, { id: companyId }, "order:create")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to create sales orders." });
  }

  try {
    return await withTenantTransaction(companyId, async (tx) => {
      const quoteObj = await getQuoteWithLinesById(tx, companyId, quoteId);
      if (!quoteObj) {
        return Err({ code: "NOT_FOUND", message: "Quote not found." });
      }

      if (quoteObj.status !== "accepted") {
        return Err({
          code: "INVALID_STATUS",
          message: `Only accepted quotes can be converted to an order. Current status: "${quoteObj.status}".`,
        });
      }

      const orderNumber = await getNextSequenceNumber(tx, companyId, "SALES_ORDER", "SO-");
      const todayStr = new Date().toISOString().split("T")[0];

      // Copy lines into brand-new SalesOrderLine rows
      const createdOrder = await insertSalesOrder(tx, {
        organizationId: companyId,
        customerId: quoteObj.customerId,
        orderNumber,
        orderDate: todayStr,
        status: "draft",
        sourceQuoteId: quoteObj.id,
        subtotal: quoteObj.subtotal,
        taxTotal: quoteObj.taxTotal,
        total: quoteObj.total,
        notes: quoteObj.notes,
        createdBy: userId,
      });

      const orderLines = quoteObj.lines.map((l) => ({
        organizationId: companyId,
        orderId: createdOrder.id,
        productId: l.productId,
        description: l.description,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        taxRateId: l.taxRateId,
        taxAmount: l.taxAmount,
        lineTotal: l.lineTotal,
        lineOrder: l.lineOrder,
      }));

      await insertSalesOrderLines(tx, orderLines);

      // Update quote status to converted
      await updateQuoteStatus(tx, companyId, quoteId, "converted");

      return Ok(createdOrder);
    });
  } catch (cause) {
    console.error("[convertQuoteToOrderService] Database error:", cause);
    return Err({
      code: "DB_ERROR",
      message: "Failed to convert quote to order. Please try again or contact support.",
    });
  }
}

export async function getQuoteListService(
  companyId: string,
  userRole: string,
  params: { page?: number; limit?: number; search?: string; status?: string },
): Promise<Result<{ rows: QuoteWithCustomer[]; total: number }, SalesServiceError>> {
  if (!canX(userRole, { id: companyId }, "quote:view")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to view quotes." });
  }

  try {
    const res = await withTenantTransaction(companyId, (tx) =>
      getPaginatedQuotes(tx, companyId, params),
    );
    return Ok(res);
  } catch (cause) {
    console.error("[getQuoteListService] Database error:", cause);
    return Err({
      code: "DB_ERROR",
      message: "Failed to fetch quotes. Please try again or contact support.",
    });
  }
}

export async function getQuoteDetailService(
  companyId: string,
  userRole: string,
  id: string,
): Promise<Result<QuoteWithLines, SalesServiceError>> {
  if (!canX(userRole, { id: companyId }, "quote:view")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to view quote detail." });
  }

  try {
    const res = await withTenantTransaction(companyId, (tx) =>
      getQuoteWithLinesById(tx, companyId, id),
    );
    if (!res) {
      return Err({ code: "NOT_FOUND", message: "Quote not found." });
    }
    return Ok(res);
  } catch (cause) {
    console.error("[getQuoteDetailService] Database error:", cause);
    return Err({
      code: "DB_ERROR",
      message: "Failed to fetch quote details. Please try again or contact support.",
    });
  }
}
