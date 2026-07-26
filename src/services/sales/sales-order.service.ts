import "server-only";

import { withTenantTransaction } from "@/lib/tenant-context";
import { canX } from "@/lib/permissions";
import { Err, Ok, type Result } from "@/lib/server-utils";
import { getNextSequenceNumber } from "@/dal/numbering-sequence/mutations";
import { getActiveCustomerById } from "@/dal/customer/queries";
import { getProductById } from "@/dal/product/queries";
import {
  getPaginatedOrders,
  getOrderWithLinesById,
  type OrderWithCustomer,
  type OrderWithLines,
} from "@/dal/sales-order/queries";
import {
  insertSalesOrder,
  insertSalesOrderLines,
  deleteSalesOrderLines,
  updateSalesOrder,
  updateOrderStatus,
} from "@/dal/sales-order/mutations";
import { SalesOrder, SalesOrderLine } from "@/services/drizzle/schemas";
import { SalesServiceError, QuoteLineInput } from "./quote.service";

export interface CreateOrderInput {
  customerId: string;
  orderDate: string;
  notes?: string | null;
  lines: QuoteLineInput[];
}

export async function createSalesOrderService(
  companyId: string,
  input: CreateOrderInput,
  userId: string,
  userRole?: string,
): Promise<Result<OrderWithLines, SalesServiceError>> {
  if (userRole && !canX(userRole, { id: companyId }, "order:create")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to create sales orders." });
  }

  try {
    return await withTenantTransaction(companyId, async (tx) => {
      const cust = await getActiveCustomerById(tx, companyId, input.customerId);
      if (!cust) {
        return Err({ code: "NOT_FOUND", message: "Customer not found or inactive." });
      }

      if (!input.lines || input.lines.length === 0) {
        return Err({ code: "INVALID_INPUT", message: "Order must have at least one line item." });
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
      const orderNumber = await getNextSequenceNumber(tx, companyId, "SALES_ORDER", "SO-");

      const createdOrder = await insertSalesOrder(tx, {
        organizationId: companyId,
        customerId: input.customerId,
        orderNumber,
        orderDate: input.orderDate,
        status: "draft",
        sourceQuoteId: null,
        subtotal: String(subtotal),
        taxTotal: String(taxTotal),
        total: String(total),
        notes: input.notes ?? null,
        createdBy: userId,
      });

      const insertedLines = await insertSalesOrderLines(
        tx,
        processedLines.map((l) => ({ ...l, orderId: createdOrder.id })),
      );

      return Ok({
        ...createdOrder,
        lines: insertedLines,
        customerName: cust.name,
        customerEmail: cust.email ?? null,
        sourceQuoteNumber: null,
      });
    });
  } catch (cause) {
    return Err({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to create sales order",
    });
  }
}

export async function updateSalesOrderService(
  companyId: string,
  orderId: string,
  input: CreateOrderInput,
  userId: string,
  userRole?: string,
): Promise<Result<OrderWithLines, SalesServiceError>> {
  if (userRole && !canX(userRole, { id: companyId }, "order:edit")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to edit sales orders." });
  }

  try {
    return await withTenantTransaction(companyId, async (tx) => {
      const existing = await getOrderWithLinesById(tx, companyId, orderId);
      if (!existing) {
        return Err({ code: "NOT_FOUND", message: "Sales order not found." });
      }

      if (existing.status !== "draft" && existing.status !== "confirmed") {
        return Err({
          code: "INVALID_STATUS",
          message: `Cannot edit order in "${existing.status}" status.`,
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
          orderId,
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

      await updateSalesOrder(tx, companyId, orderId, {
        customerId: input.customerId,
        orderDate: input.orderDate,
        subtotal: String(subtotal),
        taxTotal: String(taxTotal),
        total: String(total),
        notes: input.notes ?? null,
      });

      await deleteSalesOrderLines(tx, companyId, orderId);
      await insertSalesOrderLines(tx, processedLines);

      const updated = await getOrderWithLinesById(tx, companyId, orderId);
      return Ok(updated!);
    });
  } catch (cause) {
    return Err({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to update sales order",
    });
  }
}

export async function updateOrderStatusService(
  companyId: string,
  orderId: string,
  status: SalesOrder["status"],
  userId: string,
  userRole?: string,
): Promise<Result<SalesOrder, SalesServiceError>> {
  if (userRole && !canX(userRole, { id: companyId }, "order:edit")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to update sales order status." });
  }

  try {
    return await withTenantTransaction(companyId, async (tx) => {
      const existing = await getOrderWithLinesById(tx, companyId, orderId);
      if (!existing) {
        return Err({ code: "NOT_FOUND", message: "Sales order not found." });
      }

      const updated = await updateOrderStatus(tx, companyId, orderId, status);
      return Ok(updated!);
    });
  } catch (cause) {
    return Err({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to update sales order status",
    });
  }
}

export async function getOrderListService(
  companyId: string,
  userRole: string,
  params: { page?: number; limit?: number; search?: string; status?: string },
): Promise<Result<{ rows: OrderWithCustomer[]; total: number }, SalesServiceError>> {
  if (!canX(userRole, { id: companyId }, "order:view")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to view sales orders." });
  }

  try {
    const res = await withTenantTransaction(companyId, (tx) =>
      getPaginatedOrders(tx, companyId, params),
    );
    return Ok(res);
  } catch (cause) {
    return Err({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to fetch sales orders",
    });
  }
}

export async function getOrderDetailService(
  companyId: string,
  userRole: string,
  id: string,
): Promise<Result<OrderWithLines, SalesServiceError>> {
  if (!canX(userRole, { id: companyId }, "order:view")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to view sales order detail." });
  }

  try {
    const res = await withTenantTransaction(companyId, (tx) =>
      getOrderWithLinesById(tx, companyId, id),
    );
    if (!res) {
      return Err({ code: "NOT_FOUND", message: "Sales order not found." });
    }
    return Ok(res);
  } catch (cause) {
    return Err({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to fetch sales order detail",
    });
  }
}
