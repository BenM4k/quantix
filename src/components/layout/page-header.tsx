import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

export function PageHeader({
  title,
  description,
  actions,
  icon: Icon,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-6 glass-surface p-8 md:p-10 rounded-2xl border border-border/80 shadow-xs",
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          {Icon && <Icon className="h-6 w-6 text-primary" />}
          <span>{title}</span>
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3 shrink-0">{actions}</div>
      )}
    </div>
  );
}
