"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StockLedgerWithDetails } from "@/dal/stock/queries";
import { Product } from "@/services/drizzle/schemas";
import { canX } from "@/lib/permissions";
import { AdjustStockDialog } from "./adjust-stock-dialog";
import { cn } from "@/lib/utils";
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  FileText,
  Calendar,
  Warehouse,
  Search,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import {
  SplitPanelShell,
  ListRow,
  EmptyState,
} from "@/components/layout/split-panel-shell";

interface StockLedgerClientProps {
  companyId: string;
  entries: StockLedgerWithDetails[];
  totalEntries: number;
  products: Product[];
  userRole: string;
}

const fmt = (v: string | number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(v) || 0);

const fmtDate = (d: string | Date | null) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

function StockMovementDetailPanel({
  entry,
}: {
  entry: StockLedgerWithDetails | null;
}) {
  if (!entry) {
    return (
      <EmptyState
        icon={Layers}
        title="Select a stock movement"
        description="Click any ledger transaction on the left to inspect unit costs and movement origins."
      />
    );
  }

  const qty = Number(entry.quantity);
  const isPositive = qty > 0;
  const unitCost = Number(entry.unitCost);
  const extendedValuation = Math.abs(qty) * unitCost;

  return (
    <div className="flex flex-col h-full justify-between gap-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Movement Audit #{entry.sequenceNumber}
            </span>
            <h2 className="text-xl font-black text-white mt-1">
              {entry.productName}
            </h2>
            <p className="text-xs text-indigo-300 font-mono mt-0.5">
              SKU: {entry.productSku}
            </p>
          </div>

          <span
            className={cn(
              "text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0",
              isPositive
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-rose-500/20 text-rose-300 border-rose-500/30",
            )}
          >
            {entry.movementType.replace("_", " ").toUpperCase()}
          </span>
        </div>

        {/* Metric Cards Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-primary/20 border border-primary/25 p-4">
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              Quantity Changed
            </span>
            <p
              className={cn(
                "text-xl font-black mt-1 font-mono flex items-center gap-1",
                isPositive
                  ? "text-emerald-600 dark:text-emerald-300"
                  : "text-rose-600 dark:text-rose-300",
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {isPositive ? `+${qty}` : qty}
            </p>
          </div>

          <div className="rounded-2xl bg-primary/20 border border-primary/25 p-4">
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              Unit Cost Applied
            </span>
            <p className="text-xl font-black text-foreground mt-1 font-mono">
              {fmt(unitCost)}
            </p>
          </div>

          <div className="rounded-2xl bg-primary/20 border border-primary/25 p-4">
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              Transaction Value
            </span>
            <p className="text-xl font-black text-foreground mt-1 font-mono">
              {fmt(extendedValuation)}
            </p>
          </div>
        </div>

        {/* Audit Context Details */}
        <div className="rounded-2xl bg-primary/20 border border-primary/25 p-5 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-semibold text-foreground/70 block mb-1">
                Facility / Warehouse
              </span>
              <div className="flex items-center gap-1.5 text-foreground font-medium">
                <Warehouse className="h-3.5 w-3.5 text-foreground/70" />
                <span>{entry.warehouseName || "Main Facility"}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-foreground/70 block mb-1">
                Recorded Timestamp
              </span>
              <div className="flex items-center gap-1.5 text-foreground font-medium">
                <Calendar className="h-3.5 w-3.5 text-foreground/70" />
                <span>{new Date(entry.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {entry.reason && (
            <div className="pt-2 border-t border-primary/20 text-xs">
              <span className="text-[10px] font-semibold text-foreground/70 block mb-1">
                Adjustment Reason / Memo
              </span>
              <p className="text-foreground/90 leading-relaxed">{entry.reason}</p>
            </div>
          )}

          {entry.sourceId && (
            <div className="pt-2 border-t border-primary/20 text-xs text-foreground/70">
              Source Transaction Ref:{" "}
              <span className="font-mono text-foreground font-bold">{entry.sourceId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Immutable Footer */}
      <div className="pt-5 border-t border-primary/25 flex items-center justify-between gap-4 text-xs text-foreground/70">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-300 font-semibold">
          <ShieldCheck className="h-4 w-4" />
          <span>Immutable double-entry inventory audit</span>
        </div>
        <span className="font-mono text-[11px] text-foreground/70">
          Seq #{entry.sequenceNumber}
        </span>
      </div>
    </div>
  );
}

export function StockLedgerClient({
  companyId,
  entries,
  totalEntries,
  products,
  userRole,
}: StockLedgerClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAdjustOpen, setIsAdjustOpen] = React.useState(false);
  const [selectedEntry, setSelectedEntry] =
    React.useState<StockLedgerWithDetails | null>(entries[0] || null);

  const canAdjust = canX(userRole, { id: companyId }, "stock:adjust");
  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<string>("all");

  const filtered = entries.filter((e) => {
    const matches =
      !search ||
      e.productName.toLowerCase().includes(search.toLowerCase()) ||
      e.productSku.toLowerCase().includes(search.toLowerCase()) ||
      e.movementType.toLowerCase().includes(search.toLowerCase());
    if (!matches) return false;
    const isPos = Number(e.quantity) > 0;
    if (activeTab === "inflow") return isPos;
    if (activeTab === "outflow") return !isPos;
    return true;
  });

  const inflowCount = entries.filter((e) => Number(e.quantity) > 0).length;
  const outflowCount = entries.filter((e) => Number(e.quantity) < 0).length;

  return (
    <>
      <SplitPanelShell
        title="Stock Activity Ledger"
        subtitle={`${totalEntries} total entries · immutable inventory movements and cost layers`}
        headerAction={
          canAdjust && (
            <button
              onClick={() => setIsAdjustOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Adjust Stock</span>
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

              <button className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border/80 bg-card text-foreground font-semibold hover:bg-muted transition-colors">
                <span>All movement types</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search product or SKU..."
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
              All Movements
            </button>
            <button
              onClick={() => setActiveTab("inflow")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5",
                activeTab === "inflow"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              <span>Inflow (+)</span>
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                  activeTab === "inflow"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                {inflowCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("outflow")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5",
                activeTab === "outflow"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              <span>Outflow (-)</span>
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                  activeTab === "outflow"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                {outflowCount}
              </span>
            </button>
          </>
        }
        listTitle="Movement Journal"
        listChildren={
          filtered.length === 0 ? (
            <EmptyState icon={Layers} title="No movements found" />
          ) : (
            filtered.map((entry) => {
              const qty = Number(entry.quantity);
              const isPos = qty > 0;
              return (
                <ListRow
                  key={entry.id}
                  id={entry.id}
                  primary={entry.productName}
                  secondary={`#${entry.sequenceNumber} · ${fmtDate(entry.createdAt)}`}
                  amount={isPos ? `+${qty}` : `${qty}`}
                  selected={selectedEntry?.id === entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  badge={
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                        isPos
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/30",
                      )}
                    >
                      {entry.movementType.replace("_", " ")}
                    </span>
                  }
                />
              );
            })
          )
        }
        detailChildren={<StockMovementDetailPanel entry={selectedEntry} />}
      />

      {/* Adjust Stock Dialog */}
      <AdjustStockDialog
        companyId={companyId}
        open={isAdjustOpen}
        onOpenChange={setIsAdjustOpen}
        products={products}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </>
  );
}
