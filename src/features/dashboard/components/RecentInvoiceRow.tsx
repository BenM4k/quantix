import { cn } from "@/lib/utils";
import type { RecentInvoice } from "@/dal/dashboard/queries";

const STATUS_STYLES: Record<
  string,
  { label: string; className: string }
> = {
  paid: {
    label: "Paid",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  sent: {
    label: "Sent",
    className:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  unpaid: {
    label: "Unpaid",
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  partial: {
    label: "Partial",
    className:
      "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  },
  draft: {
    label: "Draft",
    className:
      "bg-muted text-muted-foreground border-border",
  },
  void: {
    label: "Void",
    className:
      "bg-rose-500/10 text-rose-500 border-rose-500/20",
  },
};

interface RecentInvoiceRowProps {
  invoice: RecentInvoice;
  isSelected?: boolean;
  currency: string;
}

function formatCurrency(amount: string | number, currency: string) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(num || 0);
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function RecentInvoiceRow({
  invoice,
  isSelected,
  currency,
}: RecentInvoiceRowProps) {
  const statusConfig = STATUS_STYLES[invoice.status] ?? STATUS_STYLES.draft;

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-150 cursor-pointer group",
        isSelected
          ? "bg-primary text-primary-foreground shadow-md"
          : "hover:bg-muted/60",
      )}
    >
      {/* Avatar placeholder */}
      <div
        className={cn(
          "h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
          isSelected
            ? "bg-primary-foreground/20 text-primary-foreground"
            : "bg-primary/10 text-primary",
        )}
      >
        {invoice.customerName.substring(0, 2).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-semibold truncate",
            isSelected ? "text-primary-foreground" : "text-foreground",
          )}
        >
          {invoice.invoiceNumber}
        </p>
        <p
          className={cn(
            "text-xs truncate",
            isSelected
              ? "text-primary-foreground/70"
              : "text-muted-foreground",
          )}
        >
          {invoice.customerName}
        </p>
      </div>

      {/* Status badge */}
      <span
        className={cn(
          "text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0",
          isSelected
            ? "bg-primary-foreground/15 text-primary-foreground border-primary-foreground/20"
            : statusConfig.className,
        )}
      >
        {statusConfig.label}
      </span>

      {/* Amount */}
      <p
        className={cn(
          "text-sm font-bold shrink-0",
          isSelected ? "text-primary-foreground" : "text-foreground",
        )}
      >
        {formatCurrency(invoice.total, currency)}
      </p>

      {/* Due date */}
      <p
        className={cn(
          "text-[11px] shrink-0 hidden sm:block",
          isSelected ? "text-primary-foreground/60" : "text-muted-foreground",
        )}
      >
        Due {formatDate(invoice.dueDate)}
      </p>
    </div>
  );
}
