import { requireTenantContext } from "@/lib/require-tenant-context";
import { getCompanySettingsService } from "@/services/company/settings.service";
import { CompanySettingsClient } from "./company-settings-client";
import { PageContainer } from "@/components/layout/page-container";

import { CategorySubNav } from "@/components/navigation/category-sub-nav";

interface PageProps {
  params: Promise<{ companyId: string }>;
}

export default async function CompanySettingsPage({ params }: PageProps) {
  const { companyId } = await params;
  const ctx = await requireTenantContext();

  if (!ctx.ok) throw new Error(ctx.error.message);

  const res = await getCompanySettingsService(companyId, ctx.value.role);

  if (!res.ok) throw new Error(res.error.message);

  return (
    <CompanySettingsClient
      companyId={companyId}
      profile={res.value.profile}
      hasAccountingActivity={res.value.hasAccountingActivity}
      userRole={ctx.value.role}
    />
  );
}
