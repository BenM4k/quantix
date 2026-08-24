import React from "react";
import { getAuthContext } from "@/lib/auth-context";
import { getCompanySettingsService } from "@/services/company/settings.service";
import { getMembersService, getPendingInvitationsService } from "@/services/user/user.service";
import { getWarehouseService } from "@/services/warehouse/warehouse.service";
import { CategorySubNav } from "@/components/navigation/category-sub-nav";
import { KpiCard } from "@/components/layout/kpi-card";
import { Building2, Users, Globe2, Warehouse } from "lucide-react";

interface SettingsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ companyId: string }>;
}

export default async function SettingsLayout({
  children,
  params,
}: SettingsLayoutProps) {
  const { companyId } = await params;
  const { company, role } = await getAuthContext();

  const companyRes = await getCompanySettingsService(companyId, role);
  const membersRes = await getMembersService(companyId, role, { page: 1, pageSize: 1 });
  const invitesRes = await getPendingInvitationsService(companyId, role);
  const warehouseRes = await getWarehouseService(companyId, role);

  const profile = companyRes.ok ? companyRes.value.profile : null;
  const totalMembers = membersRes.ok ? membersRes.value.total : 0;
  const pendingInvites = invitesRes.ok ? invitesRes.value.length : 0;
  const warehouse = warehouseRes.ok ? warehouseRes.value : null;

  const subNavItems = [
    { label: "Overview", href: `/${companyId}/settings` },
    { label: "Company Profile", href: `/${companyId}/settings/company` },
    { label: "Warehouse", href: `/${companyId}/settings/warehouse` },
    { label: "Users & Access", href: `/${companyId}/settings/users` },
  ];

  return (
    <div className="space-y-6">
      {/* Category Sub-Navigation */}
      <CategorySubNav items={subNavItems} />

      {/* Category Neo-Morphic KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Organization"
          value={company.name || "Default Org"}
          icon={Building2}
          trend={null}
          trendLabel={profile?.companyType ? `Type: ${profile.companyType}` : "Company Profile"}
          iconClassName="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
        />
        <KpiCard
          label="Team Members"
          value={`${totalMembers}`}
          icon={Users}
          trend={15.0}
          trendLabel={`${pendingInvites} pending invites`}
          variant="sparkline"
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
        />
        <KpiCard
          label="Base Currency"
          value={profile?.baseCurrency || "USD"}
          icon={Globe2}
          trend={null}
          trendLabel={`FY Starts Month ${profile?.fiscalYearStartMonth || 1}`}
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
        />
        <KpiCard
          label="Primary Facility"
          value={warehouse?.name || "Main Facility"}
          icon={Warehouse}
          trend={null}
          trendLabel={warehouse?.isDefault ? "Primary Warehouse" : "Active Location"}
          iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
        />
      </div>

      {/* Route Content */}
      <div>{children}</div>
    </div>
  );
}
