"use client";

import * as React from "react";
import Link from "next/link";
import { canX } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { OrderWithCustomer } from "@/dal/sales-order/queries";
import type { OrderKpis } from "@/services/module-kpis/module-kpis.service";
import {
  Plus,
  ShoppingBag,
  FileText,
  Layers,
  CheckCircle2,
  XCircle,
  Search,
  ChevronDown,
  ArrowUpRight,
  Building2,
  Calendar,
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
  confirmed: {
    label: "Confirmed",
    cls: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  },
  converted: {
    label: "Converted",
    cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-rose-500/20 text-rose-300 border-rose-500/30",
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

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function OrderDetailPanel({
  order,
  companyId,
}: {
  order: OrderWithCustomer | null;
  companyId: string;
}) {
  if (!order)
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Select an order"
        description="Click any sales order on the left to view fulfillment parameters and customer terms."
      />
    );

  return (
    <div className="flex flex-col h-full justify-between gap-6">
      {/* Top Section */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-primary/25">
          <div>
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              Order Details
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-xl font-black text-foreground">
                {order.orderNumber}
              </h2>
              <StatusPill status={order.status} />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              Customer Account
            </span>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-foreground font-bold text-xs">
                {order.customerName ? order.customerName[0] : "C"}
              </div>
              <span className="text-sm font-bold text-foreground truncate">
                {order.customerName}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              Order Date
            </span>
            <p className="text-sm font-bold text-foreground mt-1">
              {fmtDate(order.orderDate)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl bg-primary/20 border border-primary/25 p-4">
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              Source Quote Ref
            </span>
            <p className="text-sm font-extrabold text-foreground mt-1 font-mono">
              {order.sourceQuoteNumber || "Direct Sales Order"}
            </p>
          </div>

          <div className="rounded-2xl bg-primary/20 border border-primary/25 p-4">
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block">
              Order Value
            </span>
            <p className="text-lg font-black text-foreground mt-1 font-mono">
              {fmt(order.total ?? 0)}
            </p>
          </div>
        </div>

        {order.notes && (
          <div className="rounded-2xl bg-primary/20 border border-primary/25 p-4">
            <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider block mb-1">
              Fulfillment Notes
            </span>
            <p className="text-xs text-foreground/90 leading-relaxed">
              {order.notes}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="pt-5 border-t border-primary/25 flex items-center justify-between gap-4">
        <span className="text-xs text-foreground/70 font-medium">
          Quantix Pipeline Record
        </span>
        <Link
          href={`/${companyId}/sales/orders/${order.id}`}
          className="h-10 px-6 rounded-full bg-primary text-primary-foreground text-xs font-extrabold hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          <span>Edit Order</span>
        </Link>
      </div>
    </div>
  );
}

// ─── Main Client ──────────────────────────────────────────────────────────────
interface OrdersClientProps {
  companyId: string;
  orders: OrderWithCustomer[];
  totalOrders: number;
  userRole: string;
  kpis: OrderKpis;
}

export function OrdersClient({
  companyId,
  orders,
  totalOrders,
  userRole,
  kpis,
}: OrdersClientProps) {
  const canCreate = canX(userRole, { id: companyId }, "order:create");
  const [selected, setSelected] = React.useState<OrderWithCustomer | null>(
    orders[0] || null,
  );
  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<string>("all");

  const filtered = orders.filter((o) => {
    const matches =
      !search ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase());
    if (!matches) return false;
    if (activeTab === "confirmed") return o.status === "confirmed";
    if (activeTab === "draft") return o.status === "draft";
    return true;
  });

  const confirmedCount = orders.filter((o) => o.status === "confirmed").length;
  const draftCount = orders.filter((o) => o.status === "draft").length;

  return (
    <SplitPanelShell
      title="Sales Orders"
      subtitle={`${totalOrders} total · manage and track customer orders`}
      headerAction={
        canCreate && (
          <Link
            href={`/${companyId}/sales/orders/new`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Create Sales Order</span>
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
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders..."
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
            All Orders
          </button>
          <button
            onClick={() => setActiveTab("confirmed")}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5",
              activeTab === "confirmed"
                ? "bg-primary text-primary-foreground font-bold shadow-sm"
                : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
            )}
          >
            <span>Confirmed</span>
            <span
              className={cn(
                "text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                activeTab === "confirmed"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "text-muted-foreground",
              )}
            >
              {confirmedCount}
            </span>
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
        </>
      }
      listTitle="Orders Stream"
      listChildren={
        filtered.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="No orders found" />
        ) : (
          filtered.map((order) => (
            <ListRow
              key={order.id}
              id={order.id}
              primary={order.orderNumber}
              secondary={order.customerName}
              meta={fmtDate(order.orderDate)}
              amount={fmt(order.total ?? 0)}
              selected={selected?.id === order.id}
              onClick={() => setSelected(order)}
              badge={<StatusPill status={order.status} />}
            />
          ))
        )
      }
      detailChildren={
        <OrderDetailPanel order={selected} companyId={companyId} />
      }
    />
  );
}
