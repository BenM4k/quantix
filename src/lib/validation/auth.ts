import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

/** Client-only schema: includes confirmPassword, stripped before sending to server. */
export const signUpFormSchema = signUpSchema
  .extend({ confirmPassword: z.string() })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export type SignUpFormInput = z.infer<typeof signUpFormSchema>;

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const onboardingSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyType: z.enum(["service", "retail", "manufacturing"], {
    message: "Please select a valid company type",
  }),
  baseCurrency: z
    .string()
    .min(3, "Please enter a valid currency (e.g. USD)")
    .max(3, "Currency code must be exactly 3 characters")
    .toUpperCase(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
