"use client";

import * as React from "react";
import { canX } from "@/lib/permissions";
import { useProductManager } from "../../../inventory/products/hooks/use-product-manager";
import { ProductsOperationsClientProps } from "./types";
import { ProductDataTable } from "./product-data-table";
import { ProductDetailSheet } from "./product-detail-sheet";
import { CreateProductDialog } from "./create-product-dialog";

export function ProductsOperationsClient({
  companyId,
  products,
  stockSummaries = {},
  userRole,
}: ProductsOperationsClientProps) {
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
    closeProductSheet,
    handleCreateSubmit,
    handleEditSubmit,
    handleDeleteProduct,
  } = useProductManager(companyId, products);

  const canCreate = canX(userRole, { id: companyId }, "product:create");
  const canUpdate = canX(userRole, { id: companyId }, "product:update");
  const canDelete = canX(userRole, { id: companyId }, "product:delete");

  return (
    <div className="space-y-6">
      {/* Full-width Ledgerly Data Table */}
      <ProductDataTable
        products={products}
        stockSummaries={stockSummaries}
        selectedProductId={selectedProduct?.id}
        onSelectProduct={openProductSheet}
        canCreate={canCreate}
        onOpenCreate={openCreateDialog}
      />

      {/* Slide-over Product Detail Sheet */}
      <ProductDetailSheet
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={closeProductSheet}
        stockSummary={
          selectedProduct ? stockSummaries[selectedProduct.id] : undefined
        }
        canUpdate={canUpdate}
        canDelete={canDelete}
        isPending={isPending}
        confirmDeleteId={confirmDeleteId}
        setConfirmDeleteId={setConfirmDeleteId}
        onDeleteProduct={handleDeleteProduct}
        onEditSubmit={handleEditSubmit}
        errorMessage={errorMessage}
        successMessage={successMessage}
      />

      {/* Create Product Dialog */}
      <CreateProductDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        isPending={isPending}
        errorMessage={errorMessage}
      />
    </div>
  );
}
