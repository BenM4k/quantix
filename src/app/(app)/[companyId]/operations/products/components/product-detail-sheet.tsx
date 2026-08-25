"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product } from "@/services/drizzle/schemas";
import { productSchema, type ProductInput } from "@/lib/schemas/product";
import { StockSummary } from "./types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Package, Trash2, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

const fmt = (v: string | number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(v) || 0);

interface ProductDetailSheetProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  stockSummary?: StockSummary;
  canUpdate: boolean;
  canDelete: boolean;
  isPending: boolean;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  onDeleteProduct: (id: string) => void;
  onEditSubmit: (data: ProductInput) => void;
  errorMessage: string | null;
  successMessage: string | null;
}

export function ProductDetailSheet({
  product,
  isOpen,
  onClose,
  stockSummary,
  canUpdate,
  canDelete,
  isPending,
  confirmDeleteId,
  setConfirmDeleteId,
  onDeleteProduct,
  onEditSubmit,
  errorMessage,
  successMessage,
}: ProductDetailSheetProps) {
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
    if (product) {
      form.reset({
        id: product.id,
        sku: product.sku,
        name: product.name,
        uom: product.uom,
        sellPrice: Number(product.sellPrice),
        costPrice: Number(product.costPrice),
        reorderThreshold: product.reorderThreshold
          ? Number(product.reorderThreshold)
          : null,
        imageUrl: product.imageUrl,
        active: product.active,
      });
    }
  }, [product, form]);

  if (!product) return null;

  const qty = stockSummary ? Number(stockSummary.quantityOnHand) : 0;
  const avgCost = stockSummary
    ? Number(stockSummary.averageCost)
    : Number(product.costPrice);
  const totalValuation = qty * avgCost;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col h-full bg-white dark:bg-neutral-900 border-l border-[#E2E8F0] dark:border-neutral-800"
      >
        {/* Header */}
        <SheetHeader className="p-6 border-b border-[#F1F5F9] dark:border-neutral-800 text-left">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-[#FFF1EB] dark:bg-neutral-800 border border-[#FED7C2] dark:border-neutral-700 flex items-center justify-center text-[#E3530F] font-bold text-sm shrink-0 overflow-hidden">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-5 w-5 text-[#E3530F]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base font-bold text-[#0F172A] dark:text-neutral-100 truncate">
                  {product.name}
                </SheetTitle>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0",
                    product.active
                      ? "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]"
                      : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]",
                  )}
                >
                  {product.active ? "● Active" : "● Archived"}
                </span>
              </div>
              <SheetDescription className="text-xs text-[#64748B] font-mono mt-0.5">
                SKU: {product.sku} · Unit: {product.uom}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Sheet Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Notifications */}
          {errorMessage && (
            <div className="p-3 rounded-lg text-xs bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-lg text-xs bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
              {successMessage}
            </div>
          )}

          {/* Quick Metrics Grid — Ledgerly Style */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-lg border border-[#E2E8F0] dark:border-neutral-800 bg-[#F8FAFC] dark:bg-neutral-800/40">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                Qty on Hand
              </span>
              <p className="text-lg font-bold text-[#0F172A] dark:text-neutral-100 font-mono mt-1">
                {qty.toLocaleString("en-US")}
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-[#E2E8F0] dark:border-neutral-800 bg-[#F8FAFC] dark:bg-neutral-800/40">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                Avg Unit Cost
              </span>
              <p className="text-lg font-bold text-[#0F172A] dark:text-neutral-100 font-mono mt-1">
                {fmt(avgCost)}
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-[#FED7C2] dark:border-neutral-800 bg-[#FFF7F3] dark:bg-neutral-800/40">
              <span className="text-[10px] font-bold text-[#E3530F] uppercase tracking-wider block">
                Stock Value
              </span>
              <p className="text-lg font-bold text-[#E3530F] font-mono mt-1">
                {fmt(totalValuation)}
              </p>
            </div>
          </div>

          {/* Live Edit Form */}
          {canUpdate && (
            <form
              id="sheet-edit-product-form"
              onSubmit={form.handleSubmit(onEditSubmit)}
              className="space-y-4 pt-1"
            >
              <h4 className="text-xs font-bold text-[#0F172A] dark:text-neutral-100 uppercase tracking-wider border-b border-[#F1F5F9] dark:border-neutral-800 pb-2">
                Parameters &amp; Pricing
              </h4>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-[#334155] dark:text-neutral-300 block mb-1">
                    Sell Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...form.register("sellPrice", { valueAsNumber: true })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[#0F172A] dark:text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-[#E3530F]"
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
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[#0F172A] dark:text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-[#E3530F]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#334155] dark:text-neutral-300 block mb-1">
                    Unit of Measure
                  </label>
                  <select
                    {...form.register("uom")}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[#0F172A] dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-[#E3530F]"
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
                    Reorder Threshold
                  </label>
                  <input
                    type="number"
                    {...form.register("reorderThreshold", {
                      setValueAs: (v) =>
                        v === "" || v === null ? null : Number(v),
                    })}
                    placeholder="e.g. 10"
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[#0F172A] dark:text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-[#E3530F]"
                  />
                </div>
              </div>

              {/* Status active checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-[#334155] dark:text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    {...form.register("active")}
                    className="rounded border-[#CBD5E1] text-[#E3530F] focus:ring-[#E3530F]"
                  />
                  <span>Active item available for invoices &amp; orders</span>
                </label>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[#F1F5F9] dark:border-neutral-800 bg-[#F8FAFC] dark:bg-neutral-900 flex items-center justify-between gap-3">
          {canDelete && (
            confirmDeleteId === product.id ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#DC2626] font-bold">
                  Delete SKU?
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteProduct(product.id)}
                  disabled={isPending}
                  className="px-3 py-1.5 rounded-lg bg-[#DC2626] hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                  <span>Confirm</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-neutral-700 text-[#64748B] text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDeleteId(product.id)}
                className="px-3 py-2 rounded-lg border border-[#FECACA] text-[#DC2626] dark:border-rose-900/50 dark:text-rose-400 hover:bg-[#FEF2F2] dark:hover:bg-rose-950/30 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            )
          )}

          {canUpdate && (
            <button
              form="sheet-edit-product-form"
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-lg bg-[#E3530F] hover:bg-[#C2410C] text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-2 ml-auto cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>Save Changes</span>
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
