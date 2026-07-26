"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Customer, Product, TaxRate } from "@/services/drizzle/schemas";
import { OrderWithLines } from "@/dal/sales-order/queries";
import { createSalesOrderSchema, CreateSalesOrderInputSchema } from "@/lib/schemas/sales";
import { updateSalesOrderAction, updateOrderStatusAction, convertOrderToInvoiceAction } from "../actions";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, ArrowLeft, ShoppingBag, CheckCircle, XCircle, ArrowRight } from "lucide-react";

interface EditOrderClientProps {
  companyId: string;
  order: OrderWithLines;
  customers: Customer[];
  products: Product[];
  taxRates: TaxRate[];
  userRole: string;
}

export function EditOrderClient({ companyId, order, customers, products, taxRates }: EditOrderClientProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const isEditable = order.status === "draft" || order.status === "confirmed";

  const form = useForm<CreateSalesOrderInputSchema>({
    resolver: zodResolver(createSalesOrderSchema),
    defaultValues: {
      customerId: order.customerId,
      orderDate: order.orderDate,
      notes: order.notes || "",
      lines: order.lines.map((l) => ({
        productId: l.productId,
        description: l.description,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice),
        taxRateId: l.taxRateId || null,
        taxAmount: Number(l.taxAmount),
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  const watchedLines = form.watch("lines");

  const subtotal = watchedLines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);
  const taxTotal = watchedLines.reduce((sum, l) => {
    const qty = Number(l.quantity) || 0;
    const price = Number(l.unitPrice) || 0;
    const tr = taxRates.find((t) => t.id === l.taxRateId);
    const rate = tr && tr.ratePercent ? Number(tr.ratePercent) : 0;
    return sum + (qty * price * rate) / 100;
  }, 0);
  const total = subtotal + taxTotal;

  const handleStatusChange = (newStatus: any) => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await updateOrderStatusAction(companyId, order.id, newStatus);
      if (res.ok) router.refresh();
      else setErrorMessage(res.error || "An error occurred");
    });
  };

  const handleConvert = () => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await convertOrderToInvoiceAction(companyId, order.id);
      if (res.ok && res.data) router.push(`/${companyId}/sales/invoices?selected=${res.data.id}`);
      else setErrorMessage(res.error || "An error occurred");
    });
  };

  const onSubmit = (data: CreateSalesOrderInputSchema) => {
    setErrorMessage(null);
    startTransition(async () => {
      const linesWithTax = data.lines.map((l) => {
        const tr = taxRates.find((t) => t.id === l.taxRateId);
        const rate = tr && tr.ratePercent ? Number(tr.ratePercent) : 0;
        return { ...l, taxAmount: (l.quantity * l.unitPrice * rate) / 100 };
      });

      const res = await updateSalesOrderAction(companyId, order.id, { ...data, lines: linesWithTax });
      if (res.ok) router.refresh();
      else setErrorMessage(res.error || "An error occurred");
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${companyId}/sales/orders`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span>Order #{order.orderNumber}</span>
            </h2>
            <p className="text-xs text-muted-foreground">Customer: {order.customerName}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {order.status === "draft" && (
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleStatusChange("confirmed")} disabled={isPending}>
              <CheckCircle className="h-4 w-4 mr-1" /> Confirm Order
            </Button>
          )}
          {order.status === "confirmed" && (
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleConvert} disabled={isPending}>
              <ArrowRight className="h-4 w-4 mr-1" /> Convert to Invoice
            </Button>
          )}
          {(order.status === "draft" || order.status === "confirmed") && (
            <Button size="sm" variant="destructive" onClick={() => handleStatusChange("cancelled")} disabled={isPending}>
              <XCircle className="h-4 w-4 mr-1" /> Cancel Order
            </Button>
          )}
        </div>
      </div>

      {!isEditable && (
        <div className="p-4 rounded-xl text-sm bg-muted/60 text-muted-foreground border border-border/60 flex items-center justify-between">
          <span>This sales order is in <strong>{order.status.toUpperCase()}</strong> status and is read-only.</span>
          <Badge variant="outline">{order.status}</Badge>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl text-sm bg-destructive/10 text-destructive border border-destructive/20 font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <fieldset disabled={!isEditable} className="space-y-6 group-disabled:opacity-75">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 rounded-2xl border border-border/80 bg-card">
            <Field>
              <FieldLabel>Customer</FieldLabel>
              <select {...form.register("customerId")} className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-sm">
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field>
              <FieldLabel>Order Date</FieldLabel>
              <Input type="date" {...form.register("orderDate")} />
            </Field>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Line Items</h3>
              {isEditable && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ productId: "", description: "", quantity: 1, unitPrice: 0, taxRateId: null, taxAmount: 0 })}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Line
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 rounded-xl border border-border/60 bg-card flex flex-col md:flex-row gap-3 items-end">
                  <div className="w-full md:w-1/4">
                    <FieldLabel>Product</FieldLabel>
                    <select {...form.register(`lines.${index}.productId`)} className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-sm">
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full md:w-1/4">
                    <FieldLabel>Description</FieldLabel>
                    <Input {...form.register(`lines.${index}.description`)} />
                  </div>

                  <div className="w-full md:w-32">
                    <FieldLabel>Qty</FieldLabel>
                    <Input type="number" step="any" {...form.register(`lines.${index}.quantity`, { valueAsNumber: true })} />
                  </div>

                  <div className="w-full md:w-36">
                    <FieldLabel>Unit Price ($)</FieldLabel>
                    <Input type="number" step="any" {...form.register(`lines.${index}.unitPrice`, { valueAsNumber: true })} />
                  </div>

                  <div className="w-full md:w-36">
                    <FieldLabel>Tax Rate</FieldLabel>
                    <select {...form.register(`lines.${index}.taxRateId`)} className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-sm">
                      <option value="">None (0%)</option>
                      {taxRates.map((t) => (
                        <option key={t.id} value={t.id}>{t.name} ({Number(t.ratePercent)}%)</option>
                      ))}
                    </select>
                  </div>

                  {isEditable && (
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
                  )}
                </div>
              ))}
            </div>
          </div>
        </fieldset>

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

        {isEditable && (
          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Update Order
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
