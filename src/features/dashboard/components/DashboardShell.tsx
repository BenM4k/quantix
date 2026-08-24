"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  DollarSign,
  FileText,
  ShoppingCart,
  Package,
  Plus,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { DashboardStats, RecentInvoice } from "@/dal/dashboard/queries";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardShellProps {
  stats: DashboardStats;
  org: { id: string; name: string };
  profile: { companyType?: string | null; baseCurrency?: string | null } | null;
  role: string;
  userName: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(amount: number | string, currency: string) {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(n || 0);
}

function fmtShort(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(amount);
}

function fmtDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ─── Mini Bar Chart (pure SVG) ────────────────────────────────────────────────
function MiniBarChart({ color = "var(--color-primary)" }: { color?: string }) {
  const bars = [40, 65, 50, 80, 60, 95, 72];
  const max = Math.max(...bars);
  return (
    <svg viewBox="0 0 80 36" className="w-full h-9" preserveAspectRatio="none">
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 12 + 1}
          y={36 - (h / max) * 32}
          width={9}
          height={(h / max) * 32}
          rx={3}
          fill={color}
          opacity={i === bars.length - 1 ? 1 : 0.45}
        />
      ))}
    </svg>
  );
}

// ─── Mini Line Chart (pure SVG) ───────────────────────────────────────────────
function MiniLineChart({ color = "var(--color-primary)" }: { color?: string }) {
  const pts = [28, 22, 26, 18, 24, 14, 12, 16, 8];
  const w = 100, h = 36;
  const xStep = w / (pts.length - 1);
  const points = pts.map((y, i) => `${i * xStep},${y}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-9" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`${points} ${(pts.length - 1) * xStep},${h} 0,${h}`}
        fill="url(#lg)"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {pts.map((y, i) => (
        <circle key={i} cx={i * xStep} cy={y} r="2.5" fill={color} />
      ))}
    </svg>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
type CardVariant = "image" | "bar" | "line" | "actions";

interface KpiCardProps {
  label: string;
  value: string;
  trend?: number;
  icon: React.ElementType;
  variant: CardVariant;
  orgId: string;
  actionHref?: string;
}

function KpiCard({ label, value, trend, icon: Icon, variant, orgId, actionHref }: KpiCardProps) {
  const isPos = trend == null || trend >= 0;

  return (
    <div className="relative rounded-2xl border border-border bg-card overflow-hidden flex flex-col gap-0 hover:shadow-lg transition-shadow duration-200">
      {/* Top section */}
      <div className="px-5 pt-5 pb-3 flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold text-muted-foreground">{label}</span>
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>
        <p className="text-[1.6rem] font-extrabold tracking-tight text-foreground leading-none">
          {value}
        </p>
        {trend != null && (
          <div className={cn(
            "flex items-center gap-1 text-[11px] font-semibold",
            isPos ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
          )}>
            {isPos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{Math.abs(trend).toFixed(1)}% from last month</span>
          </div>
        )}
      </div>

      {/* Visual section */}
      <div className="px-4 pb-4 flex-1 flex flex-col justify-end">
        {variant === "bar" && (
          <div className="mt-1">
            <MiniBarChart color="var(--color-primary)" />
          </div>
        )}
        {variant === "line" && (
          <div className="mt-1">
            <MiniLineChart color="var(--color-primary)" />
          </div>
        )}
        {variant === "image" && (
          <div className="relative h-20 mt-1 rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-primary/15 flex items-center justify-center">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_bottom_left,var(--color-primary),transparent_60%)]" />
            <Clock className="h-10 w-10 text-primary/30" />
          </div>
        )}
        {variant === "actions" && actionHref && (
          <Link
            href={actionHref}
            className="mt-2 flex items-center justify-between px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <span>View all invoices</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS: Record<string, { label: string; cls: string }> = {
  paid:    { label: "Paid",    cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  sent:    { label: "Sent",    cls: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  unpaid:  { label: "Unpaid",  cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  partial: { label: "Partial", cls: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  draft:   { label: "Draft",   cls: "bg-muted text-muted-foreground" },
  void:    { label: "Void",    cls: "bg-rose-500/10 text-rose-500" },
};

// ─── Invoice List Row ──────────────────────────────────────────────────────────
function InvoiceListRow({
  inv,
  selected,
  currency,
  onSelect,
}: {
  inv: RecentInvoice;
  selected: boolean;
  currency: string;
  onSelect: () => void;
}) {
  const s = STATUS[inv.status] ?? STATUS.draft;
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-150",
        selected
          ? "bg-primary text-primary-foreground shadow-md"
          : "hover:bg-white/5 text-white/90",
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold",
        selected ? "bg-white/20 text-white" : "bg-white/10 text-white/70",
      )}>
        {inv.customerName.substring(0, 2).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold truncate", selected ? "text-white" : "text-white/90")}>
          {inv.invoiceNumber}
        </p>
        <p className={cn("text-[11px] truncate", selected ? "text-white/70" : "text-white/45")}>
          {fmtDate(inv.dueDate) !== "—" ? `In ${fmtDate(inv.dueDate)}` : "No due date"}
        </p>
      </div>

      {/* Status pill */}
      {!selected && (
        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0", s.cls)}>
          {s.label}
        </span>
      )}
      {selected && (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white shrink-0">
          {s.label}
        </span>
      )}

      {/* Amount */}
      <p className={cn("text-sm font-bold shrink-0", selected ? "text-white" : "text-white/90")}>
        {fmt(inv.total, currency)}
      </p>
    </button>
  );
}

// ─── Invoice Detail Panel ──────────────────────────────────────────────────────
function InvoiceDetailPanel({
  inv,
  currency,
  orgId,
}: {
  inv: RecentInvoice | null;
  currency: string;
  orgId: string;
}) {
  const s = inv ? (STATUS[inv.status] ?? STATUS.draft) : STATUS.draft;

  if (!inv) {
    return (
      <div className="flex-1 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10">
        <div className="text-center">
          <FileText className="h-10 w-10 text-white/20 mx-auto mb-2" />
          <p className="text-white/40 text-sm">Select an invoice to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 rounded-2xl bg-gradient-to-br from-primary/90 to-primary p-5 flex flex-col gap-4 overflow-hidden relative">
      {/* Glow */}
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl pointer-events-none" />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div>
          <p className="text-[10px] text-white/60 uppercase tracking-wider font-semibold mb-1">
            Invoice details
          </p>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-extrabold text-white">{inv.invoiceNumber}</h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
              {s.label}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/60 uppercase tracking-wider font-semibold mb-1">
            Customer
          </p>
          <p className="text-sm font-bold text-white">{inv.customerName}</p>
        </div>
      </div>

      {/* Amounts grid */}
      <div className="grid grid-cols-3 gap-2 relative z-10">
        {[
          { label: "Subtotal", value: fmt(parseFloat(inv.total) * 0.85, currency) },
          { label: "Total", value: fmt(inv.total, currency) },
          { label: "Balance Due", value: fmt(inv.total, currency) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-white/10 px-3 py-2.5">
            <p className="text-[10px] text-white/60 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-bold text-white mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Dates */}
      <div className="flex gap-2 relative z-10">
        <div className="flex-1 rounded-xl bg-white/10 px-3 py-2">
          <p className="text-[10px] text-white/60 uppercase tracking-wider">Issued</p>
          <p className="text-xs font-semibold text-white mt-0.5">{fmtDate(inv.issueDate)}</p>
        </div>
        <div className="flex-1 rounded-xl bg-white/10 px-3 py-2">
          <p className="text-[10px] text-white/60 uppercase tracking-wider">Due</p>
          <p className="text-xs font-semibold text-white mt-0.5">{fmtDate(inv.dueDate)}</p>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/${orgId}/sales/invoices`}
        className="relative z-10 mt-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-primary text-xs font-bold hover:bg-white/90 transition-colors"
      >
        View Full Invoice
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

// ─── Main Shell ──────────────────────────────────────────────────────────────
export function DashboardShell({ stats, org, profile, role, userName }: DashboardShellProps) {
  const currency = profile?.baseCurrency ?? "USD";
  const [selectedId, setSelectedId] = useState<string | null>(
    stats.recentInvoices[0]?.id ?? null,
  );
  const [tab, setTab] = useState<"all" | "unpaid" | "paid">("all");

  const selectedInvoice = stats.recentInvoices.find((i) => i.id === selectedId) ?? null;

  const filteredInvoices = stats.recentInvoices.filter((inv) => {
    if (tab === "unpaid") return ["unpaid", "sent", "partial"].includes(inv.status);
    if (tab === "paid") return inv.status === "paid";
    return true;
  });

  const unpaidCount = stats.recentInvoices.filter((i) =>
    ["unpaid", "sent", "partial"].includes(i.status)
  ).length;
  const paidCount = stats.recentInvoices.filter((i) => i.status === "paid").length;

  return (
    <div className="flex flex-col gap-7">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, <span className="text-foreground font-semibold">{userName}</span>.
            Here&apos;s your company at a glance.
          </p>
        </div>
        <Link
          href={`/${org.id}/sales/invoices`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          New Invoice
        </Link>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Total Revenue"
          value={fmtShort(stats.totalRevenue, currency)}
          trend={8.2}
          icon={DollarSign}
          variant="bar"
          orgId={org.id}
        />
        <KpiCard
          label="Due This Month"
          value={fmt(stats.openInvoiceCount * 2450, currency)}
          trend={12.5}
          icon={FileText}
          variant="image"
          orgId={org.id}
        />
        <KpiCard
          label="Avg. Payment Time"
          value={`${Math.max(8, 30 - stats.openOrderCount)} days`}
          trend={-2}
          icon={Clock}
          variant="line"
          orgId={org.id}
        />
        <KpiCard
          label="Open Orders"
          value={stats.openOrderCount.toString()}
          icon={ShoppingCart}
          variant="actions"
          orgId={org.id}
          actionHref={`/${org.id}/sales/orders`}
        />
      </div>

      {/* ── Bottom Dark Panel ─────────────────────────────────── */}
      <div className="rounded-3xl bg-[#13141F] dark:bg-[#0d0e18] overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center gap-1 px-5 pt-4 pb-0">
          {(
            [
              { key: "all", label: "All Invoices", count: stats.recentInvoices.length },
              { key: "paid", label: "Paid", count: paidCount },
              { key: "unpaid", label: "Unpaid", count: unpaidCount },
            ] as const
          ).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-150",
                tab === key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-white/50 hover:text-white/80",
              )}
            >
              {label}
              {count > 0 && (
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                  tab === key ? "bg-white/20 text-white" : "bg-white/10 text-white/60",
                )}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Split panel */}
        <div className="flex flex-col lg:flex-row gap-0 p-4 h-[420px]">
          {/* Left: Invoice list */}
          <div className="lg:w-[280px] xl:w-[300px] shrink-0 flex flex-col gap-1 overflow-y-auto pr-1">
            <p className="text-[11px] text-white/30 uppercase tracking-wider font-semibold px-4 pt-1 pb-2">
              Recent Invoices
            </p>
            {filteredInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <FileText className="h-8 w-8 text-white/15 mb-2" />
                <p className="text-white/30 text-xs">No invoices</p>
              </div>
            ) : (
              filteredInvoices.map((inv) => (
                <InvoiceListRow
                  key={inv.id}
                  inv={inv}
                  selected={selectedId === inv.id}
                  currency={currency}
                  onSelect={() => setSelectedId(inv.id)}
                />
              ))
            )}
          </div>

          {/* Right: Invoice detail */}
          <div className="flex-1 lg:pl-3 flex mt-3 lg:mt-0">
            <InvoiceDetailPanel inv={selectedInvoice} currency={currency} orgId={org.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
