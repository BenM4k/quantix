"use client";

import { useState, useTransition } from "react";
import { authClient } from "@/services/better-auth/auth-client";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";

const inputClass =
  "w-full px-0 py-2.5 bg-transparent border-0 border-b border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors duration-200 text-sm disabled:opacity-40";

const labelClass = "text-xs font-medium text-muted-foreground uppercase tracking-wider";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus(null);
    startTransition(async () => {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setStatus({
          type: "error",
          message: error.message || "Failed to submit request. Please try again.",
        });
      } else {
        setStatus({
          type: "success",
          message: "A password reset link has been sent to your email address.",
        });
        setEmail("");
      }
    });
  };

  if (status?.type === "success") {
    return (
      <div className="w-full max-w-sm flex flex-col items-center text-center py-6">
        <MailCheck className="w-12 h-12 text-primary mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">Check your email</h1>
        <p className="text-sm text-muted-foreground font-light mb-6">
          {status.message}
        </p>
        <Link
          href="/sign-in"
          className="w-full py-3 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm glow-sm shadow-[var(--glass-shadow)] transition-all duration-200 flex items-center justify-center"
        >
          Return to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Forgot Password</h1>
        <p className="mt-1 text-sm text-muted-foreground font-light">
          Enter your email and we will send you a password reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {status?.type === "error" && (
          <p role="alert" className="text-xs text-destructive">
            {status.message}
          </p>
        )}

        <div className="space-y-1">
          <label htmlFor="email" className={labelClass}>Email Address</label>
          <input
            id="email"
            type="email"
            required
            disabled={isPending}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="name@company.com"
          />
        </div>

        <button
          type="submit"
          disabled={isPending || !email}
          className="w-full py-3 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm glow-sm shadow-[var(--glass-shadow)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending Link...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/sign-in" className="font-medium text-primary hover:opacity-80 transition-opacity">
          Sign In
        </Link>
      </p>
    </div>
  );
}
