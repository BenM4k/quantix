import "server-only";

import { withTenantTransaction } from "@/lib/tenant-context";
import { canX } from "@/lib/permissions";
import { Err, Ok, type Result } from "@/lib/server-utils";
import {
  getInvoiceDetailById,
  getLedgerAccountByCode,
  getPrimaryBankAccount,
} from "@/dal/invoices/queries";
import {
  insertPayment,
  getInvoicePaymentTotal,
  updateInvoice,
} from "@/dal/invoices/mutations";
import { createJournalEntryCore } from "@/services/accounting/journal-entry.service";
import { Payment } from "@/services/drizzle/schemas";
import { SalesServiceError } from "./quote.service";

export interface RecordPaymentInput {
  amount: number;
  paidAt?: string;
  method: "cash" | "bank_transfer" | "card" | "other";
}

export async function recordPaymentService(
  companyId: string,
  invoiceId: string,
  input: RecordPaymentInput,
  userId: string,
  userRole?: string,
): Promise<Result<Payment, SalesServiceError>> {
  if (userRole && !canX(userRole, { id: companyId }, "payment:record")) {
    return Err({ code: "FORBIDDEN", message: "Permission denied to record payments." });
  }

  if (input.amount <= 0) {
    return Err({ code: "INVALID_INPUT", message: "Payment amount must be greater than zero." });
  }

  try {
    return await withTenantTransaction(companyId, async (tx) => {
      // 1. Validate invoice belongs to company and is not void
      const inv = await getInvoiceDetailById(tx, companyId, invoiceId);
      if (!inv) {
        return Err({ code: "NOT_FOUND", message: "Invoice not found." });
      }

      if (inv.status === "void") {
        return Err({ code: "INVALID_STATUS", message: "Cannot record payment on a void invoice." });
      }

      const todayStr = input.paidAt || new Date().toISOString().split("T")[0];

      // 2. Resolve Cash/Bank Account and Accounts Receivable (1100) Account
      const bankAcc = await getPrimaryBankAccount(tx, companyId);
      const arAcc = await getLedgerAccountByCode(tx, companyId, "1100");

      if (!bankAcc || !arAcc) {
        return Err({
          code: "INVALID_INPUT",
          message: "Bank Account or Accounts Receivable GL account (1100) not found.",
        });
      }

      // 3. Post Journal Entry: Dr Cash/Bank / Cr Accounts Receivable
      const jeRes = await createJournalEntryCore(
        tx,
        companyId,
        {
          entryDate: todayStr,
          description: `Payment for Invoice ${inv.invoiceNumber} (${input.method})`,
          sourceType: "payment",
          sourceId: invoiceId,
          lines: [
            {
              accountId: bankAcc.id,
              debit: input.amount,
              credit: 0,
              description: `Cash received for Invoice ${inv.invoiceNumber}`,
            },
            {
              accountId: arAcc.id,
              debit: 0,
              credit: input.amount,
              description: `AR reduction for Invoice ${inv.invoiceNumber}`,
            },
          ],
        },
        userId,
      );

      if (!jeRes.ok) {
        return Err({
          code: "INVALID_INPUT",
          message: `Journal entry posting failed: ${jeRes.error.message}`,
        });
      }

      // 4. Insert Payment record
      const pmt = await insertPayment(tx, {
        organizationId: companyId,
        invoiceId,
        amount: String(input.amount),
        method: input.method,
        journalEntryId: jeRes.value.id,
        createdBy: userId,
      });

      // 5. Recompute invoice status
      const totalPaid = await getInvoicePaymentTotal(tx, companyId, invoiceId);
      const invTotal = Number(inv.total);

      let newStatus: "unpaid" | "partial" | "paid" = "unpaid";
      if (totalPaid >= invTotal) {
        newStatus = "paid";
      } else if (totalPaid > 0) {
        newStatus = "partial";
      }

      await updateInvoice(tx, companyId, invoiceId, { status: newStatus });

      return Ok(pmt);
    });
  } catch (cause) {
    return Err({
      code: "DB_ERROR",
      message: cause instanceof Error ? cause.message : "Failed to record payment",
    });
  }
}
