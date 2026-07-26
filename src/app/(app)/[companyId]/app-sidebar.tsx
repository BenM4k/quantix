"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { canX } from "@/lib/permissions";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
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
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  slug?: string;
  logo?: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface AppSidebarProps {
  company: Company;
  user: User;
  role?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  action?: string;
  alwaysShow?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function AppSidebar({ company, user, role }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navGroups: NavGroup[] = [
    {
      title: "Overview",
      items: [
        {
          label: "Home Page",
          href: "/",
          icon: Home,
          alwaysShow: true,
        },
      ],
    },
    {
      title: "Core Operations",
      items: [
        {
          label: "Products",
          href: `/${company.id}/inventory/products`,
          icon: Package,
          action: "product:view",
        },
        {
          label: "Stock Activity",
          href: `/${company.id}/inventory/stock-ledger`,
          icon: Layers,
          action: "product:view",
        },
        {
          label: "Customers",
          href: `/${company.id}/sales/customers`,
          icon: UserCheck,
          action: "customer:view",
        },
      ],
    },
    {
      title: "Sales & Invoicing",
      items: [
        {
          label: "Quotes",
          href: `/${company.id}/sales/quotes`,
          icon: FileText,
          action: "quote:view",
        },
        {
          label: "Sales Orders",
          href: `/${company.id}/sales/orders`,
          icon: Layers,
          action: "order:view",
        },
        {
          label: "Invoices",
          href: `/${company.id}/sales/invoices`,
          icon: BookOpen,
          action: "invoice:view",
        },
      ],
    },
    {
      title: "Accounting",
      items: [
        {
          label: "Account Categories",
          href: `/${company.id}/accounting/chart-of-accounts`,
          icon: BookOpen,
          action: "account:view",
        },
        {
          label: "Transactions",
          href: `/${company.id}/accounting/journal-entries`,
          icon: FileText,
          action: "journal_entry:view",
        },
        {
          label: "Fiscal Periods",
          href: `/${company.id}/accounting/periods`,
          icon: Calendar,
          action: "period:view",
        },
      ],
    },
    {
      title: "Financial Reports",
      items: [
        {
          label: "Profit & Loss",
          href: `/${company.id}/accounting/reports/p-and-l`,
          icon: TrendingUp,
          action: "journal_entry:view",
        },
        {
          label: "Balance Sheet",
          href: `/${company.id}/accounting/reports/balance-sheet`,
          icon: Scale,
          action: "journal_entry:view",
        },
        {
          label: "AR Aging",
          href: `/${company.id}/sales/reports/ar-aging`,
          icon: Clock,
          action: "invoice:view",
        },
        {
          label: "Stock Valuation",
          href: `/${company.id}/inventory/reports/stock-valuation`,
          icon: Package,
          action: "product:view",
        },
      ],
    },
    {
      title: "Settings & Administration",
      items: [
        {
          label: "Company Settings",
          href: `/${company.id}/settings/company`,
          icon: Building2,
          action: "company:view",
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
      ],
    },
  ];

  return (
    <Sidebar variant="inset" collapsible="icon">
      {/* Sidebar Header */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-bold overflow-hidden shrink-0">
            {company.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo} alt={company.name} className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-5 w-5" />
            )}
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-foreground truncate">{company.name}</span>
            <span className="text-[10px] text-muted-foreground capitalize font-medium">{role} role</span>
          </div>
        </div>
      </SidebarHeader>

      {/* Sidebar Content with Structured Groups & Spacing */}
      <SidebarContent className="space-y-4 py-2">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => item.alwaysShow || canX(role, company, item.action!),
          );

          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={group.title} className="px-2">
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80 px-2 mb-1">
                {group.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={item.label}
                          onClick={() => router.push(item.href)}
                          className="h-9 px-2.5 text-xs font-medium"
                        >
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground group-data-[active=true]:text-sidebar-primary" />
                          <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
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

      {/* Sidebar Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-foreground shrink-0 overflow-hidden">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user.name ? user.name.substring(0, 2).toUpperCase() : "U"
            )}
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-medium text-sidebar-foreground truncate">{user.name}</span>
            <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
