import { requireTenantContext } from "@/lib/require-tenant-context";
import { withTenantTransaction } from "@/lib/tenant-context";
import { getCompanyProfile } from "@/dal/company-profile/queries";
import { PeriodPresetPicker } from "@/components/reporting/period-preset-picker";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/layout/section-card";
import { TrendingUp } from "lucide-react";

interface PageProps {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{
    granularity?: string;
    referenceDate?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function ProfitAndLossPage({ params, searchParams }: PageProps) {
  const { companyId } = await params;
  const sParams = await searchParams;
  const ctx = await requireTenantContext();
  if (!ctx.ok) throw new Error(ctx.error.message);

  const profile = await withTenantTransaction(companyId, (tx) =>
    getCompanyProfile(tx, companyId),
  );

  const startDate = sParams.startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
  const endDate = sParams.endDate || new Date().toISOString().split("T")[0];

  return (
    <PageContainer>
      <PageHeader
        title="Profit & Loss Statement"
        description="Summary of revenues, costs, and net income over the selected period."
        icon={TrendingUp}
        actions={
          <PeriodPresetPicker
            mode="range"
            fiscalYearStartMonth={profile?.fiscalYearStartMonth || 1}
            fiscalYearStartDay={profile?.fiscalYearStartDay || 1}
          />
        }
      />

      <div className="p-4 rounded-xl border border-border/80 bg-[var(--surface-solid)] text-xs text-muted-foreground">
        Reporting Period: <strong className="text-foreground">{startDate}</strong> to <strong className="text-foreground">{endDate}</strong>
      </div>

      {/* Financial Summary Cards with Solid Content Surface for contrast */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SectionCard variant="solid" className="space-y-1">
          <span className="text-xs text-muted-foreground font-semibold uppercase">Total Revenue</span>
          <p className="text-2xl font-bold text-emerald-500">$0.00</p>
        </SectionCard>
        <SectionCard variant="solid" className="space-y-1">
          <span className="text-xs text-muted-foreground font-semibold uppercase">Cost of Goods Sold</span>
          <p className="text-2xl font-bold text-amber-500">$0.00</p>
        </SectionCard>
        <SectionCard variant="solid" className="space-y-1">
          <span className="text-xs text-muted-foreground font-semibold uppercase">Net Income</span>
          <p className="text-2xl font-bold text-foreground">$0.00</p>
        </SectionCard>
      </div>
    </PageContainer>
  );
}
