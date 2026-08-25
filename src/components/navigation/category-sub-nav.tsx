"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SubNavItem {
  label: string;
  href: string;
  badge?: string | number;
}

interface CategorySubNavProps {
  items: SubNavItem[];
  className?: string;
}

export function CategorySubNav({ items, className }: CategorySubNavProps) {
  const pathname = usePathname();

  // Find the single most specific matching item (longest matching href)
  const matchingItems = items.filter(
    (item) => item.href === pathname || pathname.startsWith(`${item.href}/`),
  );
  const bestMatchHref = matchingItems.sort(
    (a, b) => b.href.length - a.href.length,
  )[0]?.href;

  return (
    <div className={cn("overflow-x-auto no-scrollbar py-1", className)}>
      <nav className="inline-flex items-center gap-1 sm:gap-1.5">
        {items.map((item) => {
          const isActive = item.href === bestMatchHref;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors shrink-0",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
              )}
            >
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] tabular-nums",
                    isActive
                      ? "bg-primary/10 text-primary font-bold"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
