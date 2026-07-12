import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization, admin } from "better-auth/plugins";
import { db } from "../drizzle";
import { Resend } from "resend";
import {
  accountant,
  owner,
  staff,
  ac,
  admin as adminRole,
  platformAdmin,
} from "./permissions";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_build");

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }) => {
      await resend.emails.send({
        from: "Quantix CD <onboarding@bennymak.best>",
        to: user.email,
        subject: "Reset your password",
        text: `Reset your password by clicking here: ${url}`,
        html: `<p>Reset your password by clicking <a href="${url}">here</a>.</p>`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      const customUrl = url.replace("/api/auth/verify-email", "/confirm-email");
      await resend.emails.send({
        from: "Quantix CD <onboarding@bennymak.best>",
        to: user.email,
        subject: "Verify your email address",
        text: `Verify your email address by clicking here: ${customUrl}`,
        html: `<p>Verify your email address by clicking <a href="${customUrl}">here</a>.</p>`,
      });
    },
  },
  plugins: [
    organization({
      ac,
      roles: { owner, admin: adminRole, accountant, staff, platformAdmin },
      creatorRole: "owner",
      allowUserToCreateOrganization: true,
      organizationLimit: 1,
    }),
    admin(),
  ],
});
