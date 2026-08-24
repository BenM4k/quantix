"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { setActiveCompanyAction } from "./actions";
import { signOutAction } from "@/app/api/auth/[...all]/actions/auth.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Building2,
  Plus,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Mail,
  Home,
  LogOut,
} from "lucide-react";

interface OrganizationItem {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

interface ProfileClientProps {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    createdAt?: Date | string;
  };
  activeOrgId?: string | null;
  organizations: OrganizationItem[];
}

export function ProfileClient({
  user,
  activeOrgId,
  organizations,
}: ProfileClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [isLoggingOut, startLogoutTransition] = React.useTransition();
  const [activeId, setActiveId] = React.useState<string | null>(activeOrgId || null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSetActive = (orgId: string) => {
    setError(null);
    startTransition(async () => {
      const res = await setActiveCompanyAction(orgId);
      if (res.ok) {
        setActiveId(orgId);
        router.push(`/${orgId}/inventory/products`);
      } else {
        setError(res.error.message);
      }
    });
  };

  const handleLogout = () => {
    setError(null);
    startLogoutTransition(async () => {
      const res = await signOutAction();
      if (res.ok) {
        router.push("/sign-in");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8 px-4">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/")}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          <span>Home Page</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={isLoggingOut}
          onClick={handleLogout}
          className="flex items-center gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          {isLoggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
        </Button>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">User Profile & Organizations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account profile details and switch active company workspaces.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      {/* Basic User Information Card */}
      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-4 border-b border-border/40 pb-5">
          <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-bold text-primary text-xl overflow-hidden shrink-0">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user.name ? user.name.substring(0, 2).toUpperCase() : <User className="h-8 w-8 text-primary" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <Mail className="h-3.5 w-3.5" />
              <span>{user.email}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 space-y-1">
            <span className="text-muted-foreground">Account Status</span>
            <div className="flex items-center gap-1.5 font-semibold text-emerald-500">
              <ShieldCheck className="h-4 w-4" />
              <span>Active User</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 space-y-1">
            <span className="text-muted-foreground">Registered Organizations</span>
            <div className="font-semibold text-foreground text-sm">
              {organizations.length} {organizations.length === 1 ? "Company" : "Companies"}
            </div>
          </div>
        </div>
      </div>

      {/* Organizations List Section */}
      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Your Companies / Organizations</h2>
            <p className="text-xs text-muted-foreground">
              Select which company workspace you want to set as active.
            </p>
          </div>

          <Button
            onClick={() => router.push("/onboarding")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Organization</span>
          </Button>
        </div>

        {organizations.length === 0 ? (
          <div className="py-12 text-center space-y-3 border border-dashed border-border/60 rounded-xl bg-muted/20">
            <Building2 className="h-10 w-10 text-muted-foreground mx-auto" />
            <div>
              <p className="text-sm font-medium text-foreground">No companies found</p>
              <p className="text-xs text-muted-foreground">You are not a member of any company yet.</p>
            </div>
            <Button
              onClick={() => router.push("/onboarding")}
              variant="outline"
              size="sm"
            >
              Go to Onboarding
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {organizations.map((org) => {
              const isActive = org.id === activeId;

              return (
                <div
                  key={org.id}
                  className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-card border border-border flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                      {org.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={org.logo} alt={org.name} className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">{org.name}</span>
                        {isActive && (
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-semibold">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active Company
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">Slug: {org.slug}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <Button
                        size="sm"
                        onClick={() => router.push(`/${org.id}/inventory/products`)}
                        className="flex items-center gap-1.5"
                      >
                        <span>Open Workspace</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => handleSetActive(org.id)}
                      >
                        {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                        <span>Set Active</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
