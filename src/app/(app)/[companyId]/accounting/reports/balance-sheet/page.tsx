import { requireTenantContext } from "@/lib/require-tenant-context";
import { withTenantTransaction } from "@/lib/tenant-context";
import { getCompanyProfile } from "@/dal/company-profile/queries";
import { PeriodPresetPicker } from "@/components/reporting/period-preset-picker";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/layout/section-card";
import { Scale } from "lucide-react";

interface PageProps {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{
    granularity?: string;
    referenceDate?: string;
    asOfDate?: string;
  }>;
}

export default async function BalanceSheetPage({ params, searchParams }: PageProps) {
  const { companyId } = await params;
  const sParams = await searchParams;
  const ctx = await requireTenantContext();
  if (!ctx.ok) throw new Error(ctx.error.message);

  const profile = await withTenantTransaction(companyId, (tx) =>
    getCompanyProfile(tx, companyId),
  );

  const asOfDate = sParams.asOfDate || new Date().toISOString().split("T")[0];

  return (
    <PageContainer>
      <PageHeader
        title="Balance Sheet"
        description="Financial position showing Assets, Liabilities, and Equity as of a single point in time."
        icon={Scale}
        actions={
          <PeriodPresetPicker
            mode="pointInTime"
            fiscalYearStartMonth={profile?.fiscalYearStartMonth || 1}
            fiscalYearStartDay={profile?.fiscalYearStartDay || 1}
          />
        }
      />

      <div className="p-4 rounded-xl border border-border/80 bg-[var(--surface-solid)] text-xs text-muted-foreground">
        As of Date: <strong className="text-foreground">{asOfDate}</strong>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SectionCard variant="solid" className="space-y-1">
          <span className="text-xs text-muted-foreground font-semibold uppercase">Total Assets</span>
          <p className="text-2xl font-bold text-blue-500">$0.00</p>
        </SectionCard>
        <SectionCard variant="solid" className="space-y-1">
          <span className="text-xs text-muted-foreground font-semibold uppercase">Total Liabilities</span>
          <p className="text-2xl font-bold text-amber-500">$0.00</p>
        </SectionCard>
        <SectionCard variant="solid" className="space-y-1">
          <span className="text-xs text-muted-foreground font-semibold uppercase">Total Equity</span>
          <p className="text-2xl font-bold text-purple-500">$0.00</p>
        </SectionCard>
      </div>
    </PageContainer>
  );
}
