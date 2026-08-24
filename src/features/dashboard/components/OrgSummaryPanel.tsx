import {
  Building2,
  FileText,
  Package,
  Users,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

interface OrgSummaryPanelProps {
  org: {
    id: string;
    name: string;
  };
  profile: {
    companyType?: string | null;
    baseCurrency?: string | null;
  } | null;
  stats: {
    openInvoiceCount: number;
    openOrderCount: number;
    productCount: number;
  };
  role: string;
}

interface QuickStatProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  href: string;
}

function QuickStat({ icon: Icon, label, value, href }: QuickStatProps) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-150 group"
    >
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-white/60 leading-none mb-0.5">{label}</p>
          <p className="text-sm font-bold text-white leading-none">{value}</p>
        </div>
      </div>
      <ArrowUpRight className="h-3.5 w-3.5 text-white/30 group-hover:text-white/70 transition-colors" />
    </Link>
  );
}

export function OrgSummaryPanel({
  org,
  profile,
  stats,
  role,
}: OrgSummaryPanelProps) {
  const currency = profile?.baseCurrency ?? "USD";
  const companyType = profile?.companyType ?? "Service";

  return (
    <div className="flex flex-col gap-5 h-full bg-[#1a1c2e] dark:bg-[#0f1020] rounded-2xl p-5 text-white relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">
            Organization
          </p>
          <p className="text-base font-bold text-white leading-tight truncate max-w-[180px]">
            {org.name}
          </p>
        </div>
        <span className="ml-auto text-[10px] font-semibold px-2 py-1 rounded-full bg-white/10 border border-white/10 text-white/60 capitalize shrink-0">
          {role}
        </span>
      </div>

      {/* Company meta */}
      <div className="flex gap-2 relative z-10">
        <div className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5">
          <p className="text-[10px] text-white/50 uppercase tracking-wider">
            Type
          </p>
          <p className="text-sm font-semibold text-white capitalize mt-0.5">
            {companyType}
          </p>
        </div>
        <div className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5">
          <p className="text-[10px] text-white/50 uppercase tracking-wider">
            Currency
          </p>
          <p className="text-sm font-semibold text-white mt-0.5">{currency}</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex flex-col gap-2 relative z-10">
        <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold px-1">
          Quick Overview
        </p>
        <QuickStat
          icon={FileText}
          label="Open Invoices"
          value={stats.openInvoiceCount}
          href={`/${org.id}/sales/invoices`}
        />
        <QuickStat
          icon={Package}
          label="Open Orders"
          value={stats.openOrderCount}
          href={`/${org.id}/sales/orders`}
        />
        <QuickStat
          icon={Users}
          label="Active Products"
          value={stats.productCount}
          href={`/${org.id}/inventory/products`}
        />
      </div>
    </div>
  );
}
