"use client";

import * as React from "react";
import Link from "next/link";
import { canX } from "@/lib/permissions";
import { useJournalEntryManager } from "./hooks/use-journal-entry-manager";
import { EntryWithTotals, JournalEntryDetail } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import {
  Plus,
  X,
  Loader2,
  FileText,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  Search,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import {
  SplitPanelShell,
  ListRow,
  EmptyState,
} from "@/components/layout/split-panel-shell";

interface JournalEntriesClientProps {
  companyId: string;
  entries: EntryWithTotals[];
  totalEntries: number;
  selectedEntryDetail: JournalEntryDetail | null;
  userRole: string;
}

const fmt = (v: string | number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(v) || 0);

function JournalEntryDetailPanel({
  detail,
  companyId,
  userRole,
  onReverseClick,
  onViewOtherEntry,
}: {
  detail: JournalEntryDetail | null;
  companyId: string;
  userRole: string;
  onReverseClick: () => void;
  onViewOtherEntry: (id: string) => void;
}) {
  const canReverse = canX(userRole, { id: companyId }, "journal_entry:reverse");

  if (!detail) {
    return (
      <EmptyState
        icon={FileText}
        title="Select a transaction"
        description="Click any journal entry on the left to inspect debit/credit line allocations and double-entry balance."
      />
    );
  }

  const totalDebit = detail.lines.reduce((sum, l) => sum + Number(l.debit), 0);
  const totalCredit = detail.lines.reduce(
    (sum, l) => sum + Number(l.credit),
    0,
  );

  return (
    <div className="flex flex-col h-full justify-between gap-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Transaction Posting
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-xl font-black text-white">
                {detail.entryNumber}
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-sky-500/30 bg-sky-500/20 text-sky-300 uppercase tracking-wider">
                {detail.sourceType}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Effective Date:{" "}
              <strong className="text-white">{detail.entryDate}</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-foreground/70 font-semibold uppercase block">
              Balanced Total
            </span>
            <span className="text-xl font-black text-foreground font-mono">
              {fmt(totalDebit)}
            </span>
          </div>
        </div>

        {/* Reversal Banner if applicable */}
        {detail.reversalOfEntryId && (
          <div className="p-3.5 rounded-2xl bg-purple-500/20 border border-purple-400/30 text-purple-800 dark:text-purple-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-purple-600 dark:text-purple-300 shrink-0" />
              <span>Reversal of Entry #{detail.originalEntryNumber}</span>
            </div>
            <button
              onClick={() => onViewOtherEntry(detail.reversalOfEntryId!)}
              className="text-xs font-bold underline hover:text-foreground flex items-center gap-1"
            >
              <span>View</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}

        {detail.reversedByEntryId && (
          <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-300 shrink-0" />
              <span>Reversed by Entry #{detail.reversedByEntryNumber}</span>
            </div>
            <button
              onClick={() => onViewOtherEntry(detail.reversedByEntryId!)}
              className="text-xs font-bold underline hover:text-foreground flex items-center gap-1"
            >
              <span>View</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Memo */}
        {detail.memo && (
          <div className="rounded-2xl bg-primary/20 border border-primary/25 p-4">
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block mb-1">
              Memo / Business Context
            </span>
            <p className="text-xs text-foreground/90 leading-relaxed">
              {detail.memo}
            </p>
          </div>
        )}

        {/* Lines Breakdown Table */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-foreground/80 block">
            General Ledger Postings
          </span>
          <div className="rounded-2xl border border-primary/25 overflow-hidden bg-primary/20">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-primary/20 bg-primary/20 text-[10px] font-bold uppercase text-foreground/70">
                <tr>
                  <th className="py-2.5 px-3">Account Code</th>
                  <th className="py-2.5 px-3">Account Title</th>
                  <th className="py-2.5 px-3 text-right">Debit</th>
                  <th className="py-2.5 px-3 text-right">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/20 font-mono">
                {detail.lines.map((l) => (
                  <tr
                    key={l.id}
                    className="hover:bg-primary/30 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-bold text-foreground">
                      {l.accountCode}
                    </td>
                    <td className="py-2.5 px-3 text-foreground font-sans">
                      {l.accountName}
                      {l.description && (
                        <div className="text-[10px] text-foreground/70">
                          {l.description}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-300 font-bold">
                      {Number(l.debit) > 0 ? fmt(l.debit) : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right text-foreground font-bold">
                      {Number(l.credit) > 0 ? fmt(l.credit) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-primary/25 bg-primary/20 font-mono font-bold text-foreground">
                <tr>
                  <td
                    colSpan={2}
                    className="py-2.5 px-3 text-right font-sans text-xs"
                  >
                    Balanced Totals
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-300">
                    {fmt(totalDebit)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-foreground">
                    {fmt(totalCredit)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pt-5 border-t border-primary/25 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-xs text-foreground/70">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
          <span>Double-entry balanced</span>
        </div>

        {canReverse && !detail.reversedByEntryId && (
          <button
            onClick={onReverseClick}
            className="h-10 px-5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reverse Entry</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function JournalEntriesClient({
  companyId,
  entries,
  totalEntries,
  selectedEntryDetail,
  userRole,
}: JournalEntriesClientProps) {
  const {
    isReverseDialogOpen,
    setIsReverseDialogOpen,
    reverseReason,
    setReverseReason,
    errorMessage,
    isPending,
    openEntrySheet,
    closeEntrySheet,
    handleReverseSubmit,
  } = useJournalEntryManager(companyId, selectedEntryDetail);

  const canCreate = canX(userRole, { id: companyId }, "journal_entry:create");

  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<string>("all");

  const filtered = entries.filter((e) => {
    const matches =
      !search ||
      e.entryNumber.toLowerCase().includes(search.toLowerCase()) ||
      (e.memo ?? "").toLowerCase().includes(search.toLowerCase());
    if (!matches) return false;
    if (activeTab === "manual") return e.sourceType === "manual";
    if (activeTab === "invoice") return e.sourceType === "invoice";
    if (activeTab === "payment") return e.sourceType === "payment";
    return true;
  });

  return (
    <>
      <SplitPanelShell
        title="Journal Entries"
        subtitle={`${totalEntries} total transactions · double-entry general ledger log`}
        headerAction={
          canCreate && (
            <Link
              href={`/${companyId}/accounting/journal-entries/new`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Create Transaction</span>
            </Link>
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
                <span>All sources</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search entry # or memo..."
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
              All Entries
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                activeTab === "manual"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              Manual
            </button>
            <button
              onClick={() => setActiveTab("invoice")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                activeTab === "invoice"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              Invoices
            </button>
            <button
              onClick={() => setActiveTab("payment")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                activeTab === "payment"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              Payments
            </button>
          </>
        }
        listTitle="General Transactions"
        listChildren={
          filtered.length === 0 ? (
            <EmptyState icon={FileText} title="No transactions found" />
          ) : (
            filtered.map((entry) => (
              <ListRow
                key={entry.id}
                id={entry.id}
                primary={entry.entryNumber}
                secondary={entry.memo || "General journal posting"}
                meta={entry.entryDate}
                amount={fmt(entry.totalDebit)}
                selected={selectedEntryDetail?.id === entry.id}
                onClick={() => openEntrySheet(entry.id)}
                badge={
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase",
                      entry.sourceType === "manual"
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        : entry.sourceType === "invoice"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : entry.sourceType === "payment"
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                            : "bg-white/10 text-zinc-300 border-white/10",
                    )}
                  >
                    {entry.sourceType}
                  </span>
                }
              />
            ))
          )
        }
        detailChildren={
          <JournalEntryDetailPanel
            detail={selectedEntryDetail}
            companyId={companyId}
            userRole={userRole}
            onReverseClick={() => setIsReverseDialogOpen(true)}
            onViewOtherEntry={(id) => openEntrySheet(id)}
          />
        }
      />

      {/* Reverse Modal */}
      {isReverseDialogOpen && selectedEntryDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-base">
                <RotateCcw className="h-5 w-5" />
                <span>
                  Reverse Transaction #{selectedEntryDetail.entryNumber}
                </span>
              </div>
              <button
                onClick={() => setIsReverseDialogOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              This action will generate a new reversing transaction swapping
              Debits and Credits for Transaction #
              {selectedEntryDetail.entryNumber}. Both remain permanently in the
              ledger.
            </p>

            {errorMessage && (
              <div className="p-3 rounded-lg text-xs bg-destructive/10 text-destructive border border-destructive/20">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleReverseSubmit} className="space-y-4">
              <Field>
                <FieldLabel>Reason for Reversal (Optional)</FieldLabel>
                <Input
                  value={reverseReason}
                  onChange={(e) => setReverseReason(e.target.value)}
                  placeholder="e.g. Inadvertent duplicate entry"
                />
              </Field>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReverseDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Confirm Reversal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
