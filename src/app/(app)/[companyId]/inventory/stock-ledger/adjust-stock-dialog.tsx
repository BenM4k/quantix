"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  stockAdjustmentFormSchema,
  type StockAdjustmentFormInput,
} from "@/lib/schemas/stock-adjustment";
import { recordStockMovementAction } from "./actions";
import { Product } from "@/services/drizzle/schemas";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";

interface AdjustStockDialogProps {
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onSuccess?: () => void;
}

export function AdjustStockDialog({
  companyId,
  open,
  onOpenChange,
  products,
  onSuccess,
}: AdjustStockDialogProps) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  const form = useForm<StockAdjustmentFormInput>({
    resolver: zodResolver(stockAdjustmentFormSchema),
    defaultValues: {
      productId: "",
      direction: "in",
      quantity: 1,
      unitCost: 0,
      reason: "",
    },
  });

  const direction = form.watch("direction");

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setServerError(null);
      form.reset({
        productId: products.length > 0 ? products[0]!.id : "",
        direction: "in",
        quantity: 1,
        unitCost: 0,
        reason: "",
      });
    }
  }, [open, products, form]);

  const onSubmit = async (values: StockAdjustmentFormInput) => {
    setServerError(null);
    setIsPending(true);

    try {
      const res = await recordStockMovementAction(companyId, values);
      if (res.ok) {
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        setServerError(res.error.message);
      }
    } catch (err: any) {
      setServerError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Record a manual stock adjustment for a single product. Stock-in requires unit cost; stock-out resolves cost from current weighted average automatically.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2 border border-destructive/20">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <FieldGroup>
            {/* Product Select */}
            <Field>
              <FieldLabel htmlFor="adjust-product">Product</FieldLabel>
              <select
                id="adjust-product"
                {...form.register("productId")}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="" disabled>
                  Select a product...
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
              {form.formState.errors.productId && (
                <FieldError>{form.formState.errors.productId.message}</FieldError>
              )}
            </Field>

            {/* Movement Direction */}
            <Field>
              <FieldLabel htmlFor="adjust-direction">Direction</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={direction === "in" ? "default" : "outline"}
                  onClick={() => form.setValue("direction", "in")}
                  className="w-full"
                >
                  + Stock In (Adjustment In)
                </Button>
                <Button
                  type="button"
                  variant={direction === "out" ? "default" : "outline"}
                  onClick={() => form.setValue("direction", "out")}
                  className="w-full"
                >
                  - Stock Out (Adjustment Out)
                </Button>
              </div>
            </Field>

            {/* Quantity & Unit Cost */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="adjust-qty">Quantity</FieldLabel>
                <Input
                  id="adjust-qty"
                  type="number"
                  step="any"
                  min="0.0001"
                  {...form.register("quantity", { valueAsNumber: true })}
                />
                {form.formState.errors.quantity && (
                  <FieldError>{form.formState.errors.quantity.message}</FieldError>
                )}
              </Field>

              {direction === "in" ? (
                <Field>
                  <FieldLabel htmlFor="adjust-cost">Unit Cost ($)</FieldLabel>
                  <Input
                    id="adjust-cost"
                    type="number"
                    step="0.01"
                    min="0"
                    {...form.register("unitCost", { valueAsNumber: true })}
                  />
                  {form.formState.errors.unitCost && (
                    <FieldError>{form.formState.errors.unitCost.message}</FieldError>
                  )}
                </Field>
              ) : (
                <Field>
                  <FieldLabel className="text-muted-foreground">Unit Cost ($)</FieldLabel>
                  <Input
                    disabled
                    value="Auto (Avg Cost)"
                    className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                </Field>
              )}
            </div>

            {/* Reason */}
            <Field>
              <FieldLabel htmlFor="adjust-reason">Reason</FieldLabel>
              <textarea
                id="adjust-reason"
                rows={3}
                placeholder="Reason for adjustment (e.g. Stock count variance, damaged goods, initial inventory)..."
                {...form.register("reason")}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {form.formState.errors.reason && (
                <FieldError>{form.formState.errors.reason.message}</FieldError>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Stock Adjustment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
