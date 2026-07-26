"use client";

import * as React from "react";
import { FiscalPeriod } from "@/services/drizzle/schemas";
import { canX } from "@/lib/permissions";
import { closePeriodAction, reopenPeriodAction } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Lock,
  Unlock,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";

interface PeriodsClientProps {
  companyId: string;
  periods: FiscalPeriod[];
  userRole: string;
}

export function PeriodsClient({
  companyId,
  periods,
  userRole,
}: PeriodsClientProps) {
  const [selectedPeriod, setSelectedPeriod] = React.useState<FiscalPeriod | null>(null);
  const [actionType, setActionType] = React.useState<"close" | "reopen" | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const canClose = canX(userRole, { id: companyId }, "period:close");

  const openConfirmModal = (period: FiscalPeriod, type: "close" | "reopen") => {
    setSelectedPeriod(period);
    setActionType(type);
    setErrorMessage(null);
  };

  const closeModal = () => {
    setSelectedPeriod(null);
    setActionType(null);
    setErrorMessage(null);
  };

  const handleConfirm = () => {
    if (!selectedPeriod || !actionType) return;
    setErrorMessage(null);

    startTransition(async () => {
      const res =
        actionType === "close"
          ? await closePeriodAction(companyId, selectedPeriod.id)
          : await reopenPeriodAction(companyId, selectedPeriod.id);

      if (res.ok) {
        closeModal();
      } else {
        setErrorMessage(res.error.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <span>Fiscal Periods & Period Close</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage fiscal periods and lock periods to prevent unauthorized journal postings.
        </p>
      </div>

      <div className="border border-border/80 rounded-2xl bg-card overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted/60 text-muted-foreground font-semibold uppercase tracking-wider border-b border-border/40">
            <tr>
              <th className="p-4">Period #</th>
              <th className="p-4">Start Date</th>
              <th className="p-4">End Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {periods.map((p) => (
              <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                <td className="p-4 font-mono font-bold text-foreground">
                  Period {p.periodNumber}
                </td>
                <td className="p-4 font-medium text-foreground">{p.startDate}</td>
                <td className="p-4 font-medium text-foreground">{p.endDate}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      p.status === "open"
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                    }`}
                  >
                    {p.status === "open" ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Open
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5" /> Closed
                      </>
                    )}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {canClose && (
                    p.status === "open" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openConfirmModal(p, "close")}
                        className="text-rose-500 border-rose-500/20 hover:bg-rose-500/10 text-xs"
                      >
                        <Lock className="h-3.5 w-3.5 mr-1" /> Close Period
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openConfirmModal(p, "reopen")}
                        className="text-amber-500 border-amber-500/20 hover:bg-amber-500/10 text-xs"
                      >
                        <Unlock className="h-3.5 w-3.5 mr-1" /> Reopen Period
                      </Button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm Action Dialog */}
      {selectedPeriod && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                {actionType === "close" ? (
                  <>
                    <Lock className="h-5 w-5 text-rose-500" /> Close Period {selectedPeriod.periodNumber}
                  </>
                ) : (
                  <>
                    <Unlock className="h-5 w-5 text-amber-500" /> Reopen Period {selectedPeriod.periodNumber}
                  </>
                )}
              </h3>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg text-xs bg-destructive/10 text-destructive border border-destructive/20">
                {errorMessage}
              </div>
            )}

            {actionType === "close" ? (
              <p className="text-xs text-muted-foreground leading-relaxed">
                Closing this period ({selectedPeriod.startDate} to {selectedPeriod.endDate}) will prevent any future manual or automated journal entry postings dated within this timeframe.
              </p>
            ) : (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Warning:</strong> Reopening a closed fiscal period is a deliberate override that enables new journal entry postings backdated to this period.
                </span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-border/40">
              <Button variant="outline" type="button" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                type="button"
                variant={actionType === "close" ? "destructive" : "default"}
                disabled={isPending}
                onClick={handleConfirm}
                className="flex items-center gap-2"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{actionType === "close" ? "Confirm Close" : "Confirm Reopen"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
