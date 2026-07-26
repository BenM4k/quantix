import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Customer } from "@/services/drizzle/schemas";
import { createCustomerAction, updateCustomerAction, deleteCustomerAction } from "../actions";
import { CustomerInput } from "@/lib/schemas/customer";

export function useCustomerManager(companyId: string, customers: Customer[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCustomerId = searchParams.get("selected");

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (selectedCustomerId) {
      const found = customers.find((c) => c.id === selectedCustomerId);
      if (found) {
        setSelectedCustomer(found);
      }
    } else {
      setSelectedCustomer(null);
    }
  }, [selectedCustomerId, customers]);

  const openCreateDialog = () => {
    setErrorMessage(null);
    setIsCreateOpen(true);
  };

  const openCustomerSheet = (customer: Customer) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("selected", customer.id);
    router.push(`${pathname}?${params.toString()}`);
  };

  const closeCustomerSheet = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("selected");
    router.push(`${pathname}?${params.toString()}`);
    setSelectedCustomer(null);
  };

  const handleCreateSubmit = (data: CustomerInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await createCustomerAction(companyId, data);
      if (res.ok) {
        setIsCreateOpen(false);
      } else {
        setErrorMessage(res.error.message);
      }
    });
  };

  const handleEditSubmit = (data: CustomerInput) => {
    if (!selectedCustomer) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await updateCustomerAction(companyId, selectedCustomer.id, data);
      if (res.ok) {
        setSuccessMessage("Customer updated successfully.");
      } else {
        setErrorMessage(res.error.message);
      }
    });
  };

  const handleDeleteCustomer = (id: string) => {
    startTransition(async () => {
      const res = await deleteCustomerAction(companyId, id);
      if (res.ok) {
        setConfirmDeleteId(null);
        closeCustomerSheet();
      } else {
        setErrorMessage(res.error.message);
      }
    });
  };

  return {
    isCreateOpen,
    setIsCreateOpen,
    selectedCustomer,
    errorMessage,
    setErrorMessage,
    successMessage,
    isPending,
    confirmDeleteId,
    setConfirmDeleteId,
    openCreateDialog,
    openCustomerSheet,
    closeCustomerSheet,
    handleCreateSubmit,
    handleEditSubmit,
    handleDeleteCustomer,
  };
}
