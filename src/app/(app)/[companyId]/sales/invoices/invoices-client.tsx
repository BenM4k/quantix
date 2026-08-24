"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { canX } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import {
  InvoiceWithCustomerAndPaid,
  InvoiceDetailWithLines,
} from "@/dal/invoices/queries";
import type { InvoiceKpis } from "@/services/module-kpis/module-kpis.service";
import { voidInvoiceAction, recordPaymentAction } from "./actions";
import { Button } from "@/components/ui/button";
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
  Plus,
  Search,
  ArrowUpRight,
  Link as LinkIcon,
  Calendar,
  ChevronDown,
  Building2,
  Waves,
} from "lucide-react";
import {
  SplitPanelShell,
  ListRow,
  EmptyState,
} from "@/components/layout/split-panel-shell";
import Link from "next/link";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v: string | number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(v) || 0);

const fmtDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

function StatusPill({
  status,
  isSelected,
}: {
  status: string;
  isSelected?: boolean;
}) {
  if (isSelected) {
    return (
      <span className="text-[10px] font-black px-3 py-1 rounded-full bg-primary-foreground text-primary shrink-0 tracking-wide shadow-sm">
        {status === "unpaid"
          ? "Unsent"
          : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }

  const label =
    status === "unpaid"
      ? "Unsent"
      : status === "sent"
        ? "Viewed"
        : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/20 text-foreground border border-primary/30 shrink-0 tracking-wide">
      {label}
    </span>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function InvoiceDetailPanel({
  detail,
  companyId,
  userRole,
  onPayment,
  onVoid,
}: {
  detail: InvoiceDetailWithLines | null;
  companyId: string;
  userRole: string;
  onPayment: () => void;
  onVoid: () => void;
}) {
  const canVoid = canX(userRole, { id: companyId }, "invoice:void");
  const canPay = canX(userRole, { id: companyId }, "payment:record");

  if (!detail) {
    return (
      <EmptyState
        icon={FileText}
        title="Select an invoice"
        description="Click any invoice on the left to inspect detailed line items and record transactions."
      />
    );
  }

  const balance = Math.max(0, Number(detail.total) - Number(detail.amountPaid));

  return (
    <div className="flex flex-col h-full justify-between gap-6 text-white">
      {/* Top Section: Header & Metadata */}
      <div className="space-y-6">
        {/* Meta Bar matching the reference design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-primary/25">
          {/* Left: Invoice details */}
          <div>
            <span className="text-[11px] font-medium text-foreground/70 tracking-wide block">
              Invoice details
            </span>
            <div className="flex items-center gap-2.5 mt-1">
              <h2 className="text-2xl font-black text-foreground">
                {detail.invoiceNumber}
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/20 text-foreground border border-primary/30">
                {detail.status === "unpaid"
                  ? "Unsent"
                  : detail.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Middle: Company */}
          <div>
            <span className="text-[11px] font-medium text-foreground/70 tracking-wide block">
              Company
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-lg font-black text-foreground">BrightWave</h3>
              <Waves className="h-4 w-4 text-foreground/80" />
            </div>
          </div>

          {/* Right: Customer */}
          <div>
            <span className="text-[11px] font-medium text-foreground/70 tracking-wide block">
              Customer
            </span>
            <div className="flex items-center gap-2.5 mt-1">
              <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-foreground font-bold text-xs shrink-0 overflow-hidden">
                {detail.customerName
                  ? detail.customerName.slice(0, 2).toUpperCase()
                  : "JC"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {detail.customerName || "James Carter"}
                </p>
                <p className="text-[10px] text-foreground/70 truncate">
                  Marketing Director
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Cards Grid matching reference design */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {detail.lines.map((l) => (
              <div
                key={l.id}
                className="rounded-2xl bg-primary/20 hover:bg-primary/30 border border-primary/25 p-4 flex flex-col justify-between min-h-[92px] transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between text-foreground">
                  <p className="text-lg font-black font-mono tracking-tight">
                    {fmt(l.lineTotal)}
                  </p>
                  <ArrowUpRight className="h-4 w-4 text-foreground/70 group-hover:text-foreground transition-colors" />
                </div>
                <p className="text-xs text-foreground/90 font-medium truncate mt-1">
                  {l.description}
                </p>
              </div>
            ))}

            {/* + Add item slot card */}
            <div className="rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/10 p-4 flex flex-col items-center justify-center gap-1.5 min-h-[92px] text-foreground/70 hover:text-foreground transition-all cursor-pointer">
              <Plus className="h-5 w-5" />
              <span className="text-xs font-semibold">Add item</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Totals & Action Toolbar */}
      <div className="pt-6 border-t border-primary/25">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div>
              <span className="text-[11px] text-foreground/70 font-medium block">
                Sub Total
              </span>
              <span className="text-base font-bold text-foreground font-mono">
                {fmt(detail.subtotal)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-foreground/70 font-medium block">
                Total
              </span>
              <span className="text-base font-bold text-foreground font-mono">
                {fmt(detail.total)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-foreground/90 font-bold block">
                Balance Due
              </span>
              <span className="text-lg font-black text-foreground font-mono">
                {fmt(balance)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {detail.pdfUrl && (
              <a
                href={detail.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 text-foreground hover:bg-primary/30 transition-colors flex items-center justify-center"
                title="Download PDF"
              >
                <LinkIcon className="h-4 w-4" />
              </a>
            )}

            <button
              className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 text-foreground hover:bg-primary/30 transition-colors flex items-center justify-center"
              title="Calendar Due"
            >
              <Calendar className="h-4 w-4" />
            </button>

            {canVoid && detail.status !== "void" && (
              <button
                onClick={onVoid}
                className="h-10 px-4 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300 text-xs font-bold hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
              >
                <Ban className="h-3.5 w-3.5" />
                <span>Void</span>
              </button>
            )}

            {canPay && detail.status !== "void" && detail.status !== "paid" && (
              <button
                onClick={onPayment}
                className="h-10 px-6 rounded-full bg-primary text-primary-foreground text-xs font-black hover:bg-primary/90 transition-all shadow-xl flex items-center gap-1.5"
              >
                <span>Payout now</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Client ──────────────────────────────────────────────────────────────
interface InvoicesClientProps {
  companyId: string;
  invoices: InvoiceWithCustomerAndPaid[];
  totalInvoices: number;
  selectedInvoiceDetail: InvoiceDetailWithLines | null;
  userRole: string;
  kpis: InvoiceKpis;
}

export function InvoicesClient({
  companyId,
  invoices,
  totalInvoices,
  selectedInvoiceDetail,
  userRole,
  kpis,
}: InvoicesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get("search") ?? "");
  const [activeTab, setActiveTab] = React.useState<string>("unpaid");
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);
  const [isVoidOpen, setIsVoidOpen] = React.useState(false);
  const [paymentAmount, setPaymentAmount] = React.useState(0);
  const [paymentMethod, setPaymentMethod] = React.useState<
    "cash" | "bank_transfer" | "card" | "other"
  >("bank_transfer");
  const [voidReason, setVoidReason] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const openInvoice = (id: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("selected", id);
    router.push(`/${companyId}/sales/invoices?${p.toString()}`);
  };

  const handleSearch = (v: string) => {
    setSearch(v);
    const p = new URLSearchParams(searchParams.toString());
    if (v) p.set("search", v);
    else p.delete("search");
    router.push(`/${companyId}/sales/invoices?${p.toString()}`);
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceDetail) return;
    setErrorMessage(null);
    startTransition(async () => {
      const res = await recordPaymentAction(
        companyId,
        selectedInvoiceDetail.id,
        { amount: Number(paymentAmount), method: paymentMethod },
      );
      if (res.ok) {
        setIsPaymentOpen(false);
        router.refresh();
      } else setErrorMessage(res.error || "An error occurred");
    });
  };

  const handleVoid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceDetail) return;
    setErrorMessage(null);
    startTransition(async () => {
      const res = await voidInvoiceAction(
        companyId,
        selectedInvoiceDetail.id,
        voidReason,
      );
      if (res.ok) {
        setIsVoidOpen(false);
        router.refresh();
      } else setErrorMessage(res.error || "An error occurred");
    });
  };

  // Filtered invoices by status and search
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      !search ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === "draft") return inv.status === "draft";
    if (activeTab === "unpaid")
      return inv.status === "unpaid" || inv.status === "partial";
    if (activeTab === "paid") return inv.status === "paid";
    return true;
  });

  const unpaidCount = invoices.filter(
    (i) => i.status === "unpaid" || i.status === "partial",
  ).length;
  const draftCount = invoices.filter((i) => i.status === "draft").length;

  return (
    <>
      <SplitPanelShell
        title="Invoices"
        subtitle={`${totalInvoices} total invoices · manage and track customer receipts`}
        headerAction={
          <Link
            href={`/${companyId}/sales/invoices`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Create an invoice</span>
          </Link>
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
                <span>All customers</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              <button className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border/80 bg-card text-foreground font-semibold hover:bg-muted transition-colors">
                <span>All statuses</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Enter invoice #..."
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
              All Invoices
            </button>
            <button
              onClick={() => setActiveTab("draft")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5",
                activeTab === "draft"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              <span>Draft</span>
              <span
                className={cn(
                  "text-[10px] font-black",
                  activeTab === "draft"
                    ? "h-4 min-w-4 px-1 rounded-full bg-primary-foreground text-primary flex items-center justify-center"
                    : "text-muted-foreground",
                )}
              >
                {draftCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("unpaid")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5",
                activeTab === "unpaid"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              <span>Unpaid</span>
              <span
                className={cn(
                  "text-[10px] font-black",
                  activeTab === "unpaid"
                    ? "h-4 min-w-4 px-1 rounded-full bg-primary-foreground text-primary flex items-center justify-center"
                    : "text-muted-foreground",
                )}
              >
                {unpaidCount}
              </span>
            </button>
          </>
        }
        listTitle="Unpaid Invoices"
        listChildren={
          filteredInvoices.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No invoices found"
              description="Try adjusting your filters or search term."
            />
          ) : (
            filteredInvoices.map((inv) => (
              <ListRow
                key={inv.id}
                id={inv.id}
                primary={inv.invoiceNumber}
                secondary={
                  inv.dueDate
                    ? `In ${Math.max(1, Math.round((new Date(inv.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days`
                    : inv.customerName
                }
                amount={fmt(inv.total)}
                selected={selectedInvoiceDetail?.id === inv.id}
                onClick={() => openInvoice(inv.id)}
                badge={
                  <StatusPill
                    status={inv.status}
                    isSelected={selectedInvoiceDetail?.id === inv.id}
                  />
                }
              />
            ))
          )
        }
        detailChildren={
          <InvoiceDetailPanel
            detail={selectedInvoiceDetail}
            companyId={companyId}
            userRole={userRole}
            onPayment={() => {
              if (selectedInvoiceDetail) {
                setPaymentAmount(
                  Math.max(
                    0,
                    Number(selectedInvoiceDetail.total) -
                      Number(selectedInvoiceDetail.amountPaid),
                  ),
                );
                setIsPaymentOpen(true);
              }
            }}
            onVoid={() => setIsVoidOpen(true)}
          />
        }
      />

      {/* Payment Modal */}
      {isPaymentOpen && selectedInvoiceDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2 font-bold text-base">
                <CreditCard className="h-5 w-5 text-emerald-500" />
                Record Payment — {selectedInvoiceDetail.invoiceNumber}
              </div>
              <button
                onClick={() => setIsPaymentOpen(false)}
                className="p-1 rounded-lg hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {errorMessage && (
              <div className="p-3 rounded-lg text-xs bg-destructive/10 text-destructive border border-destructive/20">
                {errorMessage}
              </div>
            )}
            <form onSubmit={handlePayment} className="space-y-4">
              <Field>
                <FieldLabel>Payment Amount *</FieldLabel>
                <Input
                  type="number"
                  step="any"
                  value={paymentAmount}
                  onChange={(e) =>
                    setPaymentAmount(parseFloat(e.target.value) || 0)
                  }
                  required
                />
              </Field>
              <Field>
                <FieldLabel>Payment Method *</FieldLabel>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as typeof paymentMethod)
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-sm"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPaymentOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isPending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Confirm Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Void Modal */}
      {isVoidOpen && selectedInvoiceDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3 text-destructive">
              <div className="flex items-center gap-2 font-bold text-base">
                <AlertTriangle className="h-5 w-5" /> Void Invoice{" "}
                {selectedInvoiceDetail.invoiceNumber}
              </div>
              <button
                onClick={() => setIsVoidOpen(false)}
                className="p-1 rounded-lg hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This will reverse accounting entries and restore inventory stock.
              This action cannot be undone.
            </p>
            {errorMessage && (
              <div className="p-3 rounded-lg text-xs bg-destructive/10 text-destructive border border-destructive/20">
                {errorMessage}
              </div>
            )}
            <form onSubmit={handleVoid} className="space-y-4">
              <Field>
                <FieldLabel>Reason for Void *</FieldLabel>
                <Input
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="e.g. Duplicate invoice"
                  required
                />
              </Field>
              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsVoidOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  variant="destructive"
                >
                  {isPending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Void Invoice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
