import { z } from "zod";

export const productSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Product name is required"),
  uom: z.string().min(1, "Unit of measure is required"),
  sellPrice: z.number().min(0, "Sell price must be >= 0"),
  costPrice: z.number().min(0, "Cost price must be >= 0"),
  taxRateId: z.string().nullable().optional(),
  reorderThreshold: z.number().min(0).nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  active: z.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;
