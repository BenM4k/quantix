import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { reverseJournalEntryAction } from "../actions";
import { JournalEntryDetail } from "../types";

export function useJournalEntryManager(
  companyId: string,
  selectedEntryDetail: JournalEntryDetail | null,
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isReverseDialogOpen, setIsReverseDialogOpen] = React.useState(false);
  const [reverseReason, setReverseReason] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const openEntrySheet = (entryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("selected", entryId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const closeEntrySheet = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("selected");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReverseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntryDetail) return;
    setErrorMessage(null);

    startTransition(async () => {
      const res = await reverseJournalEntryAction(
        companyId,
        selectedEntryDetail.id,
        reverseReason,
      );
      if (res.ok) {
        setIsReverseDialogOpen(false);
        setReverseReason("");
        // Redirect to new reversal entry detail
        const params = new URLSearchParams(searchParams.toString());
        params.set("selected", res.value.id);
        router.push(`${pathname}?${params.toString()}`);
      } else {
        setErrorMessage(res.error.message);
      }
    });
  };

  return {
    isReverseDialogOpen,
    setIsReverseDialogOpen,
    reverseReason,
    setReverseReason,
    errorMessage,
    isPending,
    openEntrySheet,
    closeEntrySheet,
    handleReverseSubmit,
  };
}
