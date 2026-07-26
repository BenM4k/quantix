import { z } from "zod";

export const stockAdjustmentFormSchema = z
  .object({
    productId: z.string().min(1, "Product is required"),
    direction: z.enum(["in", "out"]),
    quantity: z.number().positive("Quantity must be greater than 0"),
    unitCost: z.number().min(0, "Unit cost cannot be negative").optional().nullable(),
    reason: z.string().min(1, "Reason is required for stock adjustments"),
  })
  .refine(
    (data) => {
      if (data.direction === "in") {
        return data.unitCost !== undefined && data.unitCost !== null && data.unitCost >= 0;
      }
      return true;
    },
    {
      message: "Unit cost is required for stock-in movements",
      path: ["unitCost"],
    },
  );

export type StockAdjustmentFormInput = z.infer<typeof stockAdjustmentFormSchema>;
