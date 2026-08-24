import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Users,
  Warehouse,
  ArrowRight,
  UserPlus,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Settings Overview | Quantix",
  description: "Company profile, warehouse configurations, user access, and enterprise controls.",
};

export default async function SettingsOverviewPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            System & Workspace Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure organization details, warehouse facility parameters, user roles, and security policies.
          </p>
        </div>

        {/* Quick Action */}
        <div className="flex items-center gap-2">
          <Link
            href={`/${companyId}/settings/users`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Invite Team Member</span>
          </Link>
        </div>
      </div>

      {/* Settings Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Company Settings */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 hover:border-indigo-500/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <Link
              href={`/${companyId}/settings/company`}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              Configure <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <h3 className="font-bold text-foreground text-sm">Company Profile & Rules</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Legal identity, base reporting currency, fiscal year definition, and statutory address parameters.
          </p>
        </div>

        {/* Warehouse Settings */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 hover:border-indigo-500/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Warehouse className="h-5 w-5" />
            </div>
            <Link
              href={`/${companyId}/settings/warehouse`}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              Configure <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <h3 className="font-bold text-foreground text-sm">Warehouse Facilities</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Fulfillment warehouse locations, contact coordinates, receiving protocols, and shipping origin defaults.
          </p>
        </div>

        {/* Users & Access */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 hover:border-indigo-500/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Users className="h-5 w-5" />
            </div>
            <Link
              href={`/${companyId}/settings/users`}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              Configure <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <h3 className="font-bold text-foreground text-sm">Users & Role Permissions</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Invite coworkers, assign Owner / Admin / Accountant / Member roles, and control granular access.
          </p>
        </div>
      </div>
    </div>
  );
}
