"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Customer, Product, TaxRate } from "@/services/drizzle/schemas";
import { createQuoteSchema, CreateQuoteInputSchema } from "@/lib/schemas/sales";
import { createQuoteAction } from "../actions";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2, ArrowLeft, FileText } from "lucide-react";

interface NewQuoteClientProps {
  companyId: string;
  customers: Customer[];
  products: Product[];
  taxRates: TaxRate[];
}

export function NewQuoteClient({ companyId, customers, products, taxRates }: NewQuoteClientProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const todayStr = new Date().toISOString().split("T")[0];

  const form = useForm<CreateQuoteInputSchema>({
    resolver: zodResolver(createQuoteSchema),
    defaultValues: {
      customerId: customers[0]?.id || "",
      quoteDate: todayStr,
      expiryDate: "",
      notes: "",
      lines: [{ productId: "", description: "", quantity: 1, unitPrice: 0, taxRateId: null, taxAmount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  const watchedLines = form.watch("lines");

  // Client-side live total calculation
  const subtotal = watchedLines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);
  const taxTotal = watchedLines.reduce((sum, l) => {
    const qty = Number(l.quantity) || 0;
    const price = Number(l.unitPrice) || 0;
    const tr = taxRates.find((t) => t.id === l.taxRateId);
    const rate = tr && tr.ratePercent ? Number(tr.ratePercent) : 0;
    return sum + (qty * price * rate) / 100;
  }, 0);
  const total = subtotal + taxTotal;

  const handleProductSelect = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      form.setValue(`lines.${index}.productId`, productId);
      form.setValue(`lines.${index}.description`, prod.name);
      form.setValue(`lines.${index}.unitPrice`, Number(prod.sellPrice));
      form.setValue(`lines.${index}.taxRateId`, prod.taxRateId || null);
    }
  };

  const onSubmit = (data: CreateQuoteInputSchema) => {
    setErrorMessage(null);
    startTransition(async () => {
      // Pre-calculate tax amounts per line
      const linesWithTax = data.lines.map((l) => {
        const tr = taxRates.find((t) => t.id === l.taxRateId);
        const rate = tr && tr.ratePercent ? Number(tr.ratePercent) : 0;
        const taxAmount = (l.quantity * l.unitPrice * rate) / 100;
        return { ...l, taxAmount };
      });

      const res = await createQuoteAction(companyId, { ...data, lines: linesWithTax });
      if (res.ok && res.data) {
        router.push(`/${companyId}/sales/quotes/${res.data.id}`);
      } else {
        setErrorMessage(res.error || "An error occurred");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/${companyId}/sales/quotes`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>Create Sales Quote</span>
          </h2>
          <p className="text-xs text-muted-foreground">Draft a new sales quote for a customer.</p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl text-sm bg-destructive/10 text-destructive border border-destructive/20 font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 md:p-10 rounded-3xl border border-border/80 glass-surface-elevated shadow-2xl">
          <Field>
            <FieldLabel>Customer *</FieldLabel>
            <select
              {...form.register("customerId")}
              className="w-full h-11 px-4 py-2.5 rounded-xl border border-border/80 bg-[var(--surface-solid-raised)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field>
            <FieldLabel>Quote Date *</FieldLabel>
            <Input type="date" {...form.register("quoteDate")} />
          </Field>

          <Field>
            <FieldLabel>Expiration Date</FieldLabel>
            <Input type="date" {...form.register("expiryDate")} />
          </Field>
        </div>

        {/* Line Items Array */}
        <div className="space-y-6 p-8 md:p-10 rounded-3xl border border-border/80 glass-surface-elevated shadow-2xl">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Line Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ productId: "", description: "", quantity: 1, unitPrice: 0, taxRateId: null, taxAmount: 0 })}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Line
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 md:p-6 rounded-2xl border border-border/60 bg-[var(--surface-solid)] flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-1/4">
                  <FieldLabel>Product *</FieldLabel>
                  <select
                    value={watchedLines[index]?.productId || ""}
                    onChange={(e) => handleProductSelect(index, e.target.value)}
                    className="w-full h-11 px-4 py-2.5 rounded-xl border border-border/80 bg-[var(--surface-solid-raised)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${Number(p.sellPrice).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full md:w-1/4">
                  <FieldLabel>Description</FieldLabel>
                  <Input {...form.register(`lines.${index}.description`)} placeholder="Item description" />
                </div>

                <div className="w-full md:w-32">
                  <FieldLabel>Qty *</FieldLabel>
                  <Input
                    type="number"
                    step="any"
                    {...form.register(`lines.${index}.quantity`, { valueAsNumber: true })}
                  />
                </div>

                <div className="w-full md:w-36">
                  <FieldLabel>Unit Price ($) *</FieldLabel>
                  <Input
                    type="number"
                    step="any"
                    {...form.register(`lines.${index}.unitPrice`, { valueAsNumber: true })}
                  />
                </div>

                <div className="w-full md:w-36">
                  <FieldLabel>Tax Rate</FieldLabel>
                  <select
                    {...form.register(`lines.${index}.taxRateId`)}
                    className="w-full h-11 px-4 py-2.5 rounded-xl border border-border/80 bg-[var(--surface-solid-raised)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">None (0%)</option>
                    {taxRates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({Number(t.ratePercent)}%)
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Calculation Summary */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card flex flex-col items-end space-y-2 text-sm">
          <div className="flex justify-between w-64 text-muted-foreground">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between w-64 text-muted-foreground">
            <span>Tax:</span>
            <span>${taxTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between w-64 text-lg font-bold text-foreground pt-2 border-t border-border/40">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href={`/${companyId}/sales/quotes`}>
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Quote
          </Button>
        </div>
      </form>
    </div>
  );
}
