import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, LucideIcon, ArrowUpRight } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: number | null;
  trendLabel?: string;
  iconClassName?: string;
  className?: string;
  variant?: "default" | "bars" | "sparkline" | "pills";
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel = "from last month",
  iconClassName,
  className,
  variant = "default",
}: KpiCardProps) {
  const isPositive = trend == null || trend >= 0;

  return (
    <div
      className={cn(
        "rounded-[28px] border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition-all duration-200 relative overflow-hidden group",
        className,
      )}
    >
      {/* Top row: Label + Round Icon Badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground tracking-tight">
          {label}
        </span>
        <div
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border border-border/40 shadow-xs transition-transform group-hover:scale-105",
            iconClassName || "bg-primary/10 text-primary",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {/* Main value */}
      <div className="space-y-1">
        <p className="text-2xl sm:text-[28px] font-black tracking-tight text-foreground leading-none font-sans">
          {value}
        </p>

        {/* Trend Indicator */}
        {trend != null && (
          <div
            className={cn(
              "flex items-center gap-1 text-[11px] font-semibold pt-1",
              isPositive
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-rose-500 dark:text-rose-400",
            )}
          >
            {isPositive ? (
              <span className="text-xs font-bold">↑</span>
            ) : (
              <span className="text-xs font-bold">↓</span>
            )}
            <span>
              {Math.abs(trend).toFixed(1)}% {trendLabel}
            </span>
          </div>
        )}
        {trend == null && trendLabel && (
          <p className="text-[11px] font-medium text-muted-foreground pt-1">
            {trendLabel}
          </p>
        )}
      </div>

      {/* Mini Visual Decorations to match the reference design */}
      {variant === "bars" && (
        <div className="pt-2 flex items-end gap-1.5 h-12">
          {[35, 50, 40, 75, 60, 95].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-full rounded-full transition-all",
                  i === 5
                    ? "bg-indigo-600 dark:bg-indigo-500"
                    : "bg-indigo-200 dark:bg-indigo-950/60",
                )}
                style={{ height: `${h}%` }}
              />
              <span className="text-[8px] text-muted-foreground font-mono">
                {["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i]}
              </span>
            </div>
          ))}
        </div>
      )}

      {variant === "sparkline" && (
        <div className="pt-2 h-10 flex items-center">
          <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 30" fill="none">
            <path
              d="M0 24 Q 20 22, 35 15 T 70 10 T 100 4"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-indigo-500"
              strokeLinecap="round"
            />
            {[
              { cx: 0, cy: 24 },
              { cx: 35, cy: 15 },
              { cx: 70, cy: 10 },
              { cx: 100, cy: 4 },
            ].map((p, i) => (
              <circle
                key={i}
                cx={p.cx}
                cy={p.cy}
                r="3"
                className="fill-white stroke-indigo-600 stroke-2"
              />
            ))}
          </svg>
        </div>
      )}
    </div>
  );
}
