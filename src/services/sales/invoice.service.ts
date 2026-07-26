import "server-only";

import { withTenantTransaction } from "@/lib/tenant-context";
import { canX } from "@/lib/permissions";
import { Err, Ok, type Result } from "@/lib/server-utils";
import { getNextSequenceNumber } from "@/dal/numbering-sequence/mutations";
import { getActiveCustomerById } from "@/dal/customer/queries";
import { getProductById } from "@/dal/product/queries";
import { getOrderWithLinesById } from "@/dal/sales-order/queries";
import { updateOrderStatus } from "@/dal/sales-order/mutations";
import {
  getPaginatedInvoices,
  getInvoiceDetailById,
  getTaxRateById,
  getLedgerAccountByCode,
  type InvoiceDetailWithLines,
  type InvoiceWithCustomerAndPaid,
} from "@/dal/invoices/queries";
import {
  insertInvoice,
  insertInvoiceLines,
  updateInvoice,
  updateInvoiceJournalEntry,
} from "@/dal/invoices/mutations";
import { lockProductStockSummary, getProductStockSummary } from "@/dal/stock/queries";
import { getCompanyWarehouse } from "@/dal/warehouse/queries";
import { createJournalEntryCore, reverseJournalEntryCore } from "@/services/accounting/journal-entry.service";
import { recordMovementCore } from "@/services/inventory/stock-ledger.service";
import { Invoice } from "@/services/drizzle/schemas";
import { SalesServiceError } from "./quote.service";
import { inngest } from "@/lib/inngest";

export interface InvoiceLineInput {
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRateId?: string | null;
}

export interface CreateInvoiceInput {
  customerId: string;
  issueDate: string;
  dueDate: string;
  sourceOrderId?: string | null;
  notes?: string | null;
  lines: InvoiceLineInput[];
}

export async function createInvoiceService(
  companyId: string,
  input: CreateInvoiceInput,
  userId: string,
  userRole?: string,
): Promise<Result<InvoiceDetailWithLines, SalesServiceError>> {
  if (userRole && !canX(userRole, { id: companyId }, "invoice:create")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to create invoices." });
  }

  let createdInvoiceId: string | null = null;

  try {
    const result = await withTenantTransaction(companyId, async (tx) => {
      // 1. Validate customer
      const cust = await getActiveCustomerById(tx, companyId, input.customerId);
      if (!cust) {
        return Err({ code: "NOT_FOUND" as const, message: "Customer not found or inactive." });
      }

      // 2. If sourceOrderId given, validate order status === "confirmed"
      let orderLinesToCopy = input.lines;
      if (input.sourceOrderId) {
        const order = await getOrderWithLinesById(tx, companyId, input.sourceOrderId);
        if (!order) {
          return Err({ code: "NOT_FOUND" as const, message: "Source sales order not found." });
        }
        if (order.status !== "confirmed") {
          return Err({
            code: "INVALID_STATUS" as const,
            message: `Source order must be in "confirmed" status to convert. Current: "${order.status}".`,
          });
        }
        // Use order lines if input lines empty
        if (!orderLinesToCopy || orderLinesToCopy.length === 0) {
          orderLinesToCopy = order.lines.map((l) => ({
            productId: l.productId,
            description: l.description,
            quantity: Number(l.quantity),
            unitPrice: Number(l.unitPrice),
            taxRateId: l.taxRateId,
          }));
        }
      }

      if (!orderLinesToCopy || orderLinesToCopy.length === 0) {
        return Err({ code: "INVALID_INPUT" as const, message: "Invoice must contain at least one line item." });
      }

      // 3. Resolve warehouse for stock checks
      const defaultWh = await getCompanyWarehouse(tx, companyId);
      const whId = defaultWh?.id;

      // 3b. Up-front stock availability check across all products
      const stockErrors: string[] = [];
      for (const l of orderLinesToCopy) {
        const prod = await getProductById(tx, companyId, l.productId);
        if (!prod || !prod.active) {
          stockErrors.push(`Product "${l.productId}" not found or inactive.`);
          continue;
        }
        if (whId) {
          const summary = await getProductStockSummary(tx, companyId, l.productId, whId);
          const available = summary ? Number(summary.quantityOnHand) : 0;
          if (l.quantity > available) {
            stockErrors.push(`Product "${prod.name}": requested ${l.quantity}, available ${available}`);
          }
        }
      }

      if (stockErrors.length > 0) {
        return Err({
          code: "INVALID_INPUT" as const,
          message: `Insufficient stock or invalid products:\n${stockErrors.join("\n")}`,
        });
      }

      // 4. Calculate line totals and tax server-side
      let subtotal = 0;
      let taxTotal = 0;
      const processedLines = [];

      for (const [idx, l] of orderLinesToCopy.entries()) {
        const prod = await getProductById(tx, companyId, l.productId);
        let lineTax = 0;

        if (l.taxRateId) {
          const tr = await getTaxRateById(tx, companyId, l.taxRateId);
          if (tr && tr.ratePercent) {
            lineTax = (l.quantity * l.unitPrice * Number(tr.ratePercent)) / 100;
          }
        }

        const lineSub = l.quantity * l.unitPrice;
        const lineTotal = lineSub + lineTax;

        subtotal += lineSub;
        taxTotal += lineTax;

        processedLines.push({
          productId: l.productId,
          description: l.description || prod?.name || "Product",
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          taxRateId: l.taxRateId ?? null,
          taxAmount: lineTax,
          lineTotal,
          lineOrder: idx,
        });
      }

      const total = subtotal + taxTotal;

      // Resolve open fiscal period for issueDate
      const fiscalPeriodId = (await (await import("@/dal/fiscal-period/queries")).getOpenPeriodForDate(tx, companyId, input.issueDate))?.id;
      if (!fiscalPeriodId) {
        return Err({
          code: "INVALID_INPUT" as const,
          message: `No open fiscal period found for issue date ${input.issueDate}.`,
        });
      }

      // 5. Generate invoice number
      const invoiceNumber = await getNextSequenceNumber(tx, companyId, "INVOICE", "INV-");

      // 6. Insert Invoice header + InvoiceLine rows
      const createdInvoice = await insertInvoice(tx, {
        organizationId: companyId,
        customerId: input.customerId,
        fiscalPeriodId,
        invoiceNumber,
        status: "unpaid",
        issueDate: input.issueDate,
        dueDate: input.dueDate,
        subtotal: String(subtotal),
        taxTotal: String(taxTotal),
        total: String(total),
        sourceOrderId: input.sourceOrderId ?? null,
        notes: input.notes ?? null,
        createdBy: userId,
      });

      createdInvoiceId = createdInvoice.id;

      await insertInvoiceLines(
        tx,
        processedLines.map((l) => ({
          organizationId: companyId,
          invoiceId: createdInvoice.id,
          productId: l.productId,
          description: l.description,
          quantity: String(l.quantity),
          unitPrice: String(l.unitPrice),
          taxRateId: l.taxRateId,
          taxAmount: String(l.taxAmount),
          lineTotal: String(l.lineTotal),
          lineOrder: l.lineOrder,
        })),
      );

      // 7. For each line, call recordMovementCore(tx, ..., movementType: "sale")
      // Capture actual weighted-average unitCost returned
      let totalCogs = 0;

      for (const l of processedLines) {
        const movRes = await recordMovementCore(
          tx,
          companyId,
          {
            productId: l.productId,
            warehouseId: whId,
            movementType: "sale",
            quantity: l.quantity,
            sourceType: "invoice",
            sourceId: createdInvoice.id,
            reason: `Invoice ${invoiceNumber}`,
          },
          userId,
        );

        if (!movRes.ok) {
          return Err({
            code: "INVALID_INPUT" as const,
            message: `Stock deduction failed for product ${l.productId}: ${movRes.error.message}`,
          });
        }

        const resolvedUnitCost = Number(movRes.value.unitCost);
        totalCogs += l.quantity * resolvedUnitCost;
      }

      // 8. Resolve GL Accounts for 4-line journal entry:
      // AR (1100), Sales Revenue (4000), Tax Payable (2200), COGS (5000), Inventory (1300)
      const arAcc = await getLedgerAccountByCode(tx, companyId, "1100");
      const revAcc = await getLedgerAccountByCode(tx, companyId, "4000");
      const taxAcc = await getLedgerAccountByCode(tx, companyId, "2200");
      const cogsAcc = await getLedgerAccountByCode(tx, companyId, "5000");
      const invAcc = await getLedgerAccountByCode(tx, companyId, "1300");

      if (!arAcc || !revAcc || !taxAcc || !cogsAcc || !invAcc) {
        return Err({
          code: "INVALID_INPUT" as const,
          message: "Required Chart of Accounts GL codes (1100, 4000, 2200, 5000, 1300) not configured.",
        });
      }

      const jeLines = [];

      // Line 1: Dr Accounts Receivable (total)
      if (total > 0) {
        jeLines.push({ accountId: arAcc.id, debit: total, credit: 0, description: `AR for Invoice ${invoiceNumber}` });
      }
      // Line 2: Cr Sales Revenue (subtotal)
      if (subtotal > 0) {
        jeLines.push({ accountId: revAcc.id, debit: 0, credit: subtotal, description: `Revenue for Invoice ${invoiceNumber}` });
      }
      // Line 3: Cr Tax Payable (taxTotal)
      if (taxTotal > 0) {
        jeLines.push({ accountId: taxAcc.id, debit: 0, credit: taxTotal, description: `Tax for Invoice ${invoiceNumber}` });
      }
      // Line 4: Dr COGS (totalCogs)
      if (totalCogs > 0) {
        jeLines.push({ accountId: cogsAcc.id, debit: totalCogs, credit: 0, description: `COGS for Invoice ${invoiceNumber}` });
      }
      // Line 5: Cr Inventory (totalCogs)
      if (totalCogs > 0) {
        jeLines.push({ accountId: invAcc.id, debit: 0, credit: totalCogs, description: `Inventory reduction for Invoice ${invoiceNumber}` });
      }

      const jeRes = await createJournalEntryCore(
        tx,
        companyId,
        {
          entryDate: input.issueDate,
          description: `Invoice ${invoiceNumber} posting`,
          sourceType: "invoice",
          sourceId: createdInvoice.id,
          lines: jeLines,
        },
        userId,
      );

      if (!jeRes.ok) {
        return Err({
          code: "INVALID_INPUT" as const,
          message: `Journal entry posting failed: ${jeRes.error.message}`,
        });
      }

      // 9. Update invoice row with journalEntryId
      await updateInvoiceJournalEntry(tx, companyId, createdInvoice.id, jeRes.value.id);

      // 10. If sourceOrderId given, set status = "converted"
      if (input.sourceOrderId) {
        await updateOrderStatus(tx, companyId, input.sourceOrderId, "converted");
      }

      const fullDetail = await getInvoiceDetailById(tx, companyId, createdInvoice.id);
      return Ok(fullDetail!);
    });

    // 12. Fire Inngest job AFTER commit (side effect)
    if (result.ok && createdInvoiceId) {
      try {
        await inngest.send({
          name: "invoice/pdf.generate",
          data: { invoiceId: createdInvoiceId, companyId },
        });
      } catch (err) {
        console.error("Failed to send Inngest PDF job:", err);
      }
    }

    return result;
  } catch (cause) {
    return Err({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to create invoice",
    });
  }
}

export async function voidInvoiceService(
  companyId: string,
  invoiceId: string,
  reason: string,
  userId: string,
  userRole?: string,
): Promise<Result<Invoice, SalesServiceError>> {
  if (userRole && !canX(userRole, { id: companyId }, "invoice:void")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to void invoices." });
  }

  if (!reason || reason.trim() === "") {
    return Err({ code: "INVALID_INPUT", message: "A reason is required to void an invoice." });
  }

  try {
    return await withTenantTransaction(companyId, async (tx) => {
      const invDetail = await getInvoiceDetailById(tx, companyId, invoiceId);
      if (!invDetail) {
        return Err({ code: "NOT_FOUND", message: "Invoice not found." });
      }

      if (invDetail.status === "void") {
        return Err({ code: "INVALID_STATUS", message: "Invoice is already void." });
      }

      // 2. Reverse Journal Entry if present
      if (invDetail.journalEntryId) {
        const revJeRes = await reverseJournalEntryCore(tx, companyId, invDetail.journalEntryId, reason, userId);
        if (!revJeRes.ok) {
          return Err({
            code: "INVALID_INPUT",
            message: `Failed to reverse journal entry: ${revJeRes.error.message}`,
          });
        }
      }

      // 3. Stock reversal (sale_reversal) for each line
      const defaultWh = await getCompanyWarehouse(tx, companyId);
      for (const l of invDetail.lines) {
        const stockRes = await recordMovementCore(
          tx,
          companyId,
          {
            productId: l.productId,
            warehouseId: defaultWh?.id,
            movementType: "sale_reversal",
            quantity: Number(l.quantity),
            unitCost: Number(l.unitPrice), // sale_reversal takes unitCost
            sourceType: "invoice",
            sourceId: invoiceId,
            reason: `Void Invoice ${invDetail.invoiceNumber}: ${reason}`,
          },
          userId,
        );

        if (!stockRes.ok) {
          return Err({
            code: "INVALID_INPUT",
            message: `Failed to restore stock for product ${l.productId}: ${stockRes.error.message}`,
          });
        }
      }

      // 4. Update status = "void"
      const updated = await updateInvoice(tx, companyId, invoiceId, { status: "void" });
      return Ok(updated!);
    });
  } catch (cause) {
    return Err({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to void invoice",
    });
  }
}

export async function getInvoiceListService(
  companyId: string,
  userRole: string,
  params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
  },
): Promise<Result<{ rows: InvoiceWithCustomerAndPaid[]; total: number }, SalesServiceError>> {
  if (!canX(userRole, { id: companyId }, "invoice:view")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to view invoices." });
  }

  try {
    const res = await withTenantTransaction(companyId, (tx) =>
      getPaginatedInvoices(tx, companyId, params),
    );
    return Ok(res);
  } catch (cause) {
    return Err({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to fetch invoices",
    });
  }
}

export async function getInvoiceDetailService(
  companyId: string,
  userRole: string,
  id: string,
): Promise<Result<InvoiceDetailWithLines, SalesServiceError>> {
  if (!canX(userRole, { id: companyId }, "invoice:view")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to view invoice detail." });
  }

  try {
    const res = await withTenantTransaction(companyId, (tx) =>
      getInvoiceDetailById(tx, companyId, id),
    );
    if (!res) {
      return Err({ code: "NOT_FOUND", message: "Invoice not found." });
    }
    return Ok(res);
  } catch (cause) {
    return Err({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to fetch invoice detail",
    });
  }
}
