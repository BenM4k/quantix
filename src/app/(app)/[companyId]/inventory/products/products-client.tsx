"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product } from "@/services/drizzle/schemas";
import { canX } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { productSchema, type ProductInput } from "@/lib/schemas/product";
import { useProductManager } from "./hooks/use-product-manager";
import { ImageUploadField } from "@/components/image-upload-field";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Package,
  X,
  Trash2,
  Loader2,
  AlertCircle,
  Search,
  ChevronDown,
  ArrowUpRight,
  Layers,
  DollarSign,
} from "lucide-react";
import {
  SplitPanelShell,
  ListRow,
  EmptyState,
} from "@/components/layout/split-panel-shell";

const fmt = (v: string | number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(v) || 0);

interface ProductsClientProps {
  companyId: string;
  products: Product[];
  totalProducts: number;
  stockSummaries?: Record<
    string,
    { quantityOnHand: string; averageCost: string }
  >;
  userRole: string;
}

function ProductDetailPanel({
  product,
  companyId,
  userRole,
  stockSummary,
  isPending,
  confirmDeleteId,
  setConfirmDeleteId,
  handleDeleteProduct,
  editForm,
  handleEditSubmit,
  successMessage,
  errorMessage,
  canUpdate,
  canDelete,
}: {
  product: Product | null;
  companyId: string;
  userRole: string;
  stockSummary?: { quantityOnHand: string; averageCost: string };
  isPending: boolean;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  handleDeleteProduct: (id: string) => void;
  editForm: ReturnType<typeof useForm<ProductInput>>;
  handleEditSubmit: (data: ProductInput) => void;
  successMessage: string | null;
  errorMessage: string | null;
  canUpdate: boolean;
  canDelete: boolean;
}) {
  if (!product) {
    return (
      <EmptyState
        icon={Package}
        title="Select a product"
        description="Click any product SKU on the left to inspect stock valuations and pricing."
      />
    );
  }

  const qty = stockSummary ? Number(stockSummary.quantityOnHand) : 0;
  const avgCost = stockSummary
    ? Number(stockSummary.averageCost)
    : Number(product.costPrice);
  const totalValuation = qty * avgCost;

  return (
    <div className="flex flex-col h-full justify-between gap-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold text-sm shrink-0 overflow-hidden">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-6 w-6 text-indigo-300" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-white truncate">
                {product.name}
              </h2>
              <p className="text-xs text-indigo-300 font-mono mt-0.5">
                SKU: {product.sku} · {product.uom}
              </p>
            </div>
          </div>

          <span
            className={cn(
              "text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0",
              product.active
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-white/10 text-zinc-400 border-white/10",
            )}
          >
            {product.active ? "Active SKU" : "Archived"}
          </span>
        </div>

        {/* Metric Cards Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-primary/20 border border-primary/25 p-4">
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              Quantity on Hand
            </span>
            <p className="text-xl font-black text-foreground mt-1 font-mono">
              {qty}{" "}
              <span className="text-xs font-normal text-foreground/70">
                {product.uom}
              </span>
            </p>
          </div>

          <div className="rounded-2xl bg-primary/20 border border-primary/25 p-4">
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              Average Unit Cost
            </span>
            <p className="text-xl font-black text-foreground mt-1 font-mono">
              {fmt(avgCost)}
            </p>
          </div>

          <div className="rounded-2xl bg-primary/20 border border-primary/25 p-4">
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              Live Stock Value
            </span>
            <p className="text-xl font-black text-foreground mt-1 font-mono">
              {fmt(totalValuation)}
            </p>
          </div>
        </div>

        {/* Edit Form */}
        {canUpdate && (
          <div className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-2xl text-xs bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-3 rounded-2xl text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                {successMessage}
              </div>
            )}
            <form
              id="edit-prod-form"
              onSubmit={editForm.handleSubmit(handleEditSubmit)}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-foreground/80 block mb-1">
                    Sell Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...editForm.register("sellPrice", { valueAsNumber: true })}
                    className="w-full px-3 py-2 rounded-xl bg-background/80 border border-border text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-foreground/80 block mb-1">
                    Cost Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...editForm.register("costPrice", { valueAsNumber: true })}
                    className="w-full px-3 py-2 rounded-xl bg-background/80 border border-border text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-foreground/80 block mb-1">
                    Unit of Measure
                  </label>
                  <select
                    {...editForm.register("uom")}
                    className="w-full px-3 py-2 rounded-xl bg-background/80 border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="unit">Unit</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="meter">Meter (m)</option>
                    <option value="liter">Liter (l)</option>
                    <option value="box">Box</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-foreground/80 block mb-1">
                    Reorder Alert Threshold
                  </label>
                  <input
                    type="number"
                    {...editForm.register("reorderThreshold", {
                      setValueAs: (v) =>
                        v === "" || v === null ? null : Number(v),
                    })}
                    placeholder="e.g. 10"
                    className="w-full px-3 py-2 rounded-xl bg-background/80 border border-border text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="pt-5 border-t border-primary/25 flex items-center justify-between gap-3">
        {canDelete &&
          (confirmDeleteId === product.id ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">
                Confirm delete?
              </span>
              <button
                type="button"
                onClick={() => handleDeleteProduct(product.id)}
                disabled={isPending}
                className="px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors flex items-center gap-1.5"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Delete</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-2 rounded-full bg-primary/20 text-foreground text-xs font-semibold hover:bg-primary/30"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDeleteId(product.id)}
              className="h-10 px-4 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300 text-xs font-semibold hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete SKU</span>
            </button>
          ))}

        {canUpdate && (
          <button
            form="edit-prod-form"
            type="submit"
            disabled={isPending}
            className="h-10 px-6 rounded-full bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2 ml-auto"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
            <span>Save Changes</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function ProductsClient({
  companyId,
  products,
  totalProducts,
  stockSummaries = {},
  userRole,
}: ProductsClientProps) {
  const {
    isCreateOpen,
    setIsCreateOpen,
    selectedProduct,
    errorMessage,
    successMessage,
    isPending,
    confirmDeleteId,
    setConfirmDeleteId,
    openCreateDialog,
    openProductSheet,
    handleCreateSubmit,
    handleEditSubmit,
    handleDeleteProduct,
  } = useProductManager(companyId, products);

  const canCreate = canX(userRole, { id: companyId }, "product:create");
  const canUpdate = canX(userRole, { id: companyId }, "product:update");
  const canDelete = canX(userRole, { id: companyId }, "product:delete");

  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<string>("all");

  const createForm = useForm<ProductInput>({
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

  const editForm = useForm<ProductInput>({
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
    if (selectedProduct) {
      editForm.reset({
        id: selectedProduct.id,
        sku: selectedProduct.sku,
        name: selectedProduct.name,
        uom: selectedProduct.uom,
        sellPrice: Number(selectedProduct.sellPrice),
        costPrice: Number(selectedProduct.costPrice),
        reorderThreshold: selectedProduct.reorderThreshold
          ? Number(selectedProduct.reorderThreshold)
          : null,
        imageUrl: selectedProduct.imageUrl,
        active: selectedProduct.active,
      });
    }
  }, [selectedProduct, editForm]);

  const filtered = products.filter((p) => {
    const matches =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    if (!matches) return false;
    const summary = stockSummaries[p.id];
    const qty = summary ? Number(summary.quantityOnHand) : 0;
    if (activeTab === "in_stock") return qty > 0;
    if (activeTab === "low_stock")
      return p.reorderThreshold && qty <= Number(p.reorderThreshold);
    return true;
  });

  const inStockCount = products.filter((p) => {
    const s = stockSummaries[p.id];
    return s && Number(s.quantityOnHand) > 0;
  }).length;

  return (
    <>
      <SplitPanelShell
        title="Product Master"
        subtitle={`${totalProducts} total SKUs · catalog parameters and stock valuation`}
        headerAction={
          canCreate && (
            <button
              onClick={openCreateDialog}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Create Product</span>
            </button>
          )
        }
        filterToolbar={
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-foreground text-background font-bold text-xs shadow-xs">
                <span>Active filters</span>
                <span className="h-4 w-4 rounded-full bg-background text-foreground text-[10px] flex items-center justify-center font-bold">
                  {search ? 1 : 0}
                </span>
              </span>

              <button className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border/80 bg-card text-foreground font-semibold hover:bg-muted transition-colors">
                <span>All units</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search SKU or name..."
                  className="pl-9 pr-4 h-9 text-xs rounded-full border border-border/80 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-48 sm:w-56"
                />
              </div>
            </div>
          </>
        }
        listTabs={
          <>
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                activeTab === "all"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              All SKUs
            </button>
            <button
              onClick={() => setActiveTab("in_stock")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5",
                activeTab === "in_stock"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              <span>In Stock</span>
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                  activeTab === "in_stock"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                {inStockCount}
              </span>
            </button>
          </>
        }
        listTitle="Product Catalog"
        listChildren={
          filtered.length === 0 ? (
            <EmptyState icon={Package} title="No products found" />
          ) : (
            filtered.map((prod) => {
              const summary = stockSummaries[prod.id];
              const qty = summary ? Number(summary.quantityOnHand) : 0;
              return (
                <ListRow
                  key={prod.id}
                  id={prod.id}
                  primary={prod.name}
                  secondary={prod.sku}
                  meta={`Stock: ${qty} ${prod.uom}`}
                  amount={fmt(prod.sellPrice)}
                  selected={selectedProduct?.id === prod.id}
                  onClick={() => openProductSheet(prod)}
                  badge={
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                        prod.active
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-white/10 text-zinc-400 border-white/10",
                      )}
                    >
                      {prod.active ? "Active" : "Draft"}
                    </span>
                  }
                />
              );
            })
          )
        }
        detailChildren={
          <ProductDetailPanel
            product={selectedProduct}
            companyId={companyId}
            userRole={userRole}
            stockSummary={
              selectedProduct ? stockSummaries[selectedProduct.id] : undefined
            }
            isPending={isPending}
            confirmDeleteId={confirmDeleteId}
            setConfirmDeleteId={setConfirmDeleteId}
            handleDeleteProduct={handleDeleteProduct}
            editForm={editForm}
            handleEditSubmit={handleEditSubmit}
            successMessage={successMessage}
            errorMessage={errorMessage}
            canUpdate={canUpdate}
            canDelete={canDelete}
          />
        }
      />

      {/* Create Product Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <h3 className="text-xl font-bold text-foreground">
                Create New Product
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={createForm.handleSubmit(handleCreateSubmit)}
              className="space-y-4"
            >
              <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>SKU Code *</FieldLabel>
                    <Input
                      {...createForm.register("sku")}
                      placeholder="SKU-001"
                    />
                    {createForm.formState.errors.sku && (
                      <FieldError>
                        {createForm.formState.errors.sku.message}
                      </FieldError>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel>Product Name *</FieldLabel>
                    <Input
                      {...createForm.register("name")}
                      placeholder="Item title"
                    />
                    {createForm.formState.errors.name && (
                      <FieldError>
                        {createForm.formState.errors.name.message}
                      </FieldError>
                    )}
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field>
                    <FieldLabel>Unit (UOM)</FieldLabel>
                    <select
                      {...createForm.register("uom")}
                      className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-sm"
                    >
                      <option value="unit">Unit</option>
                      <option value="kg">Kilogram</option>
                      <option value="meter">Meter</option>
                      <option value="liter">Liter</option>
                      <option value="box">Box</option>
                    </select>
                  </Field>
                  <Field>
                    <FieldLabel>Sell Price ($)</FieldLabel>
                    <Input
                      type="number"
                      step="0.01"
                      {...createForm.register("sellPrice", {
                        valueAsNumber: true,
                      })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Cost Price ($)</FieldLabel>
                    <Input
                      type="number"
                      step="0.01"
                      {...createForm.register("costPrice", {
                        valueAsNumber: true,
                      })}
                    />
                  </Field>
                </div>
              </FieldGroup>
              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Save Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
