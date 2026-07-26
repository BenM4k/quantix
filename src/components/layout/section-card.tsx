import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "glass" | "elevated" | "solid";
}

export function SectionCard({
  children,
  variant = "glass",
  className,
  ...props
}: SectionCardProps) {
  const variantClass =
    variant === "elevated"
      ? "glass-surface-elevated"
      : variant === "solid"
      ? "bg-[var(--surface-solid)] border border-border/80"
      : "glass-surface";

  return (
    <div
      className={cn(
        "p-8 md:p-10 rounded-2xl border border-border/80 shadow-xs",
        variantClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
