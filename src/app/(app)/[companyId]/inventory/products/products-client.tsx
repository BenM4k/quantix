"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Product } from "@/services/drizzle/schemas";
import { canX } from "@/lib/permissions";
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
import { Plus, Package, X, Trash2, Loader2, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

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
    setErrorMessage,
    successMessage,
    isPending,
    confirmDeleteId,
    setConfirmDeleteId,
    openCreateDialog,
    openProductSheet,
    closeProductSheet,
    handleCreateSubmit,
    handleEditSubmit,
    handleDeleteProduct,
  } = useProductManager(companyId, products);

  const selectedStockSummary = selectedProduct
    ? stockSummaries[selectedProduct.id]
    : undefined;

  const canCreate = canX(userRole, { id: companyId }, "product:create");
  const canUpdate = canX(userRole, { id: companyId }, "product:update");
  const canDelete = canX(userRole, { id: companyId }, "product:delete");

  // Create Form
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

  // Edit Form
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

  // Sync edit form with selected product
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

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-card border border-border flex items-center justify-center overflow-hidden shrink-0">
            {row.original.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.original.imageUrl}
                alt={row.original.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="font-semibold text-foreground">
              {row.original.name}
            </div>
            <div className="text-xs text-muted-foreground">
              SKU: {row.original.sku}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "sellPrice",
      header: "Sell Price",
      cell: ({ row }) => (
        <span className="font-mono text-sm">${row.original.sellPrice}</span>
      ),
    },
    {
      accessorKey: "costPrice",
      header: "Cost Price",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">
          ${row.original.costPrice}
        </span>
      ),
    },
    {
      accessorKey: "uom",
      header: "UOM",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground capitalize">
          {row.original.uom}
        </span>
      ),
    },
    {
      accessorKey: "reorderThreshold",
      header: "Low-Stock Alert",
      cell: ({ row }) => {
        const threshold = row.original.reorderThreshold;
        if (!threshold)
          return <span className="text-xs text-muted-foreground">None</span>;
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertCircle className="h-3 w-3" />
            Min Qty: {threshold}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Master"
        description="Manage company catalog, units of measure, sell/cost pricing, and low-stock reorder thresholds."
        icon={Package}
        actions={
          canCreate ? (
            <Button
              onClick={openCreateDialog}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Product</span>
            </Button>
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        data={products}
        total={totalProducts}
        onRowClick={openProductSheet}
        searchPlaceholder="Search products by SKU or name..."
      />

      {/* Create Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-surface-elevated border border-border/80 rounded-3xl p-8 md:p-10 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                Create New Product
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-xl text-xs bg-destructive/10 text-destructive border border-destructive/20 font-medium">
                {errorMessage}
              </div>
            )}

            <form
              onSubmit={createForm.handleSubmit(handleCreateSubmit)}
              className="space-y-6"
            >
              <FieldGroup>
                <Field>
                  <ImageUploadField
                    label="Product Image (Optional)"
                    value={createForm.watch("imageUrl")}
                    onChange={(url) =>
                      createForm.setValue("imageUrl", url, {
                        shouldValidate: true,
                      })
                    }
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="create-sku">SKU *</FieldLabel>
                    <Input
                      id="create-sku"
                      {...createForm.register("sku")}
                      placeholder="PROD-001"
                    />
                    {createForm.formState.errors.sku && (
                      <FieldError>
                        {createForm.formState.errors.sku.message}
                      </FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="create-name">Name *</FieldLabel>
                    <Input
                      id="create-name"
                      {...createForm.register("name")}
                      placeholder="Wireless Mouse"
                    />
                    {createForm.formState.errors.name && (
                      <FieldError>
                        {createForm.formState.errors.name.message}
                      </FieldError>
                    )}
                  </Field>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Field>
                    <FieldLabel htmlFor="create-uom">UOM *</FieldLabel>
                    <select
                      id="create-uom"
                      {...createForm.register("uom")}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="unit">Unit</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="meter">Meter (m)</option>
                      <option value="liter">Liter (l)</option>
                      <option value="box">Box</option>
                    </select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="create-sell">
                      Sell Price ($) *
                    </FieldLabel>
                    <Input
                      id="create-sell"
                      type="number"
                      step="0.01"
                      {...createForm.register("sellPrice", {
                        valueAsNumber: true,
                      })}
                    />
                    {createForm.formState.errors.sellPrice && (
                      <FieldError>
                        {createForm.formState.errors.sellPrice.message}
                      </FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="create-cost">
                      Cost Price ($) *
                    </FieldLabel>
                    <Input
                      id="create-cost"
                      type="number"
                      step="0.01"
                      {...createForm.register("costPrice", {
                        valueAsNumber: true,
                      })}
                    />
                    {createForm.formState.errors.costPrice && (
                      <FieldError>
                        {createForm.formState.errors.costPrice.message}
                      </FieldError>
                    )}
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="create-reorder">
                    Low-Stock Alert Threshold (Optional)
                  </FieldLabel>
                  <Input
                    id="create-reorder"
                    type="number"
                    placeholder="e.g. 10"
                    {...createForm.register("reorderThreshold", {
                      setValueAs: (v) =>
                        v === "" || v === null ? null : Number(v),
                    })}
                  />
                  {createForm.formState.errors.reorderThreshold && (
                    <FieldError>
                      {createForm.formState.errors.reorderThreshold.message}
                    </FieldError>
                  )}
                </Field>
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
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Save Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Details Sheet */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border-l border-border/80 h-full p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    SKU: {selectedProduct.sku}
                  </p>
                </div>
                <button
                  onClick={closeProductSheet}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg text-xs bg-destructive/10 text-destructive border border-destructive/20">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-lg text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {successMessage}
                </div>
              )}

              {/* Read-Only Stock Ledger Info */}
              <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Stock Summary (Read-Only)
                </div>
                <div className="grid grid-cols-3 gap-3 text-center sm:text-left">
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Qty on Hand
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      {selectedStockSummary?.quantityOnHand ?? "0"}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        {selectedProduct.uom}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Average Cost
                    </div>
                    <div className="text-sm font-bold font-mono text-foreground">
                      $
                      {Number(selectedStockSummary?.averageCost ?? 0).toFixed(
                        2,
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Stock Value
                    </div>
                    <div className="text-sm font-bold font-mono text-primary">
                      $
                      {(
                        Number(selectedStockSummary?.quantityOnHand ?? 0) *
                        Number(selectedStockSummary?.averageCost ?? 0)
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <form
                id="edit-product-form"
                onSubmit={editForm.handleSubmit(handleEditSubmit)}
                className="space-y-4"
              >
                <FieldGroup>
                  <Field>
                    <ImageUploadField
                      label="Product Image"
                      value={editForm.watch("imageUrl")}
                      onChange={(url) =>
                        editForm.setValue("imageUrl", url, {
                          shouldValidate: true,
                        })
                      }
                      disabled={!canUpdate}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="edit-sku">SKU</FieldLabel>
                      <Input
                        id="edit-sku"
                        disabled={!canUpdate}
                        {...editForm.register("sku")}
                      />
                      {editForm.formState.errors.sku && (
                        <FieldError>
                          {editForm.formState.errors.sku.message}
                        </FieldError>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="edit-name">Name</FieldLabel>
                      <Input
                        id="edit-name"
                        disabled={!canUpdate}
                        {...editForm.register("name")}
                      />
                      {editForm.formState.errors.name && (
                        <FieldError>
                          {editForm.formState.errors.name.message}
                        </FieldError>
                      )}
                    </Field>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Field>
                      <FieldLabel htmlFor="edit-uom">UOM</FieldLabel>
                      <select
                        id="edit-uom"
                        disabled={!canUpdate}
                        {...editForm.register("uom")}
                        className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                      >
                        <option value="unit">Unit</option>
                        <option value="kg">Kilogram (kg)</option>
                        <option value="meter">Meter (m)</option>
                        <option value="liter">Liter (l)</option>
                        <option value="box">Box</option>
                      </select>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="edit-sell">
                        Sell Price ($)
                      </FieldLabel>
                      <Input
                        id="edit-sell"
                        type="number"
                        step="0.01"
                        disabled={!canUpdate}
                        {...editForm.register("sellPrice", {
                          valueAsNumber: true,
                        })}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="edit-cost">
                        Cost Price ($)
                      </FieldLabel>
                      <Input
                        id="edit-cost"
                        type="number"
                        step="0.01"
                        disabled={!canUpdate}
                        {...editForm.register("costPrice", {
                          valueAsNumber: true,
                        })}
                      />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="edit-reorder">
                      Low-Stock Alert Threshold
                    </FieldLabel>
                    <Input
                      id="edit-reorder"
                      type="number"
                      disabled={!canUpdate}
                      {...editForm.register("reorderThreshold", {
                        setValueAs: (v) =>
                          v === "" || v === null ? null : Number(v),
                      })}
                    />
                  </Field>
                </FieldGroup>
              </form>
            </div>

            <div className="pt-6 border-t border-border/40 flex items-center justify-between">
              {canDelete ? (
                confirmDeleteId === selectedProduct.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-destructive font-medium">
                      Confirm?
                    </span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteProduct(selectedProduct.id)}
                      disabled={isPending}
                    >
                      Yes, Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmDeleteId(selectedProduct.id)}
                    className="text-destructive border-destructive/20 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete Product
                  </Button>
                )
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={closeProductSheet}>
                  Close
                </Button>
                {canUpdate && (
                  <Button
                    form="edit-product-form"
                    type="submit"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Save Changes
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
