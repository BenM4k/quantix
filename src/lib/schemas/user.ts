import { z } from "zod";

export const inviteUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["owner", "admin", "accountant", "staff"], {
    message: "Invalid role selected",
  }),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;

export const updateUserRoleSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  role: z.enum(["owner", "admin", "accountant", "staff"]),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

export const updateUserProfileSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  name: z.string().min(1, "Name is required"),
  imageUrl: z.string().nullable().optional(),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
