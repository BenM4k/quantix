"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LedgerAccount } from "@/services/drizzle/schemas";
import {
  createJournalEntrySchema,
  type CreateJournalEntryInput,
} from "@/lib/schemas/accounting";
import { createJournalEntryAction } from "../actions";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";

interface NewJournalEntryClientProps {
  companyId: string;
  accounts: LedgerAccount[];
}

export function NewJournalEntryClient({
  companyId,
  accounts,
}: NewJournalEntryClientProps) {
  const router = useRouter();

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const todayStr = new Date().toISOString().split("T")[0];

  const form = useForm<CreateJournalEntryInput>({
    resolver: zodResolver(createJournalEntrySchema),
    defaultValues: {
      entryDate: todayStr,
      description: "",
      sourceType: "manual",
      lines: [
        { accountId: "", debit: 0, credit: 0, description: "" },
        { accountId: "", debit: 0, credit: 0, description: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  const watchedLines = form.watch("lines");

  // Calculate live running totals
  const totalDebit = watchedLines.reduce(
    (sum, line) => sum + (parseFloat(line.debit as any) || 0),
    0,
  );
  const totalCredit = watchedLines.reduce(
    (sum, line) => sum + (parseFloat(line.credit as any) || 0),
    0,
  );
  const diff = Math.abs(totalDebit - totalCredit);
  const isBalanced = diff < 0.0001 && totalDebit > 0;

  const onSubmit = (data: CreateJournalEntryInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await createJournalEntryAction(companyId, data);
      if (res.ok) {
        // Toast / Redirect to entry detail in list view
        router.push(
          `/${companyId}/accounting/journal-entries?selected=${res.value.id}`,
        );
      } else {
        setErrorMessage(res.error.message);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4 border-b border-border/40 pb-4">
        <Link href={`/${companyId}/accounting/journal-entries`}>
          <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>Create Manual Transaction</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Enter debit and credit line items. Total debits must equal total credits to post.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl text-sm bg-destructive/10 text-destructive border border-destructive/20 font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Header Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 md:p-10 glass-surface-elevated rounded-3xl border border-border/80 shadow-2xl">
          <Field>
            <FieldLabel htmlFor="entryDate">Entry Date *</FieldLabel>
            <Input id="entryDate" type="date" {...form.register("entryDate")} />
            {form.formState.errors.entryDate && (
              <FieldError>{form.formState.errors.entryDate.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="description">Description / Header Memo *</FieldLabel>
            <Input
              id="description"
              {...form.register("description")}
              placeholder="e.g. Monthly rent adjustment"
            />
            {form.formState.errors.description && (
              <FieldError>{form.formState.errors.description.message}</FieldError>
            )}
          </Field>
        </div>

        {/* Dynamic Line Items */}
        <div className="glass-surface-elevated rounded-3xl border border-border/80 p-8 md:p-10 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Journal Lines ({fields.length})
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ accountId: "", debit: 0, credit: 0, description: "" })}
              className="flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Line</span>
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-12 gap-4 items-start p-4 md:p-6 rounded-2xl bg-[var(--surface-solid)] border border-border/60"
              >
                <div className="col-span-12 md:col-span-4">
                  <Field>
                    <FieldLabel className="text-xs text-muted-foreground font-medium">
                      Account #{index + 1} *
                    </FieldLabel>
                    <select
                      {...form.register(`lines.${index}.accountId`)}
                      className="w-full h-11 px-4 py-2.5 rounded-xl border border-border/80 bg-[var(--surface-solid-raised)] text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Select account...</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.code} — {acc.name} ({acc.type})
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.lines?.[index]?.accountId && (
                      <FieldError>{form.formState.errors.lines[index]?.accountId?.message}</FieldError>
                    )}
                  </Field>
                </div>

                <div className="col-span-12 md:col-span-3">
                  <Field>
                    <FieldLabel className="text-[11px] text-muted-foreground">Line Description</FieldLabel>
                    <Input
                      className="h-9 text-xs"
                      {...form.register(`lines.${index}.description`)}
                      placeholder="Optional memo"
                    />
                  </Field>
                </div>

                <div className="col-span-6 md:col-span-2">
                  <Field>
                    <FieldLabel className="text-[11px] text-muted-foreground">Debit ($)</FieldLabel>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="h-9 text-xs font-mono"
                      {...form.register(`lines.${index}.debit`, { valueAsNumber: true })}
                    />
                  </Field>
                </div>

                <div className="col-span-5 md:col-span-2">
                  <Field>
                    <FieldLabel className="text-[11px] text-muted-foreground">Credit ($)</FieldLabel>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="h-9 text-xs font-mono"
                      {...form.register(`lines.${index}.credit`, { valueAsNumber: true })}
                    />
                  </Field>
                </div>

                <div className="col-span-1 flex items-center justify-center pt-5">
                  <button
                    type="button"
                    disabled={fields.length <= 2}
                    onClick={() => remove(index)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {form.formState.errors.lines?.root && (
            <FieldError>{form.formState.errors.lines.root.message}</FieldError>
          )}

          {/* Running Totals & Balance Status */}
          <div className="p-4 rounded-xl bg-muted/60 border border-border/60 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-muted-foreground uppercase">Total Debit: </span>
                <span className="font-bold text-foreground">${totalDebit.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground uppercase">Total Credit: </span>
                <span className="font-bold text-foreground">${totalCredit.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isBalanced ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-sans font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Entry Balanced</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 font-sans font-semibold">
                  <XCircle className="h-4 w-4" />
                  <span>Out of balance by ${diff.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3">
          <Link href={`/${companyId}/accounting/journal-entries`}>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={!isBalanced || isPending}
            className="flex items-center gap-2 px-6"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>Post Transaction</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
