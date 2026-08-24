"use client";

import * as React from "react";
import Link from "next/link";
import { canX } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { QuoteWithCustomer } from "@/dal/quote/queries";
import {
  Plus,
  FileText,
  Search,
  ChevronDown,
  ArrowUpRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  SplitPanelShell,
  ListRow,
  EmptyState,
} from "@/components/layout/split-panel-shell";

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

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft: {
    label: "Draft",
    cls: "bg-white/10 text-zinc-300 border-white/10",
  },
  sent: {
    label: "Sent",
    cls: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  },
  accepted: {
    label: "Accepted",
    cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  declined: {
    label: "Declined",
    cls: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  },
  converted: {
    label: "Converted",
    cls: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.draft;
  return (
    <span
      className={cn(
        "text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 tracking-wide",
        s.cls,
      )}
    >
      {s.label}
    </span>
  );
}

function QuoteDetailPanel({
  quote,
  companyId,
}: {
  quote: QuoteWithCustomer | null;
  companyId: string;
}) {
  if (!quote) {
    return (
      <EmptyState
        icon={FileText}
        title="Select a quote"
        description="Click any quote on the left to inspect detailed estimate terms."
      />
    );
  }

  return (
    <div className="flex flex-col h-full justify-between gap-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-primary/25">
          <div>
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              Quote Ref
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-xl font-black text-foreground">
                {quote.quoteNumber}
              </h2>
              <StatusPill status={quote.status} />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              Customer Account
            </span>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-foreground font-bold text-xs">
                {quote.customerName ? quote.customerName[0] : "C"}
              </div>
              <span className="text-sm font-bold text-foreground truncate">
                {quote.customerName}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              Issue Date
            </span>
            <p className="text-sm font-bold text-foreground mt-1">
              {fmtDate(quote.quoteDate)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl bg-primary/20 border border-primary/25 p-4">
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              Expiration Terms
            </span>
            <p className="text-sm font-bold text-foreground mt-1">
              Valid for 30 days from issuance
            </p>
          </div>

          <div className="rounded-2xl bg-primary/20 border border-primary/25 p-4">
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              Quoted Valuation
            </span>
            <p className="text-lg font-black text-foreground mt-1 font-mono">
              {fmt(quote.total ?? 0)}
            </p>
          </div>
        </div>

        {quote.notes && (
          <div className="rounded-2xl bg-primary/20 border border-primary/25 p-4">
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block mb-1">
              Estimation Notes
            </span>
            <p className="text-xs text-foreground/90 leading-relaxed">
              {quote.notes}
            </p>
          </div>
        )}
      </div>

      <div className="pt-5 border-t border-primary/25 flex items-center justify-between gap-4">
        <span className="text-xs text-foreground/70 font-medium">
          Quantix Proposal Record
        </span>
        <Link
          href={`/${companyId}/sales/quotes/${quote.id}`}
          className="h-10 px-6 rounded-full bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          <span>Edit Quote</span>
        </Link>
      </div>
    </div>
  );
}

interface QuotesClientProps {
  companyId: string;
  quotes: QuoteWithCustomer[];
  totalQuotes: number;
  userRole: string;
}

export function QuotesClient({
  companyId,
  quotes,
  totalQuotes,
  userRole,
}: QuotesClientProps) {
  const canCreate = canX(userRole, { id: companyId }, "quote:create");
  const [selected, setSelected] = React.useState<QuoteWithCustomer | null>(
    quotes[0] || null,
  );
  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<string>("all");

  const filtered = quotes.filter((q) => {
    const matches =
      !search ||
      q.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.customerName.toLowerCase().includes(search.toLowerCase());
    if (!matches) return false;
    if (activeTab === "draft") return q.status === "draft";
    if (activeTab === "sent") return q.status === "sent";
    if (activeTab === "accepted") return q.status === "accepted";
    return true;
  });

  const draftCount = quotes.filter((q) => q.status === "draft").length;
  const sentCount = quotes.filter((q) => q.status === "sent").length;

  return (
    <SplitPanelShell
      title="Sales Quotes"
      subtitle={`${totalQuotes} total · manage customer quotations and estimations`}
      headerAction={
        canCreate && (
          <Link
            href={`/${companyId}/sales/quotes/new`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Create Quote</span>
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
              <span>All customers</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search quotes..."
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
            All Quotes
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
                "text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                activeTab === "draft"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "text-muted-foreground",
              )}
            >
              {draftCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5",
              activeTab === "sent"
                ? "bg-primary text-primary-foreground font-bold shadow-sm"
                : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
            )}
          >
            <span>Sent</span>
            <span
              className={cn(
                "text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                activeTab === "sent"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "text-muted-foreground",
              )}
            >
              {sentCount}
            </span>
          </button>
        </>
      }
      listTitle="Quotes Stream"
      listChildren={
        filtered.length === 0 ? (
          <EmptyState icon={FileText} title="No quotes found" />
        ) : (
          filtered.map((quote) => (
            <ListRow
              key={quote.id}
              id={quote.id}
              primary={quote.quoteNumber}
              secondary={quote.customerName}
              meta={fmtDate(quote.quoteDate)}
              amount={fmt(quote.total ?? 0)}
              selected={selected?.id === quote.id}
              onClick={() => setSelected(quote)}
              badge={<StatusPill status={quote.status} />}
            />
          ))
        )
      }
      detailChildren={
        <QuoteDetailPanel quote={selected} companyId={companyId} />
      }
    />
  );
}
