"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, type OnboardingInput } from "@/lib/validation/auth";
import { useOnboarding } from "@/features/onboarding/hooks/use-onboarding";

const COMPANY_TYPES = [
  {
    value: "service" as const,
    label: "Service",
    description: "Consulting, software, professional services, agency.",
    emoji: "💼",
  },
  {
    value: "retail" as const,
    label: "Retail / Trade",
    description: "E-commerce, wholesale, physical product sales.",
    emoji: "🛍️",
  },
  {
    value: "manufacturing" as const,
    label: "Manufacturing",
    description: "Raw materials, production, bill of materials.",
    emoji: "🏭",
  },
];

export default function OnboardingForm() {
  const { isPending, serverError, handleOnboarding } = useOnboarding();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      companyName: "",
      companyType: "service",
      baseCurrency: "USD",
    },
  });

  return (
    <div className="w-full max-w-xl p-8 rounded-2xl glass-strong shadow-[var(--glass-shadow)]">
      <div className="flex flex-col space-y-2 text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Setup Your Workspace
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure your ERP system to fit your business model
        </p>
      </div>

      <form onSubmit={handleSubmit(handleOnboarding)} noValidate className="space-y-6">
        {serverError && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive"
          >
            {serverError}
          </div>
        )}

        {/* Company Name */}
        <div className="space-y-2">
          <label
            htmlFor="companyName"
            className="text-sm font-medium text-foreground block"
          >
            Company Name
          </label>
          <input
            id="companyName"
            type="text"
            autoComplete="organization"
            disabled={isPending}
            {...register("companyName")}
            className="w-full px-4 py-3 rounded-xl glass-subtle border border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 disabled:opacity-50"
            placeholder="Acme Corporation"
            aria-invalid={!!errors.companyName}
            aria-describedby={
              errors.companyName ? "companyName-error" : undefined
            }
          />
          {errors.companyName && (
            <p
              id="companyName-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.companyName.message}
            </p>
          )}
        </div>

        {/* Company Type */}
        <fieldset>
          <legend className="text-sm font-medium text-foreground mb-3">
            What type of company do you want to run?
          </legend>
          <Controller
            name="companyType"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {COMPANY_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    role="radio"
                    aria-checked={field.value === type.value}
                    disabled={isPending}
                    onClick={() => field.onChange(type.value)}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 flex flex-col gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      field.value === type.value
                        ? "glass border-primary/50 glow-sm text-foreground"
                        : "glass-subtle border-[var(--glass-border)] text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    <span className="text-xl">{type.emoji}</span>
                    <span className="text-sm font-semibold">{type.label}</span>
                    <span className="text-xs leading-relaxed opacity-70 font-light">
                      {type.description}
                    </span>
                  </button>
                ))}
              </div>
            )}
          />
          {errors.companyType && (
            <p role="alert" className="text-xs text-destructive mt-2">
              {errors.companyType.message}
            </p>
          )}
        </fieldset>

        {/* Base Currency */}
        <div className="space-y-2">
          <label
            htmlFor="baseCurrency"
            className="text-sm font-medium text-foreground block"
          >
            Base Currency{" "}
            <span className="text-muted-foreground font-normal">
              (ISO 3-letter code)
            </span>
          </label>
          <input
            id="baseCurrency"
            type="text"
            maxLength={3}
            disabled={isPending}
            {...register("baseCurrency")}
            className="w-full px-4 py-3 rounded-xl glass-subtle border border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 uppercase tracking-widest disabled:opacity-50"
            placeholder="USD"
            aria-invalid={!!errors.baseCurrency}
            aria-describedby={
              errors.baseCurrency ? "baseCurrency-error" : undefined
            }
          />
          {errors.baseCurrency && (
            <p
              id="baseCurrency-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.baseCurrency.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold shadow-[var(--glass-shadow)] glow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Setting up workspace…
            </>
          ) : (
            "Complete Setup"
          )}
        </button>
      </form>
    </div>
  );
}
