"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CompanyProfile } from "@/services/drizzle/schemas";
import { updateCompanySettingsAction } from "./actions";
import { Field, FieldLabel } from "@/components/ui/field";
import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/layout/section-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { canX } from "@/lib/permissions";
import { Building2, Lock, Loader2, CheckCircle2 } from "lucide-react";

const companySettingsSchema = z.object({
  baseCurrency: z.string().min(1, "Currency is required"),
  dateFormat: z.string().min(1, "Date format is required"),
  fiscalYearStartMonth: z.number().min(1).max(12),
  fiscalYearStartDay: z.number().min(1).max(28),
});

type CompanySettingsSchema = z.infer<typeof companySettingsSchema>;

interface CompanySettingsClientProps {
  companyId: string;
  profile: CompanyProfile;
  hasAccountingActivity: boolean;
  userRole: string;
}

export function CompanySettingsClient({
  companyId,
  profile,
  hasAccountingActivity,
  userRole,
}: CompanySettingsClientProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const canManage = canX(userRole, { id: companyId }, "company:manage");

  const form = useForm<CompanySettingsSchema>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      baseCurrency: profile.baseCurrency || "USD",
      dateFormat: profile.dateFormat || "YYYY-MM-DD",
      fiscalYearStartMonth: profile.fiscalYearStartMonth || 1,
      fiscalYearStartDay: profile.fiscalYearStartDay || 1,
    },
  });

  const onSubmit = (data: CompanySettingsSchema) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    startTransition(async () => {
      const res = await updateCompanySettingsAction(companyId, data);
      if (res.ok) {
        setSuccessMessage("Company settings updated successfully.");
        router.refresh();
      } else {
        setErrorMessage(res.error || "An error occurred");
      }
    });
  };

  const months = [
    { value: 1, label: "January (01)" },
    { value: 2, label: "February (02)" },
    { value: 3, label: "March (03)" },
    { value: 4, label: "April (04)" },
    { value: 5, label: "May (05)" },
    { value: 6, label: "June (06)" },
    { value: 7, label: "July (07)" },
    { value: 8, label: "August (08)" },
    { value: 9, label: "September (09)" },
    { value: 10, label: "October (10)" },
    { value: 11, label: "November (11)" },
    { value: 12, label: "December (12)" },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Company Settings"
        description="Configure financial settings, base currency, and fiscal year parameters."
        icon={Building2}
      />

      {errorMessage && (
        <div className="p-4 rounded-xl text-sm bg-destructive/10 text-destructive border border-destructive/20 font-medium">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl text-sm bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionCard className="space-y-6">
          <h2 className="text-base font-semibold border-b border-border/40 pb-3">Currency & Regional Format</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Base Currency</FieldLabel>
              <select
                {...form.register("baseCurrency")}
                className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-sm"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </Field>

            <Field>
              <FieldLabel>Date Format</FieldLabel>
              <select
                {...form.register("dateFormat")}
                className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-sm"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (US standard)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (EU standard)</option>
              </select>
            </Field>
          </div>
        </SectionCard>

        <SectionCard className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div>
              <h2 className="text-base font-semibold">Fiscal Year Configuration</h2>
              <p className="text-xs text-muted-foreground">
                Sets the annual accounting period anchor used across financial reports.
              </p>
            </div>
            {hasAccountingActivity && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                <Lock className="h-3.5 w-3.5" /> Locked
              </span>
            )}
          </div>

          {hasAccountingActivity && (
            <div className="p-3.5 rounded-xl text-xs bg-amber-500/10 text-amber-700 border border-amber-500/20 leading-relaxed">
              Fiscal year start can&apos;t be changed once accounting activity exists, since it would reshuffle historical reporting periods.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Fiscal Year Start Month</FieldLabel>
              <select
                {...form.register("fiscalYearStartMonth", { valueAsNumber: true })}
                disabled={hasAccountingActivity || !canManage}
                className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field>
              <FieldLabel>Fiscal Year Start Day (1-28)</FieldLabel>
              <Input
                type="number"
                min={1}
                max={28}
                {...form.register("fiscalYearStartDay", { valueAsNumber: true })}
                disabled={hasAccountingActivity || !canManage}
                className="disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Day of the month when the fiscal year begins (restricted to 1–28 for validity across all months).
              </p>
            </Field>
          </div>
        </SectionCard>

        {canManage && (
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Settings
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
