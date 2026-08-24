"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { canX } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  Users,
  Warehouse,
  Package,
  UserCheck,
  Building2,
  BookOpen,
  FileText,
  Calendar,
  Layers,
  LucideIcon,
  TrendingUp,
  Scale,
  Clock,
  ChevronRight,
} from "lucide-react";

interface Company { id: string; name: string; slug?: string; logo?: string | null }
interface User { id: string; name: string; email: string; image?: string | null }
interface AppSidebarProps { company: Company; user: User; role?: string }
interface NavItem { label: string; href: string; icon: LucideIcon; action?: string; alwaysShow?: boolean }
interface NavGroup { title: string; items: NavItem[] }

export function AppSidebar({ company, user, role }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const navGroups: NavGroup[] = [
    {
      title: "Overview",
      items: [
        { label: "Home", href: "/", icon: Home, alwaysShow: true },
      ],
    },
    {
      title: "Operations",
      items: [
        { label: "Products", href: `/${company.id}/inventory/products`, icon: Package, action: "product:view" },
        { label: "Stock Activity", href: `/${company.id}/inventory/stock-ledger`, icon: Layers, action: "product:view" },
        { label: "Customers", href: `/${company.id}/sales/customers`, icon: UserCheck, action: "customer:view" },
      ],
    },
    {
      title: "Sales",
      items: [
        { label: "Quotes", href: `/${company.id}/sales/quotes`, icon: FileText, action: "quote:view" },
        { label: "Sales Orders", href: `/${company.id}/sales/orders`, icon: Layers, action: "order:view" },
        { label: "Invoices", href: `/${company.id}/sales/invoices`, icon: BookOpen, action: "invoice:view" },
      ],
    },
    {
      title: "Accounting",
      items: [
        { label: "Chart of Accounts", href: `/${company.id}/accounting/chart-of-accounts`, icon: BookOpen, action: "account:view" },
        { label: "Transactions", href: `/${company.id}/accounting/journal-entries`, icon: FileText, action: "journal_entry:view" },
        { label: "Fiscal Periods", href: `/${company.id}/accounting/periods`, icon: Calendar, action: "period:view" },
      ],
    },
    {
      title: "Reports",
      items: [
        { label: "Profit & Loss", href: `/${company.id}/accounting/reports/p-and-l`, icon: TrendingUp, action: "journal_entry:view" },
        { label: "Balance Sheet", href: `/${company.id}/accounting/reports/balance-sheet`, icon: Scale, action: "journal_entry:view" },
        { label: "AR Aging", href: `/${company.id}/sales/reports/ar-aging`, icon: Clock, action: "invoice:view" },
        { label: "Stock Valuation", href: `/${company.id}/inventory/reports/stock-valuation`, icon: Package, action: "product:view" },
      ],
    },
    {
      title: "Settings",
      items: [
        { label: "Company", href: `/${company.id}/settings/company`, icon: Building2, action: "company:view" },
        { label: "Warehouse", href: `/${company.id}/settings/warehouse`, icon: Warehouse, action: "warehouse:view" },
        { label: "Users", href: `/${company.id}/settings/users`, icon: Users, action: "user:view" },
      ],
    },
  ];

  return (
    <Sidebar variant="inset" collapsible="icon">
      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shrink-0 overflow-hidden">
            {company.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo} alt={company.name} className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-4 w-4 text-primary-foreground" />
            )}
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold text-sidebar-foreground truncate leading-none">{company.name}</span>
            <span className="text-[10px] text-muted-foreground capitalize mt-0.5 font-medium">{role}</span>
          </div>
        </div>
      </SidebarHeader>

      {/* Nav Groups */}
      <SidebarContent className="py-3 gap-0">
        {navGroups.map((group) => {
          const visible = group.items.filter(
            (item) => item.alwaysShow || canX(role, company, item.action!),
          );
          if (visible.length === 0) return null;

          return (
            <SidebarGroup key={group.title} className="px-2 py-1">
              {/* Group label */}
              <div className={cn(
                "px-3 mb-1 flex items-center gap-2 group-data-[collapsible=icon]:hidden"
              )}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  {group.title}
                </span>
                <div className="flex-1 h-px bg-border/60" />
              </div>

              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {visible.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={item.label}
                          onClick={() => router.push(item.href)}
                          className={cn(
                            "h-9 px-3 rounded-xl text-xs font-medium transition-all duration-150",
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                          )}
                        >
                          <Icon className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground",
                          )} />
                          <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                          {isActive && !collapsed && (
                            <ChevronRight className="h-3 w-3 ml-auto text-primary/50" />
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 overflow-hidden">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user.name?.substring(0, 2).toUpperCase() || "U"
            )}
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-semibold text-sidebar-foreground truncate leading-none">{user.name}</span>
            <span className="text-[10px] text-muted-foreground truncate mt-0.5">{user.email}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
