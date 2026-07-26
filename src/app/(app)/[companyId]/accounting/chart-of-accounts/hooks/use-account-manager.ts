import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { LedgerAccount } from "@/services/drizzle/schemas";
import { createAccountAction, updateAccountAction } from "../actions";
import { CreateAccountInput, UpdateAccountInput } from "@/lib/schemas/accounting";

export function useAccountManager(companyId: string, accounts: LedgerAccount[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedAccountId = searchParams.get("selected");

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [selectedAccount, setSelectedAccount] = React.useState<LedgerAccount | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (selectedAccountId) {
      const found = accounts.find((a) => a.id === selectedAccountId);
      if (found) {
        setSelectedAccount(found);
      }
    } else {
      setSelectedAccount(null);
    }
  }, [selectedAccountId, accounts]);

  const openCreateDialog = () => {
    setErrorMessage(null);
    setIsCreateOpen(true);
  };

  const openAccountSheet = (account: LedgerAccount) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("selected", account.id);
    router.push(`${pathname}?${params.toString()}`);
  };

  const closeAccountSheet = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("selected");
    router.push(`${pathname}?${params.toString()}`);
    setSelectedAccount(null);
  };

  const handleCreateSubmit = (data: CreateAccountInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await createAccountAction(companyId, data);
      if (res.ok) {
        setIsCreateOpen(false);
      } else {
        setErrorMessage(res.error.message);
      }
    });
  };

  const handleEditSubmit = (data: UpdateAccountInput) => {
    if (!selectedAccount) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await updateAccountAction(companyId, selectedAccount.id, data);
      if (res.ok) {
        setSuccessMessage("Account updated successfully.");
      } else {
        setErrorMessage(res.error.message);
      }
    });
  };

  return {
    isCreateOpen,
    setIsCreateOpen,
    selectedAccount,
    errorMessage,
    setErrorMessage,
    successMessage,
    isPending,
    openCreateDialog,
    openAccountSheet,
    closeAccountSheet,
    handleCreateSubmit,
    handleEditSubmit,
  };
}
