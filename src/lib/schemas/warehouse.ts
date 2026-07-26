import { z } from "zod";

export const warehouseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Warehouse name is required"),
  address: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
  active: z.boolean(),
});

export type WarehouseInput = z.infer<typeof warehouseSchema>;
