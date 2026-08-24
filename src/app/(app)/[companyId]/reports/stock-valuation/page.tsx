import { requireTenantContext } from "@/lib/require-tenant-context";
import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/layout/section-card";
import { Package } from "lucide-react";

interface PageProps {
  params: Promise<{ companyId: string }>;
}

export default async function StockValuationReportPage({ params }: PageProps) {
  const { companyId } = await params;
  const ctx = await requireTenantContext();
  if (!ctx.ok) throw new Error(ctx.error.message);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Valuation Report"
        description="Live inventory valuation based on current quantity on hand and weighted average cost."
        icon={Package}
      />

      <SectionCard variant="solid" className="max-w-sm">
        <span className="text-xs text-muted-foreground font-semibold uppercase">Total Live Stock Value</span>
        <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">$0.00</p>
      </SectionCard>
    </div>
  );
}
