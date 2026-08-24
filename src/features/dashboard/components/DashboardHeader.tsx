"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { signOutAction } from "@/app/api/auth/[...all]/actions/auth.actions";
import { useTransition } from "react";
import {
  LayoutDashboard,
  Package,
  FileText,
  BookOpen,
  Users,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  user: { name: string; email: string; image?: string | null };
  company: { id: string; name: string };
  role: string;
}

const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Invoices", icon: FileText },
  { label: "Orders", icon: Package },
  { label: "Accounting", icon: BookOpen },
  { label: "Customers", icon: Users },
];

export function DashboardHeader({ user, company, role }: DashboardHeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      const res = await signOutAction();
      if (res.ok) router.push("/sign-in");
    });
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center glow-sm">
            <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-extrabold text-foreground leading-none">Quantix</p>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5 capitalize">{role}</p>
          </div>
        </div>

        {/* Center pill nav — FINNOVA-style dark pill */}
        <nav className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-full bg-secondary/80 border border-border/60 backdrop-blur-sm">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150",
                  item.active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />

          {/* Go to app button */}
          <Link
            href={`/${company.id}/inventory/products`}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all border border-border/60"
          >
            App
            <ChevronRight className="h-3 w-3" />
          </Link>

          {/* User avatar + logout */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary overflow-hidden">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user.name?.substring(0, 2).toUpperCase() || "U"
              )}
            </div>
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
