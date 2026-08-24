import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: number | null;
  iconColor?: string;
  accentClass?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  iconColor = "text-primary",
  accentClass = "bg-primary/10",
}: StatCardProps) {
  const isPositive = trend == null || trend >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="glass-surface rounded-2xl p-5 flex flex-col gap-3 hover:shadow-lg transition-all duration-200 group">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <div
          className={cn(
            "h-8 w-8 rounded-xl flex items-center justify-center shrink-0",
            accentClass,
          )}
        >
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      </div>

      {/* Value */}
      <p className="text-2xl font-extrabold tracking-tight text-foreground leading-none">
        {value}
      </p>

      {/* Trend badge */}
      {trend != null && (
        <div
          className={cn(
            "flex items-center gap-1 text-[11px] font-semibold w-fit px-2 py-0.5 rounded-full",
            isPositive
              ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400"
              : "text-rose-500 bg-rose-500/10",
          )}
        >
          <TrendIcon className="h-3 w-3" />
          <span>{Math.abs(trend).toFixed(1)}% vs last month</span>
        </div>
      )}
    </div>
  );
}
