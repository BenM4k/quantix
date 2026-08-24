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
      <nav className="inline-flex items-center gap-1 bg-primary/30 text-foreground p-1.5 rounded-full shadow-sm border border-primary/25 backdrop-blur-md">
        {items.map((item) => {
          const isActive = item.href === bestMatchHref;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-150 shrink-0",
                isActive
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/20",
              )}
            >
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums",
                    isActive
                      ? "bg-primary-foreground text-primary font-black"
                      : "bg-primary/20 text-foreground/80",
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
