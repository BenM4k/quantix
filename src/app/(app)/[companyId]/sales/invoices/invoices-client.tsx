"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { canX } from "@/lib/permissions";
import { InvoiceWithCustomerAndPaid, InvoiceDetailWithLines } from "@/dal/invoices/queries";
import { voidInvoiceAction, recordPaymentAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  FileText,
  DollarSign,
  Download,
  Ban,
  Loader2,
  X,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

interface InvoicesClientProps {
  companyId: string;
  invoices: InvoiceWithCustomerAndPaid[];
  totalInvoices: number;
  selectedInvoiceDetail: InvoiceDetailWithLines | null;
  userRole: string;
}

export function InvoicesClient({
  companyId,
  invoices,
  totalInvoices,
  selectedInvoiceDetail,
  userRole,
}: InvoicesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);
  const [isVoidDialogOpen, setIsVoidDialogOpen] = React.useState(false);

  const [paymentAmount, setPaymentAmount] = React.useState<number>(0);
  const [paymentMethod, setPaymentMethod] = React.useState<"cash" | "bank_transfer" | "card" | "other">("bank_transfer");
  const [voidReason, setVoidReason] = React.useState("");

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const canVoid = canX(userRole, { id: companyId }, "invoice:void");
  const canRecordPayment = canX(userRole, { id: companyId }, "payment:record");

  const openSheet = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("selected", id);
    router.push(`/${companyId}/sales/invoices?${params.toString()}`);
  };

  const closeSheet = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("selected");
    router.push(`/${companyId}/sales/invoices?${params.toString()}`);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceDetail) return;
    setErrorMessage(null);
    startTransition(async () => {
      const res = await recordPaymentAction(companyId, selectedInvoiceDetail.id, {
        amount: Number(paymentAmount),
        method: paymentMethod,
      });
      if (res.ok) {
        setIsPaymentDialogOpen(false);
        router.refresh();
      } else {
        setErrorMessage(res.error || "An error occurred");
      }
    });
  };

  const handleVoidInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceDetail) return;
    setErrorMessage(null);
    startTransition(async () => {
      const res = await voidInvoiceAction(companyId, selectedInvoiceDetail.id, voidReason);
      if (res.ok) {
        setIsVoidDialogOpen(false);
        router.refresh();
      } else {
        setErrorMessage(res.error || "An error occurred");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unpaid":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Unpaid</Badge>;
      case "partial":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Partial</Badge>;
      case "paid":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Paid</Badge>;
      case "void":
        return <Badge variant="destructive">Void</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns: ColumnDef<InvoiceWithCustomerAndPaid>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
      cell: ({ row }) => (
        <button
          onClick={() => openSheet(row.original.id)}
          className="font-medium text-primary hover:underline flex items-center gap-1.5"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>{row.original.invoiceNumber}</span>
        </button>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
    },
    {
      accessorKey: "issueDate",
      header: "Issue Date",
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-semibold">${Number(row.original.total).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "amountPaid",
      header: "Amount Paid",
      cell: ({ row }) => (
        <span className="text-muted-foreground">${Number(row.original.amountPaid).toFixed(2)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            View immutable posted sales invoices and record customer payments.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        total={totalInvoices}
        onRowClick={(row) => openSheet(row.id)}
        searchPlaceholder="Search invoices by number..."
      />

      {/* View-Only Invoice Detail Sheet */}
      {selectedInvoiceDetail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-card border-l border-border/80 h-full p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 overflow-y-auto">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Invoice #{selectedInvoiceDetail.invoiceNumber}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Issued: {selectedInvoiceDetail.issueDate} • Due: {selectedInvoiceDetail.dueDate}
                    </p>
                  </div>
                </div>
                <button onClick={closeSheet} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status & PDF Banner */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/20">
                <div className="flex items-center gap-3">
                  <span>Status:</span>
                  {getStatusBadge(selectedInvoiceDetail.status)}
                </div>
                {selectedInvoiceDetail.pdfUrl ? (
                  <a
                    href={selectedInvoiceDetail.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                  >
                    <Download className="h-4 w-4" /> Download PDF
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Generating PDF...
                  </span>
                )}
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground font-semibold uppercase">Customer</span>
                  <p className="text-sm font-medium text-foreground">{selectedInvoiceDetail.customerName}</p>
                </div>
                {selectedInvoiceDetail.sourceOrderNumber && (
                  <div>
                    <span className="text-muted-foreground font-semibold uppercase">Source Order</span>
                    <p className="text-sm font-medium text-foreground">{selectedInvoiceDetail.sourceOrderNumber}</p>
                  </div>
                )}
              </div>

              {/* Lines Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Line Items</h4>
                <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Description</th>
                        <th className="p-3 text-right">Qty</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {selectedInvoiceDetail.lines.map((l) => (
                        <tr key={l.id}>
                          <td className="p-3 font-medium">{l.description}</td>
                          <td className="p-3 text-right">{l.quantity}</td>
                          <td className="p-3 text-right">${Number(l.unitPrice).toFixed(2)}</td>
                          <td className="p-3 text-right font-semibold">${Number(l.lineTotal).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals & Payments Summary */}
              <div className="p-4 rounded-xl border border-border/60 bg-muted/10 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span>${Number(selectedInvoiceDetail.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax Total:</span>
                  <span>${Number(selectedInvoiceDetail.taxTotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-foreground border-t border-border/40 pt-2">
                  <span>Grand Total:</span>
                  <span>${Number(selectedInvoiceDetail.total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-600 font-medium">
                  <span>Amount Paid:</span>
                  <span>${Number(selectedInvoiceDetail.amountPaid).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-amber-600 font-medium">
                  <span>Balance Due:</span>
                  <span>
                    $
                    {Math.max(
                      0,
                      Number(selectedInvoiceDetail.total) - Number(selectedInvoiceDetail.amountPaid),
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-6">
              {canVoid && selectedInvoiceDetail.status !== "void" && (
                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setIsVoidDialogOpen(true)}>
                  <Ban className="h-4 w-4 mr-1" /> Void Invoice
                </Button>
              )}
              {canRecordPayment && selectedInvoiceDetail.status !== "void" && selectedInvoiceDetail.status !== "paid" && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white ml-auto"
                  onClick={() => {
                    const due = Number(selectedInvoiceDetail.total) - Number(selectedInvoiceDetail.amountPaid);
                    setPaymentAmount(Math.max(0, due));
                    setIsPaymentDialogOpen(true);
                  }}
                >
                  <DollarSign className="h-4 w-4 mr-1" /> Record Payment
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Dialog */}
      {isPaymentDialogOpen && selectedInvoiceDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2 font-bold text-base">
                <CreditCard className="h-5 w-5 text-emerald-500" />
                <span>Record Payment — #{selectedInvoiceDetail.invoiceNumber}</span>
              </div>
              <button onClick={() => setIsPaymentDialogOpen(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg text-xs bg-destructive/10 text-destructive border border-destructive/20">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <Field>
                <FieldLabel>Payment Amount ($) *</FieldLabel>
                <Input
                  type="number"
                  step="any"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel>Payment Method *</FieldLabel>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-sm"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="other">Other</option>
                </select>
              </Field>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Confirm Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Void Invoice AlertDialog */}
      {isVoidDialogOpen && selectedInvoiceDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3 text-destructive">
              <div className="flex items-center gap-2 font-bold text-base">
                <AlertTriangle className="h-5 w-5" />
                <span>Void Invoice #{selectedInvoiceDetail.invoiceNumber}</span>
              </div>
              <button onClick={() => setIsVoidDialogOpen(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              This action will reverse accounting journal entries, restore inventory stock, and set the status to Void. This action cannot be undone.
            </p>

            {errorMessage && (
              <div className="p-3 rounded-lg text-xs bg-destructive/10 text-destructive border border-destructive/20">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleVoidInvoice} className="space-y-4">
              <Field>
                <FieldLabel>Reason for Void *</FieldLabel>
                <Input
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="e.g. Inadvertent duplicate or incorrect billing"
                  required
                />
              </Field>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsVoidDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} variant="destructive">
                  {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Void Invoice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
