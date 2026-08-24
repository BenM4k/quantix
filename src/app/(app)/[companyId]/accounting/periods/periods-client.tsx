"use client";

import * as React from "react";
import { FiscalPeriod } from "@/services/drizzle/schemas";
import { canX } from "@/lib/permissions";
import {
  closePeriodAction,
  reopenPeriodAction,
  generateFiscalYearAction,
} from "./actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Lock,
  Unlock,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  SplitPanelShell,
  ListRow,
  EmptyState,
} from "@/components/layout/split-panel-shell";

interface PeriodsClientProps {
  companyId: string;
  periods: FiscalPeriod[];
  userRole: string;
}

function PeriodDetailPanel({
  period,
  companyId,
  userRole,
  onClosePeriod,
  onReopenPeriod,
}: {
  period: FiscalPeriod | null;
  companyId: string;
  userRole: string;
  onClosePeriod: () => void;
  onReopenPeriod: () => void;
}) {
  const canClose = canX(userRole, { id: companyId }, "period:close");

  if (!period) {
    return (
      <EmptyState
        icon={Calendar}
        title="Select a fiscal period"
        description="Click any period on the left to review lock status and manage journal posting windows."
      />
    );
  }

  const isOpen = period.status === "open";

  return (
    <div className="flex flex-col h-full justify-between gap-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Fiscal Period #{period.periodNumber}
            </span>
            <h2 className="text-xl font-black text-white mt-1">
              Monthly Period {period.periodNumber}
            </h2>
            <p className="text-xs text-indigo-300 font-mono mt-0.5">
              Window: {period.startDate} to {period.endDate}
            </p>
          </div>

          <span
            className={cn(
              "text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 flex items-center gap-1",
              isOpen
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-rose-500/20 text-rose-300 border-rose-500/30",
            )}
          >
            {isOpen ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <Lock className="h-3 w-3" />
            )}
            {isOpen ? "Open for Postings" : "Period Locked"}
          </span>
        </div>

        {/* Metric Cards Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl bg-primary/20 border border-primary/25 p-4">
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              Start Date
            </span>
            <p className="text-lg font-black text-foreground mt-1 font-mono">
              {period.startDate}
            </p>
          </div>

          <div className="rounded-2xl bg-primary/20 border border-primary/25 p-4">
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              End Date
            </span>
            <p className="text-lg font-black text-foreground mt-1 font-mono">
              {period.endDate}
            </p>
          </div>
        </div>

        {/* Period Lock Protocol Warning */}
        {isOpen ? (
          <div className="rounded-2xl bg-primary/20 border border-primary/25 p-5 space-y-2 text-xs">
            <span className="font-bold text-foreground block">
              Active Fiscal Status
            </span>
            <p className="text-foreground/90 leading-relaxed">
              This period is currently accepting sales invoices, manual journal
              vouchers, and automated double-entry postings. Closing this period
              will lock all transactions to preserve audit integrity.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-800 dark:text-amber-200 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4" />
              <span>Statutory Close Protocol Enforced</span>
            </div>
            <p className="leading-relaxed">
              Backdated transactions to this period are rejected by the
              database. Reopening is a high-privilege action logged in the audit
              trail.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="pt-5 border-t border-primary/25 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-xs text-foreground/70">
          <ShieldCheck className="h-4 w-4 text-foreground/80" />
          <span>Statutory Period Control</span>
        </div>

        {canClose &&
          (isOpen ? (
            <button
              onClick={onClosePeriod}
              className="h-10 px-5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300 text-xs font-bold hover:bg-rose-500/20 transition-colors flex items-center gap-2"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Close Period</span>
            </button>
          ) : (
            <button
              onClick={onReopenPeriod}
              className="h-10 px-5 rounded-full bg-amber-500 text-amber-950 text-xs font-extrabold hover:bg-amber-400 transition-all shadow-lg flex items-center gap-2"
            >
              <Unlock className="h-3.5 w-3.5" />
              <span>Reopen Period</span>
            </button>
          ))}
      </div>
    </div>
  );
}

export function PeriodsClient({
  companyId,
  periods,
  userRole,
}: PeriodsClientProps) {
  const [selectedPeriod, setSelectedPeriod] =
    React.useState<FiscalPeriod | null>(periods[0] || null);
  const [actionType, setActionType] = React.useState<"close" | "reopen" | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const existingYears = periods.map((p) => new Date(p.startDate).getFullYear());
  const maxYear =
    existingYears.length > 0
      ? Math.max(...existingYears)
      : new Date().getFullYear() - 1;
  const defaultNextYear = maxYear + 1;

  const [isGenerateOpen, setIsGenerateOpen] = React.useState(false);
  const [generateYear, setGenerateYear] = React.useState(defaultNextYear);
  const [generateError, setGenerateError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerateError(null);
    startTransition(async () => {
      const res = await generateFiscalYearAction(companyId, generateYear);
      if (res.ok) {
        setIsGenerateOpen(false);
      } else {
        setGenerateError(res.error.message);
      }
    });
  };

  const canClose = canX(userRole, { id: companyId }, "period:close");

  const openConfirmModal = (period: FiscalPeriod, type: "close" | "reopen") => {
    setSelectedPeriod(period);
    setActionType(type);
    setErrorMessage(null);
  };

  const closeModal = () => {
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

  const filtered = periods.filter((p) => {
    const matches =
      !search ||
      `period ${p.periodNumber}`.toLowerCase().includes(search.toLowerCase()) ||
      p.startDate.includes(search) ||
      p.endDate.includes(search);
    if (!matches) return false;
    if (activeTab === "open") return p.status === "open";
    if (activeTab === "closed") return p.status === "closed";
    return true;
  });

  const openCount = periods.filter((p) => p.status === "open").length;

  return (
    <>
      <SplitPanelShell
        title="Fiscal Periods"
        subtitle={`${periods.length} total periods · locking controls and fiscal closing`}
        headerAction={
          canClose && (
            <button
              onClick={() => setIsGenerateOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Generate Fiscal Year</span>
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
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search period # or date..."
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
              All Periods
            </button>
            <button
              onClick={() => setActiveTab("open")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5",
                activeTab === "open"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              <span>Open</span>
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                  activeTab === "open"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                {openCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("closed")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                activeTab === "closed"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              Locked
            </button>
          </>
        }
        listTitle="Fiscal Year Intervals"
        listChildren={
          filtered.length === 0 ? (
            <EmptyState icon={Calendar} title="No fiscal periods found" />
          ) : (
            filtered.map((p) => (
              <ListRow
                key={p.id}
                id={p.id}
                primary={`Period ${p.periodNumber}`}
                secondary={`${p.startDate} → ${p.endDate}`}
                selected={selectedPeriod?.id === p.id}
                onClick={() => setSelectedPeriod(p)}
                badge={
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                      p.status === "open"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/30",
                    )}
                  >
                    {p.status === "open" ? "Open" : "Locked"}
                  </span>
                }
              />
            ))
          )
        }
        detailChildren={
          <PeriodDetailPanel
            period={selectedPeriod}
            companyId={companyId}
            userRole={userRole}
            onClosePeriod={() =>
              selectedPeriod && openConfirmModal(selectedPeriod, "close")
            }
            onReopenPeriod={() =>
              selectedPeriod && openConfirmModal(selectedPeriod, "reopen")
            }
          />
        }
      />

      {/* Confirm Lock / Reopen Dialog */}
      {selectedPeriod && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                {actionType === "close" ? (
                  <>
                    <Lock className="h-5 w-5 text-rose-500" /> Close Period{" "}
                    {selectedPeriod.periodNumber}
                  </>
                ) : (
                  <>
                    <Unlock className="h-5 w-5 text-amber-500" /> Reopen Period{" "}
                    {selectedPeriod.periodNumber}
                  </>
                )}
              </h3>
              <button
                onClick={closeModal}
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

            {actionType === "close" ? (
              <p className="text-xs text-muted-foreground leading-relaxed">
                Closing this period ({selectedPeriod.startDate} to{" "}
                {selectedPeriod.endDate}) will prevent any future manual or
                automated journal entry postings dated within this timeframe.
              </p>
            ) : (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Warning:</strong> Reopening a closed fiscal period is
                  a deliberate override enabling backdated postings.
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
                className="flex items-center gap-2 font-bold"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>
                  {actionType === "close" ? "Confirm Close" : "Confirm Reopen"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Fiscal Year Modal */}
      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold text-foreground">
                Generate Fiscal Year
              </h3>
              <button
                onClick={() => setIsGenerateOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {generateError && (
              <div className="p-3 rounded-lg text-xs bg-destructive/10 text-destructive border border-destructive/20 font-medium">
                {generateError}
              </div>
            )}

            <form onSubmit={handleGenerateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="generate-year"
                  className="text-xs font-semibold text-foreground"
                >
                  Fiscal Year (YYYY) *
                </label>
                <input
                  id="generate-year"
                  type="number"
                  required
                  value={generateYear}
                  onChange={(e) =>
                    setGenerateYear(
                      parseInt(e.target.value) || new Date().getFullYear(),
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-sm"
                  placeholder="e.g. 2026"
                />
                <p className="text-[11px] text-muted-foreground">
                  This will generate 12 monthly fiscal periods for{" "}
                  {generateYear} based on your statutory company profile.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsGenerateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Generate Periods
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
