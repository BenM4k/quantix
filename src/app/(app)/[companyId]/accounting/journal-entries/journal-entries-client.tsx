"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { canX } from "@/lib/permissions";
import { useJournalEntryManager } from "./hooks/use-journal-entry-manager";
import { EntryWithTotals, JournalEntryDetail } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Plus,
  X,
  Loader2,
  FileText,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

interface JournalEntriesClientProps {
  companyId: string;
  entries: EntryWithTotals[];
  totalEntries: number;
  selectedEntryDetail: JournalEntryDetail | null;
  userRole: string;
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
  const canReverse = canX(userRole, { id: companyId }, "journal_entry:reverse");

  const columns: ColumnDef<EntryWithTotals>[] = [
    {
      accessorKey: "entryNumber",
      header: "Entry #",
      cell: ({ row }) => (
        <div className="font-mono font-bold text-foreground flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.entryNumber}</span>
        </div>
      ),
    },
    {
      accessorKey: "entryDate",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-foreground">
          {row.original.entryDate}
        </span>
      ),
    },
    {
      accessorKey: "memo",
      header: "Description",
      cell: ({ row }) => (
        <div className="text-sm text-foreground max-w-xs truncate">
          {row.original.memo || "—"}
        </div>
      ),
    },
    {
      accessorKey: "sourceType",
      header: "Source",
      cell: ({ row }) => {
        const sourceColors: Record<string, string> = {
          manual: "bg-blue-500/10 text-blue-500 border-blue-500/20",
          reversal: "bg-purple-500/10 text-purple-500 border-purple-500/20",
          sales: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
          purchase: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        };
        const color = sourceColors[row.original.sourceType] || "bg-secondary text-secondary-foreground border-border/40";
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider border ${color}`}>
            {row.original.sourceType}
          </span>
        );
      },
    },
    {
      accessorKey: "totalDebit",
      header: "Debit ($)",
      cell: ({ row }) => (
        <span className="font-mono text-sm font-semibold text-foreground">
          ${row.original.totalDebit}
        </span>
      ),
    },
    {
      accessorKey: "totalCredit",
      header: "Credit ($)",
      cell: ({ row }) => (
        <span className="font-mono text-sm font-semibold text-foreground">
          ${row.original.totalCredit}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        {canCreate && (
          <Link href={`/${companyId}/accounting/journal-entries/new`}>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Transaction</span>
            </Button>
          </Link>
        )}
      </div>

      <DataTable
        columns={columns}
        data={entries}
        total={totalEntries}
        onRowClick={(entry) => openEntrySheet(entry.id)}
        searchPlaceholder="Search transactions by number or memo..."
      />

      {/* Entry Details View-Only Sheet */}
      {selectedEntryDetail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-card border-l border-border/80 h-full p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 overflow-y-auto">
            <div className="space-y-6">
              {/* Sheet Header */}
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Transaction #{selectedEntryDetail.entryNumber}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Date: {selectedEntryDetail.entryDate} • Source: {selectedEntryDetail.sourceType.toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeEntrySheet}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Reversal Linkage Notice Banners */}
              {selectedEntryDetail.reversalOfEntryId && (
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    <span>
                      This is a reversal entry for Entry #{selectedEntryDetail.originalEntryNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => openEntrySheet(selectedEntryDetail.reversalOfEntryId!)}
                    className="flex items-center gap-1 font-semibold underline hover:opacity-80"
                  >
                    <span>View Original</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}

              {selectedEntryDetail.reversedByEntryId && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      This entry has been reversed by Entry #{selectedEntryDetail.reversedByEntryNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => openEntrySheet(selectedEntryDetail.reversedByEntryId!)}
                    className="flex items-center gap-1 font-semibold underline hover:opacity-80"
                  >
                    <span>View Reversal</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Memo */}
              {selectedEntryDetail.memo && (
                <div className="space-y-1 bg-muted/20 p-3 rounded-xl border border-border/40">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Memo / Description
                  </div>
                  <div className="text-sm text-foreground">{selectedEntryDetail.memo}</div>
                </div>
              )}

              {/* Entry Lines Table */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Transaction Lines
                </div>
                <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/40 text-muted-foreground border-b border-border/40 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Account Code</th>
                        <th className="py-2.5 px-3">Account Name</th>
                        <th className="py-2.5 px-3 text-right">Debit ($)</th>
                        <th className="py-2.5 px-3 text-right">Credit ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {selectedEntryDetail.lines.map((line) => (
                        <tr key={line.id}>
                          <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                            {line.accountCode}
                          </td>
                          <td className="py-2.5 px-3 text-foreground">
                            {line.accountName}
                            {line.description && (
                              <div className="text-[10px] text-muted-foreground">{line.description}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">
                            {Number(line.debit) > 0 ? `$${line.debit}` : "—"}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">
                            {Number(line.credit) > 0 ? `$${line.credit}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/30 border-t border-border/60 font-bold font-mono">
                      <tr>
                        <td colSpan={2} className="py-2.5 px-3 text-right text-foreground">
                          Totals
                        </td>
                        <td className="py-2.5 px-3 text-right text-foreground">
                          $
                          {selectedEntryDetail.lines
                            .reduce((sum, l) => sum + Number(l.debit), 0)
                            .toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-foreground">
                          $
                          {selectedEntryDetail.lines
                            .reduce((sum, l) => sum + Number(l.credit), 0)
                            .toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Sheet Footer Actions */}
            <div className="pt-6 border-t border-border/40 flex items-center justify-between">
              <div>
                {canReverse && !selectedEntryDetail.reversedByEntryId && (
                  <Button
                    variant="outline"
                    onClick={() => setIsReverseDialogOpen(true)}
                    className="text-amber-500 border-amber-500/20 hover:bg-amber-500/10 flex items-center gap-1.5 text-xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reverse Entry</span>
                  </Button>
                )}
              </div>
              <Button variant="outline" onClick={closeEntrySheet}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reverse Confirmation Modal Dialog */}
      {isReverseDialogOpen && selectedEntryDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-base">
                <RotateCcw className="h-5 w-5" />
                <span>Reverse Transaction #{selectedEntryDetail.entryNumber}</span>
              </div>
              <button
                onClick={() => setIsReverseDialogOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              This action will generate a new reversing transaction that swaps all Debit and Credit lines for Transaction #{selectedEntryDetail.entryNumber}. Both entries will remain permanently linked in the general ledger.
            </p>

            {errorMessage && (
              <div className="p-3 rounded-lg text-xs bg-destructive/10 text-destructive border border-destructive/20">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleReverseSubmit} className="space-y-4">
              <Field>
                <FieldLabel htmlFor="reverse-reason">Reason for Reversal (Optional)</FieldLabel>
                <Input
                  id="reverse-reason"
                  value={reverseReason}
                  onChange={(e) => setReverseReason(e.target.value)}
                  placeholder="e.g. Correcting inadvertent duplicate entry"
                />
              </Field>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsReverseDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="bg-amber-500 hover:bg-amber-600 text-white">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Confirm Reversal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
