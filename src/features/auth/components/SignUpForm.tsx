"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpFormSchema, type SignUpFormInput } from "@/lib/validation/auth";
import { useSignUp } from "@/features/auth/hooks/use-sign-up";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

/** Inline SVG: Google */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

/** Inline SVG: Apple */
function AppleIcon() {
  return (
    <svg
      width="16"
      height="18"
      viewBox="0 0 814 1000"
      aria-hidden
      fill="currentColor"
    >
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.3-147.8-102.3C44.9 673.7 0 562.7 0 457.2C0 243.3 133.4 129.9 264.4 129.9c70.3 0 128.9 46.2 173.5 46.2 42.8 0 109.1-48.9 188.3-48.9 30.4 0 110.8 2.6 163.7 100.7zm-234.8-181.7c28.3-34.2 49.2-81.7 49.2-129.2 0-6.5-.6-13.1-1.9-18.3C549.3 7.8 450 51.3 380.6 127.3c-25.8 28.3-51.8 74.4-51.8 120.2 0 7.2 1.3 14.4 1.9 16.7 2.6.3 7.2.9 11.8.9 44.1 0 134.4-48.4 205.7-105.9z" />
    </svg>
  );
}

const inputClass =
  "w-full px-0 py-2.5 bg-transparent border-0 border-b border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors duration-200 text-base disabled:opacity-40";

const labelClass =
  "text-xs font-medium text-muted-foreground uppercase tracking-wider";

export default function SignUpForm() {
  const { isPending, error, handleSignUp } = useSignUp();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormInput>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  return (
    <div className="w-full max-w-sm">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started with your ERP tenant
        </p>
      </div>

      {/* OAuth buttons */}
      <div className="flex flex-col gap-3 mb-8">
        <button
          type="button"
          className="flex items-center justify-center gap-3 w-full py-2.5 rounded-xl glass-subtle border border-[var(--glass-border)] hover:border-primary/30 text-foreground text-sm font-medium transition-all duration-200 hover:-translate-y-px"
        >
          <GoogleIcon />
          Continue with Google
        </button>
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Coming soon"
          className="flex items-center justify-center gap-3 w-full py-2.5 rounded-xl glass-subtle border border-[var(--glass-border)] text-muted-foreground/40 text-sm font-medium cursor-not-allowed opacity-40"
        >
          <AppleIcon />
          Continue with Apple
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 h-px bg-[var(--glass-border)]" />
        <span className="text-xs text-muted-foreground/60 uppercase tracking-wider">
          or
        </span>
        <div className="flex-1 h-px bg-[var(--glass-border)]" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(handleSignUp)} className="space-y-6">
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}

        <div className="space-y-1">
          <label htmlFor="name" className={labelClass}>
            Full Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            disabled={isPending}
            {...register("name")}
            className={inputClass}
            placeholder="John Doe"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-xs text-destructive pt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            disabled={isPending}
            {...register("email")}
            className={inputClass}
            placeholder="name@company.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-destructive pt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password row — side by side on wider right panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <div className="relative flex items-center">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                disabled={isPending}
                {...register("password")}
                className={`${inputClass} pr-8`}
                placeholder="Min. 8 chars"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 text-muted-foreground hover:text-foreground focus:outline-none p-1 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-xs text-destructive pt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="confirmPassword" className={labelClass}>
              Confirm
            </label>
            <div className="relative flex items-center">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                disabled={isPending}
                {...register("confirmPassword")}
                className={`${inputClass} pr-8`}
                placeholder="••••••••"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword ? "confirm-error" : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-0 text-muted-foreground hover:text-foreground focus:outline-none p-1 cursor-pointer"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p id="confirm-error" className="text-xs text-destructive pt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm glow-sm shadow-[var(--glass-shadow)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-primary hover:opacity-80 transition-opacity"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
