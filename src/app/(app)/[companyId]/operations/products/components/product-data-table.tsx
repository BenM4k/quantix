"use client";

import * as React from "react";
import { Product } from "@/services/drizzle/schemas";
import { StockSummary } from "./types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, Search, Plus, ArrowUpRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const fmt = (v: string | number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(v) || 0);

interface ProductDataTableProps {
  products: Product[];
  stockSummaries: Record<string, StockSummary>;
  selectedProductId?: string | null;
  onSelectProduct: (product: Product) => void;
  canCreate: boolean;
  onOpenCreate: () => void;
}

export function ProductDataTable({
  products,
  stockSummaries,
  selectedProductId,
  onSelectProduct,
  canCreate,
  onOpenCreate,
}: ProductDataTableProps) {
  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"all" | "in_stock" | "low_stock">("all");

  const filtered = React.useMemo(() => {
    return products.filter((p) => {
      const matches =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      if (!matches) return false;

      const summary = stockSummaries[p.id];
      const qty = summary ? Number(summary.quantityOnHand) : 0;
      if (activeTab === "in_stock") return qty > 0;
      if (activeTab === "low_stock")
        return p.reorderThreshold !== null && qty <= Number(p.reorderThreshold);
      return true;
    });
  }, [products, search, activeTab, stockSummaries]);

  const inStockCount = products.filter((p) => {
    const s = stockSummaries[p.id];
    return s && Number(s.quantityOnHand) > 0;
  }).length;

  const lowStockCount = products.filter((p) => {
    const s = stockSummaries[p.id];
    const qty = s ? Number(s.quantityOnHand) : 0;
    return p.reorderThreshold !== null && qty <= Number(p.reorderThreshold);
  }).length;

  return (
    <div className="space-y-4">
      {/* Ledgerly Filter Controls & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Tabs & Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Subtle Tab Segment */}
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#F1F5F9] dark:bg-neutral-900 border border-[#E2E8F0] dark:border-neutral-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer",
                activeTab === "all"
                  ? "bg-white dark:bg-neutral-800 text-[#0F172A] dark:text-white shadow-xs font-semibold"
                  : "text-[#64748B] dark:text-neutral-400 hover:text-[#0F172A] dark:hover:text-white",
              )}
            >
              All items ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("in_stock")}
              className={cn(
                "px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer",
                activeTab === "in_stock"
                  ? "bg-white dark:bg-neutral-800 text-[#0F172A] dark:text-white shadow-xs font-semibold"
                  : "text-[#64748B] dark:text-neutral-400 hover:text-[#0F172A] dark:hover:text-white",
              )}
            >
              In stock ({inStockCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("low_stock")}
              className={cn(
                "px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer",
                activeTab === "low_stock"
                  ? "bg-white dark:bg-neutral-800 text-[#D97706] shadow-xs font-semibold"
                  : "text-[#64748B] dark:text-neutral-400 hover:text-[#0F172A] dark:hover:text-white",
              )}
            >
              <span>Low stock</span>
              {lowStockCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#92400E]">
                  {lowStockCount}
                </span>
              )}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#64748B] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or SKU..."
              className="pl-8.5 pr-3 h-8.5 text-xs rounded-lg border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[#0F172A] dark:text-neutral-100 placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#E3530F] w-48 sm:w-60 shadow-xs"
            />
          </div>
        </div>

        {/* Right: Primary Create Button (Ledgerly Orange #E3530F) */}
        {canCreate && (
          <button
            type="button"
            onClick={onOpenCreate}
            className="px-4 py-2 rounded-lg bg-[#E3530F] hover:bg-[#C2410C] text-white font-medium text-xs transition-all duration-150 shadow-xs hover:shadow-sm inline-flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Product</span>
          </button>
        )}
      </div>

      {/* Ledgerly Data Table Card */}
      <div className="rounded-xl border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
        {/* Table Top Title Bar */}
        <div className="px-5 py-4 border-b border-[#F1F5F9] dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-neutral-100">
              Product catalog
            </h3>
            <p className="text-xs text-[#64748B] dark:text-neutral-400">
              {filtered.length} {filtered.length === 1 ? "item" : "items"} listed
            </p>
          </div>
          <span className="text-xs text-[#64748B] font-mono">
            USD ($)
          </span>
        </div>

        <Table>
          <TableHeader className="bg-[#F8FAFC] dark:bg-neutral-900/90 border-b border-[#E2E8F0] dark:border-neutral-800">
            <TableRow className="hover:bg-transparent border-[#E2E8F0] dark:border-neutral-800">
              <TableHead className="py-3 pl-5 text-[10px] sm:text-[11px] font-bold text-[#64748B] dark:text-neutral-400 uppercase tracking-widest">
                DESCRIPTION / SKU
              </TableHead>
              <TableHead className="py-3 text-[10px] sm:text-[11px] font-bold text-[#64748B] dark:text-neutral-400 uppercase tracking-widest">
                UOM
              </TableHead>
              <TableHead className="py-3 text-right text-[10px] sm:text-[11px] font-bold text-[#64748B] dark:text-neutral-400 uppercase tracking-widest">
                QTY ON HAND
              </TableHead>
              <TableHead className="py-3 text-right text-[10px] sm:text-[11px] font-bold text-[#64748B] dark:text-neutral-400 uppercase tracking-widest">
                SELL PRICE
              </TableHead>
              <TableHead className="py-3 text-right text-[10px] sm:text-[11px] font-bold text-[#64748B] dark:text-neutral-400 uppercase tracking-widest">
                AVG COST
              </TableHead>
              <TableHead className="py-3 text-right text-[10px] sm:text-[11px] font-bold text-[#64748B] dark:text-neutral-400 uppercase tracking-widest">
                VALUATION
              </TableHead>
              <TableHead className="py-3 text-center text-[10px] sm:text-[11px] font-bold text-[#64748B] dark:text-neutral-400 uppercase tracking-widest">
                STATUS
              </TableHead>
              <TableHead className="py-3 pr-5 text-right text-[10px] sm:text-[11px] font-bold text-[#64748B] dark:text-neutral-400 uppercase tracking-widest">
                DETAILS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-[#F1F5F9] dark:divide-neutral-800/80 text-xs">
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Package className="h-8 w-8 text-[#64748B] stroke-1" />
                    <p className="text-sm font-semibold text-[#0F172A] dark:text-neutral-100">
                      No products found
                    </p>
                    <p className="text-xs text-[#64748B] max-w-sm">
                      {search
                        ? `No items match "${search}". Try adjusting your search query.`
                        : "Your catalog is empty. Click Create Product to add your first SKU."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product) => {
                const summary = stockSummaries[product.id];
                const qty = summary ? Number(summary.quantityOnHand) : 0;
                const cost = summary ? Number(summary.averageCost) : Number(product.costPrice);
                const valuation = qty * cost;
                const isSelected = selectedProductId === product.id;
                const isLowStock = product.reorderThreshold !== null && qty <= Number(product.reorderThreshold);

                return (
                  <TableRow
                    key={product.id}
                    onClick={() => onSelectProduct(product)}
                    className={cn(
                      "cursor-pointer transition-colors border-[#F1F5F9] dark:border-neutral-800/60 group",
                      isSelected
                        ? "bg-[#FFF7F3] dark:bg-neutral-800/90"
                        : "hover:bg-[#F8FAFC] dark:hover:bg-neutral-800/50",
                    )}
                  >
                    {/* Description & SKU */}
                    <TableCell className="py-3 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[#F8FAFC] dark:bg-neutral-800 border border-[#E2E8F0] dark:border-neutral-700 flex items-center justify-center text-[#E3530F] font-bold text-xs shrink-0 overflow-hidden">
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-4 w-4 text-[#E3530F]" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-[#0F172A] dark:text-neutral-100 group-hover:text-[#E3530F] transition-colors">
                            {product.name}
                          </div>
                          <div className="text-[11px] text-[#64748B] font-mono">
                            {product.sku}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* UOM */}
                    <TableCell className="py-3 text-[#64748B] dark:text-neutral-300 capitalize">
                      {product.uom}
                    </TableCell>

                    {/* Quantity on Hand */}
                    <TableCell className="py-3 text-right font-mono">
                      <span className={cn(
                        "font-medium",
                        qty === 0 ? "text-[#64748B]" : isLowStock ? "text-[#D97706]" : "text-[#0F172A] dark:text-neutral-100"
                      )}>
                        {qty.toLocaleString("en-US")}
                      </span>
                      {isLowStock && qty > 0 && (
                        <AlertTriangle className="inline-block w-3 h-3 ml-1 text-[#D97706] -mt-0.5" />
                      )}
                    </TableCell>

                    {/* Sell Price */}
                    <TableCell className="py-3 text-right font-mono font-medium text-[#0F172A] dark:text-neutral-100">
                      {fmt(product.sellPrice)}
                    </TableCell>

                    {/* Avg Cost */}
                    <TableCell className="py-3 text-right font-mono text-[#64748B] dark:text-neutral-400">
                      {fmt(cost)}
                    </TableCell>

                    {/* Valuation */}
                    <TableCell className="py-3 text-right font-mono font-semibold text-[#0F172A] dark:text-neutral-100">
                      {fmt(valuation)}
                    </TableCell>

                    {/* Status (matching Ledgerly: ● Posted / ● Active / ● Low Stock) */}
                    <TableCell className="py-3 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-semibold",
                          !product.active
                            ? "text-[#64748B]"
                            : isLowStock
                            ? "text-[#D97706]"
                            : "text-[#16A34A]",
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            !product.active
                              ? "bg-[#64748B]"
                              : isLowStock
                              ? "bg-[#D97706]"
                              : "bg-[#16A34A]",
                          )}
                        />
                        <span>
                          {!product.active ? "Archived" : isLowStock ? "Low stock" : "Active"}
                        </span>
                      </span>
                    </TableCell>

                    {/* Details Action */}
                    <TableCell className="py-3 pr-5 text-right">
                      <span className="inline-flex items-center text-xs font-medium text-[#64748B] group-hover:text-[#E3530F] transition-colors">
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
