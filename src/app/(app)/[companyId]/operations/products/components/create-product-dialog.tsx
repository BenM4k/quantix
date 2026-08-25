"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/lib/schemas/product";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface CreateProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductInput) => void;
  isPending: boolean;
  errorMessage: string | null;
}

export function CreateProductDialog({
  isOpen,
  onClose,
  onSubmit,
  isPending,
  errorMessage,
}: CreateProductDialogProps) {
  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: "",
      name: "",
      uom: "unit",
      sellPrice: 0,
      costPrice: 0,
      reorderThreshold: null,
      imageUrl: null,
      active: true,
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        sku: "",
        name: "",
        uom: "unit",
        sellPrice: 0,
        costPrice: 0,
        reorderThreshold: null,
        imageUrl: null,
        active: true,
      });
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-neutral-900 border border-[#E2E8F0] dark:border-neutral-800 rounded-xl p-6 shadow-xl">
        <DialogHeader className="text-left pb-3 border-b border-[#F1F5F9] dark:border-neutral-800">
          <DialogTitle className="text-base font-bold text-[#0F172A] dark:text-neutral-100">
            Create Product
          </DialogTitle>
          <DialogDescription className="text-xs text-[#64748B]">
            Add a new catalog item. Quantix automatically links stock movements and journal entries.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 rounded-lg text-xs bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
            {errorMessage}
          </div>
        )}

        <form
          id="create-product-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 py-2"
        >
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-[#334155] dark:text-neutral-300 block mb-1">
                SKU Code *
              </label>
              <input
                type="text"
                {...form.register("sku")}
                placeholder="e.g. SKU-1001"
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[#0F172A] dark:text-neutral-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#E3530F]"
              />
              {form.formState.errors.sku && (
                <p className="text-[10px] text-[#DC2626] mt-1">
                  {form.formState.errors.sku.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#334155] dark:text-neutral-300 block mb-1">
                Product Name *
              </label>
              <input
                type="text"
                {...form.register("name")}
                placeholder="e.g. Ergonomic Office Chair"
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[#0F172A] dark:text-neutral-100 text-xs focus:outline-none focus:ring-1 focus:ring-[#E3530F]"
              />
              {form.formState.errors.name && (
                <p className="text-[10px] text-[#DC2626] mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#334155] dark:text-neutral-300 block mb-1">
                Unit of Measure
              </label>
              <select
                {...form.register("uom")}
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[#0F172A] dark:text-neutral-100 text-xs focus:outline-none focus:ring-1 focus:ring-[#E3530F]"
              >
                <option value="unit">Unit</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="meter">Meter (m)</option>
                <option value="liter">Liter (l)</option>
                <option value="box">Box</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#334155] dark:text-neutral-300 block mb-1">
                Reorder Alert Threshold
              </label>
              <input
                type="number"
                {...form.register("reorderThreshold", {
                  setValueAs: (v) =>
                    v === "" || v === null ? null : Number(v),
                })}
                placeholder="e.g. 10"
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[#0F172A] dark:text-neutral-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#E3530F]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#334155] dark:text-neutral-300 block mb-1">
                Sell Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                {...form.register("sellPrice", { valueAsNumber: true })}
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[#0F172A] dark:text-neutral-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#E3530F]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#334155] dark:text-neutral-300 block mb-1">
                Cost Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                {...form.register("costPrice", { valueAsNumber: true })}
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[#0F172A] dark:text-neutral-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#E3530F]"
              />
            </div>
          </div>
        </form>

        <DialogFooter className="pt-3 border-t border-[#F1F5F9] dark:border-neutral-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-neutral-700 text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-neutral-800 text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            form="create-product-form"
            type="submit"
            disabled={isPending}
            className="px-4 py-2 rounded-lg bg-[#E3530F] hover:bg-[#C2410C] text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Save Product</span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
