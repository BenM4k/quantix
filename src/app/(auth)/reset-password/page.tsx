"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/services/better-auth/auth-client";
import Link from "next/link";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

const inputClass =
  "w-full px-0 py-2.5 bg-transparent border-0 border-b border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors duration-200 text-sm disabled:opacity-40";

const labelClass = "text-xs font-medium text-muted-foreground uppercase tracking-wider";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    !token ? { type: "error", message: "Missing reset token. Please request another link." } : null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password.length < 8) {
      setStatus({ type: "error", message: "Password must be at least 8 characters long." });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setStatus(null);
    startTransition(async () => {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (error) {
        setStatus({
          type: "error",
          message: error.message || "Failed to reset password. The link may have expired or is invalid.",
        });
      } else {
        setStatus({
          type: "success",
          message: "Your password has been successfully reset.",
        });
        setTimeout(() => {
          router.push("/sign-in");
        }, 3000);
      }
    });
  };

  if (status?.type === "success") {
    return (
      <div className="w-full max-w-sm flex flex-col items-center text-center py-6">
        <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">Password Reset!</h1>
        <p className="text-sm text-muted-foreground font-light mb-6">
          {status.message} Redirecting you to sign in...
        </p>
        <Link
          href="/sign-in"
          className="w-full py-3 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm glow-sm shadow-[var(--glass-shadow)] transition-all duration-200 flex items-center justify-center"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Reset Password</h1>
        <p className="mt-1 text-sm text-muted-foreground font-light">
          Set a secure new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {status?.type === "error" && (
          <p role="alert" className="text-xs text-destructive">
            {status.message}{" "}
            {!token && (
              <Link href="/forgot-password" className="text-primary hover:underline ml-1">
                Forgot Password?
              </Link>
            )}
          </p>
        )}

        <div className="space-y-1">
          <label htmlFor="password" className={labelClass}>New Password</label>
          <div className="relative flex items-center">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              disabled={isPending || !token}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-8`}
              placeholder="Min. 8 characters"
            />
            <button
              type="button"
              disabled={!token}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 text-muted-foreground hover:text-foreground focus:outline-none p-1 cursor-pointer disabled:opacity-30"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="confirmPassword" className={labelClass}>Confirm New Password</label>
          <div className="relative flex items-center">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              disabled={isPending || !token}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${inputClass} pr-8`}
              placeholder="••••••••"
            />
            <button
              type="button"
              disabled={!token}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-0 text-muted-foreground hover:text-foreground focus:outline-none p-1 cursor-pointer disabled:opacity-30"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || !token || !password || !confirmPassword}
          className="w-full py-3 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm glow-sm shadow-[var(--glass-shadow)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Go back to{" "}
        <Link href="/sign-in" className="font-medium text-primary hover:opacity-80 transition-opacity">
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-sm flex flex-col items-center text-center py-6">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Loading</h1>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
