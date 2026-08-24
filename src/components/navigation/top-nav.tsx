"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { setActiveCompanyAction } from "@/app/profile/actions";
import { signOutAction } from "@/app/api/auth/[...all]/actions/auth.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Building2,
  Check,
  ChevronDown,
  User,
  LogOut,
  Home,
  Settings,
  Package,
  UserCheck,
  Warehouse,
  Users,
  Loader2,
  BookOpen,
  FileText,
  Calendar,
  Plus,
  Search,
  Layers,
  BarChart3,
  Scale,
  Clock,
  TrendingUp,
  Sliders,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrganizationItem {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

interface TopNavProps {
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
  role?: string;
  organizations: OrganizationItem[];
}

export function TopNav({ company, user, role, organizations }: TopNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [openCommand, setOpenCommand] = React.useState(false);
  const [isSwitching, startSwitchTransition] = React.useTransition();
  const [isLoggingOut, startLogoutTransition] = React.useTransition();

  // Cmd+K listener
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenCommand((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSwitchCompany = (orgId: string) => {
    if (orgId === company.id) return;
    startSwitchTransition(async () => {
      const res = await setActiveCompanyAction(orgId);
      if (res.ok) {
        router.push(`/${orgId}`);
        router.refresh();
      }
    });
  };

  const handleLogout = () => {
    startLogoutTransition(async () => {
      const res = await signOutAction();
      if (res.ok) {
        router.push("/sign-in");
        router.refresh();
      }
    });
  };

  const base = `/${company.id}`;

  const navCategories = [
    {
      id: "overview",
      label: "Overview",
      href: base,
      icon: Home,
      isActive: pathname === base || pathname === `${base}/overview`,
    },
    {
      id: "operations",
      label: "Operations",
      href: `${base}/operations`,
      icon: Layers,
      isActive:
        pathname.startsWith(`${base}/operations`) ||
        pathname.startsWith(`${base}/inventory`),
    },
    {
      id: "sales",
      label: "Sales",
      href: `${base}/sales`,
      icon: UserCheck,
      isActive: pathname.startsWith(`${base}/sales`),
    },
    {
      id: "accounting",
      label: "Accounting",
      href: `${base}/accounting`,
      icon: BookOpen,
      isActive: pathname.startsWith(`${base}/accounting`),
    },
    {
      id: "reports",
      label: "Reports",
      href: `${base}/reports`,
      icon: BarChart3,
      isActive:
        pathname.startsWith(`${base}/reports`) ||
        pathname.includes("/reports/"),
    },
    {
      id: "settings",
      label: "Settings",
      href: `${base}/settings`,
      icon: Sliders,
      isActive: pathname.startsWith(`${base}/settings`),
    },
  ];

  return (
    <>
      <header className="w-full sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border/60 py-4 sm:py-5 px-4 sm:px-6 lg:px-8 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: App Logo & Org Switcher */}
          <div className="flex items-center gap-3.5">
            <Link
              href="/"
              className="flex items-center gap-2.5 group shrink-0"
            >
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md group-hover:scale-105 transition-transform">
                <span className="font-black text-sm tracking-tighter">QX</span>
              </div>
              <span className="font-black text-base tracking-tight text-foreground hidden md:inline-block">
                Quantix
              </span>
            </Link>

            {/* Org Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={isSwitching}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/80 bg-card hover:bg-muted/60 text-xs font-medium text-foreground transition-all cursor-pointer shadow-xs"
              >
                <div className="h-4.5 w-4.5 rounded-md bg-primary/15 text-primary flex items-center justify-center overflow-hidden shrink-0">
                  {company.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-3 w-3 text-primary" />
                  )}
                </div>
                <span className="max-w-[110px] sm:max-w-[140px] truncate font-semibold">
                  {company.name}
                </span>
                {isSwitching ? (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Organizations
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {organizations.map((org) => {
                  const isCurrent = org.id === company.id;
                  return (
                    <DropdownMenuItem
                      key={org.id}
                      onClick={() => handleSwitchCompany(org.id)}
                      className="flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{org.name}</span>
                      </div>
                      {isCurrent && (
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Center: Top-Level Pill Navigation Container (30% Primary with 100% Active) */}
          <nav className="hidden lg:flex items-center bg-primary/30 text-foreground p-1.5 rounded-full shadow-md border border-primary/25 backdrop-blur-md">
            {navCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full transition-all duration-150",
                    cat.isActive
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "text-foreground/80 hover:text-foreground hover:bg-primary/20"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{cat.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Search, Theme Toggle & User Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpenCommand(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/80 bg-card hover:bg-muted/60 text-xs text-muted-foreground transition-all cursor-pointer shadow-xs"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline-block">Search...</span>
              <kbd className="hidden sm:inline-flex h-4.5 items-center gap-0.5 rounded border border-border bg-muted px-1 font-mono text-[9px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </button>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger className="h-9 w-9 rounded-full bg-primary text-primary-foreground border border-primary/30 flex items-center justify-center text-xs font-extrabold hover:opacity-90 transition-opacity overflow-hidden cursor-pointer shadow-xs">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : user.name ? (
                  user.name.substring(0, 2).toUpperCase()
                ) : (
                  <User className="h-4 w-4" />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {user.email}
                    </p>
                    {role && (
                      <span className="inline-block text-[10px] uppercase font-bold text-primary">
                        {role}
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="text-xs cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5 mr-2" />
                  <span>Profile & Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/")}
                  className="text-xs cursor-pointer"
                >
                  <Home className="h-3.5 w-3.5 mr-2" />
                  <span>Landing Page</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-xs text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5 mr-2" />
                  <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Horizontal Pill Scrollbar */}
        <div className="flex lg:hidden mt-2.5 overflow-x-auto no-scrollbar pt-1 pb-0.5">
          <nav className="flex items-center bg-primary/30 text-foreground p-1 rounded-full shadow-md border border-primary/25 mx-auto backdrop-blur-md">
            {navCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full shrink-0 transition-all duration-150",
                    cat.isActive
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "text-foreground/80 hover:text-foreground"
                  )}
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  <span>{cat.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Command Palette */}
      <CommandDialog open={openCommand} onOpenChange={setOpenCommand}>
        <CommandInput placeholder="Search commands, modules, records..." />
        <CommandList className="p-2">
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="ERP Categories">
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(base);
              }}
            >
              <Home className="mr-2 h-4 w-4 text-indigo-500" />
              <span>Overview</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`${base}/operations`);
              }}
            >
              <Layers className="mr-2 h-4 w-4 text-blue-500" />
              <span>Operations</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`${base}/sales`);
              }}
            >
              <UserCheck className="mr-2 h-4 w-4 text-emerald-500" />
              <span>Sales</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`${base}/accounting`);
              }}
            >
              <BookOpen className="mr-2 h-4 w-4 text-amber-500" />
              <span>Accounting</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`${base}/reports`);
              }}
            >
              <BarChart3 className="mr-2 h-4 w-4 text-purple-500" />
              <span>Reports</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`${base}/settings`);
              }}
            >
              <Sliders className="mr-2 h-4 w-4 text-slate-500" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`${base}/inventory/products`);
              }}
            >
              <Plus className="mr-2 h-4 w-4 text-emerald-500" />
              <span>Create Product</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`${base}/sales/customers`);
              }}
            >
              <Plus className="mr-2 h-4 w-4 text-blue-500" />
              <span>Add Customer</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`${base}/sales/orders/new`);
              }}
            >
              <Plus className="mr-2 h-4 w-4 text-indigo-500" />
              <span>New Sales Order</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`${base}/sales/quotes/new`);
              }}
            >
              <Plus className="mr-2 h-4 w-4 text-sky-500" />
              <span>New Quote</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`${base}/accounting/journal-entries/new`);
              }}
            >
              <Plus className="mr-2 h-4 w-4 text-purple-500" />
              <span>New Manual Journal Entry</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="All Modules">
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`${base}/inventory/products`);
              }}
            >
              <Package className="mr-2 h-4 w-4" />
              <span>Products Master</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`${base}/inventory/stock-ledger`);
              }}
            >
              <Layers className="mr-2 h-4 w-4" />
              <span>Stock Activity Ledger</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`${base}/sales/invoices`);
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Invoices</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`${base}/accounting/chart-of-accounts`);
              }}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Chart of Accounts</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`${base}/accounting/reports/p-and-l`);
              }}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Profit & Loss</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`${base}/accounting/reports/balance-sheet`);
              }}
            >
              <Scale className="mr-2 h-4 w-4" />
              <span>Balance Sheet</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`${base}/sales/reports/ar-aging`);
              }}
            >
              <Clock className="mr-2 h-4 w-4" />
              <span>AR Aging Report</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`${base}/settings/company`);
              }}
            >
              <Building2 className="mr-2 h-4 w-4" />
              <span>Company Settings</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`${base}/settings/warehouse`);
              }}
            >
              <Warehouse className="mr-2 h-4 w-4" />
              <span>Warehouse Settings</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`${base}/settings/users`);
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>User Management</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
