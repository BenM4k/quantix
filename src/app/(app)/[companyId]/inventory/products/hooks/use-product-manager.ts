import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Product } from "@/services/drizzle/schemas";
import { createProductAction, updateProductAction, deleteProductAction } from "../actions";
import { ProductInput } from "@/lib/schemas/product";

export function useProductManager(companyId: string, products: Product[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedProductId = searchParams.get("selected");

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (selectedProductId) {
      const found = products.find((p) => p.id === selectedProductId);
      if (found) {
        setSelectedProduct(found);
      }
    } else {
      setSelectedProduct(null);
    }
  }, [selectedProductId, products]);

  const openCreateDialog = () => {
    setErrorMessage(null);
    setIsCreateOpen(true);
  };

  const openProductSheet = (product: Product) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("selected", product.id);
    router.push(`${pathname}?${params.toString()}`);
  };

  const closeProductSheet = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("selected");
    router.push(`${pathname}?${params.toString()}`);
    setSelectedProduct(null);
  };

  const handleCreateSubmit = (data: ProductInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await createProductAction(companyId, data);
      if (res.ok) {
        setIsCreateOpen(false);
      } else {
        setErrorMessage(res.error.message);
      }
    });
  };

  const handleEditSubmit = (data: ProductInput) => {
    if (!selectedProduct) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await updateProductAction(companyId, selectedProduct.id, data);
      if (res.ok) {
        setSuccessMessage("Product updated successfully.");
      } else {
        setErrorMessage(res.error.message);
      }
    });
  };

  const handleDeleteProduct = (id: string) => {
    startTransition(async () => {
      const res = await deleteProductAction(companyId, id);
      if (res.ok) {
        setConfirmDeleteId(null);
        closeProductSheet();
      } else {
        setErrorMessage(res.error.message);
      }
    });
  };

  return {
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
  };
}
