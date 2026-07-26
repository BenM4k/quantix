import { z } from "zod";

export const quoteLineInputSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.0001, "Quantity must be greater than 0"),
  unitPrice: z.number().min(0, "Unit price cannot be negative"),
  taxRateId: z.string().nullable().optional(),
  taxAmount: z.number().min(0).optional(),
});

export const createQuoteSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  quoteDate: z.string().min(1, "Quote date is required"),
  expiryDate: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  lines: z.array(quoteLineInputSchema).min(1, "At least one line item is required"),
});

export const createSalesOrderSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  orderDate: z.string().min(1, "Order date is required"),
  notes: z.string().nullable().optional(),
  lines: z.array(quoteLineInputSchema).min(1, "At least one line item is required"),
});

export const createInvoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  sourceOrderId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  lines: z.array(quoteLineInputSchema).min(1, "At least one line item is required"),
});

export const recordPaymentSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paidAt: z.string().optional(),
  method: z.enum(["cash", "bank_transfer", "card", "other"]),
});

export type QuoteLineInputSchema = z.infer<typeof quoteLineInputSchema>;
export type CreateQuoteInputSchema = z.infer<typeof createQuoteSchema>;
export type CreateSalesOrderInputSchema = z.infer<typeof createSalesOrderSchema>;
export type CreateInvoiceInputSchema = z.infer<typeof createInvoiceSchema>;
export type RecordPaymentInputSchema = z.infer<typeof recordPaymentSchema>;
