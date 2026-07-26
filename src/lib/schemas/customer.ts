import { z } from "zod";

export const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Invalid email address").or(z.literal("")).optional(),
  phone: z.string().optional(),
  taxId: z.string().optional(),
  paymentTermsDays: z.number().min(0),
  active: z.boolean(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
