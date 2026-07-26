"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
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
import { Badge } from "@/components/ui/badge";
import {
  Search,
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
} from "lucide-react";

interface OrganizationItem {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

interface TopBarProps {
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
  organizations: OrganizationItem[];
}

export function TopBar({ company, user, organizations }: TopBarProps) {
  const router = useRouter();
  const [openCommand, setOpenCommand] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [isLogoutPending, startLogoutTransition] = React.useTransition();

  // Cmd+K shortcut listener
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
    startTransition(async () => {
      const res = await setActiveCompanyAction(orgId);
      if (res.ok) {
        router.push(`/${orgId}/inventory/products`);
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

  return (
    <>
      <header className="h-16 border-b border-border/80 glass-surface px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {/* Mobile Sidebar Trigger */}
          <SidebarTrigger />

          {/* Shadcn Command Trigger Button */}
          <button
            onClick={() => setOpenCommand(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 text-xs text-muted-foreground transition-all w-48 sm:w-64"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left truncate">
              Search commands...
            </span>
            <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Active Org Switcher Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={isPending}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/60 bg-card/60 hover:bg-accent/40 text-xs font-medium transition-all cursor-pointer"
            >
              <div className="h-5 w-5 rounded-md bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                {company.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-3.5 w-3.5" />
                )}
              </div>
              <span className="max-w-[120px] truncate">{company.name}</span>
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Switch Organization
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {organizations.map((org) => {
                const isActive = org.id === company.id;
                return (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => handleSwitchCompany(org.id)}
                    className="flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{org.name}</span>
                    </div>
                    {isActive && (
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* User Profile & Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary hover:opacity-90 transition-opacity overflow-hidden cursor-pointer">
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
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="text-xs cursor-pointer"
              >
                <Settings className="h-3.5 w-3.5 mr-2" />
                <span>Profile & Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/")}
                className="text-xs cursor-pointer"
              >
                <Home className="h-3.5 w-3.5 mr-2" />
                <span>Home Page</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLogoutPending}
                className="text-xs text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5 mr-2" />
                <span>{isLogoutPending ? "Signing Out..." : "Sign Out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Shadcn Command Palette Dialog */}
      <CommandDialog open={openCommand} onOpenChange={setOpenCommand}>
        <CommandInput placeholder="Type a command or search navigation..." />
        <CommandList className="p-2">
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`/${company.id}/inventory/products`);
              }}
            >
              <Plus className="mr-2 h-4 w-4 text-emerald-500" />
              <span>Create Product</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`/${company.id}/sales/customers`);
              }}
            >
              <Plus className="mr-2 h-4 w-4 text-blue-500" />
              <span>Add Customer</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`/${company.id}/accounting/journal-entries/new`);
              }}
            >
              <Plus className="mr-2 h-4 w-4 text-primary" />
              <span>Create Manual Transaction</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`/${company.id}/settings/users`);
              }}
            >
              <Plus className="mr-2 h-4 w-4 text-purple-500" />
              <span>Invite Team Member</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Overview">
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push("/");
              }}
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Home Page</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Core Operations">
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`/${company.id}/inventory/products`);
              }}
            >
              <Package className="mr-2 h-4 w-4" />
              <span>Products Master</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`/${company.id}/sales/customers`);
              }}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              <span>Customer Master</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`/${company.id}/sales/quotes`);
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Quotes</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`/${company.id}/sales/orders`);
              }}
            >
              <Package className="mr-2 h-4 w-4" />
              <span>Sales Orders</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`/${company.id}/sales/invoices`);
              }}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Invoices</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Accounting">
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`/${company.id}/accounting/chart-of-accounts`);
              }}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Account Categories</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`/${company.id}/accounting/journal-entries`);
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Transactions</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`/${company.id}/accounting/periods`);
              }}
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span>Fiscal Periods & Close</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Settings & Administration">
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`/${company.id}/settings/warehouse`);
              }}
            >
              <Warehouse className="mr-2 h-4 w-4" />
              <span>Warehouse Settings</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push(`/${company.id}/settings/users`);
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>User Management</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpenCommand(false);
                router.push("/profile");
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>User Profile</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
