"use client";

import { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/services/better-auth/auth-client";
import Link from "next/link";
import { Mail, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const inputClass =
  "w-full px-0 py-2.5 bg-transparent border-0 border-b border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors duration-200 text-sm disabled:opacity-40";

const labelClass = "text-xs font-medium text-muted-foreground uppercase tracking-wider";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [verifying, setVerifying] = useState(!!token);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for resending
  const [resendEmail, setResendEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [resendStatus, setResendStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (token) {
      authClient.verifyEmail(
        { query: { token } },
        {
          onRequest: () => {
            setVerifying(true);
            setError(null);
          },
          onSuccess: () => {
            setVerifying(false);
            setSuccess(true);
            // Optionally redirect after a few seconds
            setTimeout(() => {
              router.push("/dashboard");
            }, 3000);
          },
          onError: (ctx) => {
            setVerifying(false);
            setError(ctx.error.message || "Failed to verify email. The link may have expired.");
          },
        }
      );
    }
  }, [token, router]);

  const handleResend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResendStatus(null);
    startTransition(async () => {
      const { error: resendErr } = await authClient.sendVerificationEmail({
        email: resendEmail,
        callbackURL: `${window.location.origin}/dashboard`,
      });

      if (resendErr) {
        setResendStatus({
          type: "error",
          message: resendErr.message || "Failed to send verification email.",
        });
      } else {
        setResendStatus({
          type: "success",
          message: "Verification email sent successfully! Please check your inbox.",
        });
        setResendEmail("");
      }
    });
  };

  // Case 1: Verifying in progress
  if (verifying) {
    return (
      <div className="w-full max-w-sm flex flex-col items-center text-center py-6">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">Verifying your email</h1>
        <p className="text-sm text-muted-foreground font-light">
          Please wait while we confirm your email credentials...
        </p>
      </div>
    );
  }

  // Case 2: Success verification
  if (success) {
    return (
      <div className="w-full max-w-sm flex flex-col items-center text-center py-6">
        <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">Email Verified!</h1>
        <p className="text-sm text-muted-foreground font-light mb-6">
          Your account is now active. Redirecting to your dashboard...
        </p>
        <Link
          href="/dashboard"
          className="w-full py-3 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm glow-sm shadow-[var(--glass-shadow)] transition-all duration-200 flex items-center justify-center"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  // Case 3: Error verification or Manual Resend request
  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center text-center mb-8">
        {error ? (
          <XCircle className="w-12 h-12 text-destructive mb-4" />
        ) : (
          <Mail className="w-12 h-12 text-primary mb-4" />
        )}
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {error ? "Verification Failed" : "Verify Email"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground font-light">
          {error || "Please check your inbox for a verification email to active your account."}
        </p>
      </div>

      <form onSubmit={handleResend} className="space-y-6">
        {resendStatus && (
          <p
            role="alert"
            className={`text-xs ${
              resendStatus.type === "success" ? "text-green-500" : "text-destructive"
            }`}
          >
            {resendStatus.message}
          </p>
        )}

        <div className="space-y-1">
          <label htmlFor="email" className={labelClass}>Resend Verification Link</label>
          <input
            id="email"
            type="email"
            required
            disabled={isPending}
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            className={inputClass}
            placeholder="name@company.com"
          />
        </div>

        <button
          type="submit"
          disabled={isPending || !resendEmail}
          className="w-full py-3 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm glow-sm shadow-[var(--glass-shadow)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Verification Email"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already verified?{" "}
        <Link href="/sign-in" className="font-medium text-primary hover:opacity-80 transition-opacity">
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-sm flex flex-col items-center text-center py-6">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Loading</h1>
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
