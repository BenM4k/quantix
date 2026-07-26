"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { canX } from "@/lib/permissions";
import {
  Users,
  Warehouse,
  Package,
  UserCheck,
  Settings,
  LayoutDashboard,
  LogOut,
  Building2,
} from "lucide-react";

interface SidebarProps {
  company: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
  };
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  };
  role: string;
}

export function Sidebar({ company, user, role }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Dashboard",
      href: `/${company.id}/dashboard`,
      icon: LayoutDashboard,
      action: "report:view",
    },
    {
      label: "Products",
      href: `/${company.id}/inventory/products`,
      icon: Package,
      action: "product:view",
    },
    {
      label: "Customers",
      href: `/${company.id}/sales/customers`,
      icon: UserCheck,
      action: "customer:view",
    },
    {
      label: "Warehouse Settings",
      href: `/${company.id}/settings/warehouse`,
      icon: Warehouse,
      action: "warehouse:view",
    },
    {
      label: "User Management",
      href: `/${company.id}/settings/users`,
      icon: Users,
      action: "user:view",
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    canX(role, company, item.action),
  );

  return (
    <aside className="w-64 h-screen sticky top-0 border-r border-border/60 bg-card/40 backdrop-blur-xl flex flex-col justify-between p-4 z-30">
      <div className="space-y-6">
        {/* Company Header */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-card/60 border border-border/40">
          <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
            {company.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo} alt={company.name} className="h-full w-full object-cover rounded-lg" />
            ) : (
              <Building2 className="h-5 w-5" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-foreground truncate">{company.name}</span>
            <span className="text-[11px] text-muted-foreground capitalize">{role} role</span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
            Master Data & Settings
          </div>
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="border-t border-border/40 pt-4 px-2 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-foreground">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name} className="h-full w-full object-cover rounded-full" />
            ) : (
              user.name.substring(0, 2).toUpperCase()
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-foreground truncate">{user.name}</span>
            <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
