import Link from "next/link";
import { ArrowLeft, Shield, BarChart3, KeyRound, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 relative overflow-hidden">
      {/* Left Section: Visual / Marketing Presentation */}
        {/* Subtle inner ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 20% 40%, var(--glow-orange) 0%, transparent 60%)",
            opacity: 0.15,
          }}
        />
      <div className="hidden lg:flex lg:col-span-7 relative flex-col justify-between p-12 border-r border-[var(--glass-border)] overflow-hidden">
        {/* Top Branding */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center font-black text-base text-primary-foreground glow-sm">
            E
          </div>
          <span className="font-extrabold tracking-tight text-base text-foreground">
            Antigravity ERP
          </span>
        </div>
        <div className="flex flex-col items-center justify-center h-full">



        {/* Value Proposition */}
        <div className="flex flex-col gap-8 z-10 max-w-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-subtle text-muted-foreground text-xs font-semibold w-fit">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Fully Compliant SaaS Tenant</span>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-foreground">
              Enterprise Control,
              <br />
              <span className="text-primary">Simplified</span>
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground font-light">
              Secure multi-tenant isolation, automated ledger audits, and
              real-time operations overview at your fingertips.
            </p>
          </div>

          {/* Value points */}
          <div className="flex flex-col gap-4">
            {[
              {
                icon: <Shield className="w-4 h-4 text-primary" />,
                title: "Strict Context Guards",
                desc: "Zero shared-data leakage guarantees.",
              },
              {
                icon: <BarChart3 className="w-4 h-4 text-accent" />,
                title: "Multi-Currency Ledgers",
                desc: "Dynamic company types configured on-demand.",
              },
              {
                icon: <KeyRound className="w-4 h-4 text-primary" />,
                title: "Dynamic Auth & Roles",
                desc: "RBAC policies enforcing security across APIs.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg glass-subtle border border-[var(--glass-border)] flex items-center justify-center shrink-0">
                  {icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">{title}</span>
                  <span className="text-xs text-muted-foreground font-light">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-muted-foreground font-light z-10">
          Powered by Next.js &amp; Better Auth. &copy; {new Date().getFullYear()} Antigravity ERP.
        </div>
        </div>
      </div>

      {/* Right Section: Form + Back Button */}
      <div className="col-span-1 lg:col-span-4 flex flex-col p-6 sm:p-12 min-h-screen relative z-10">
        {/* Navigation header */}
        <div className="flex items-center justify-between w-full mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-subtle border border-[var(--glass-border)] hover:border-primary/30 text-muted-foreground hover:text-foreground text-xs font-medium transition-all duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3">
            {/* Mobile branding */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center font-black text-xs text-primary-foreground">
                E
              </div>
              <span className="font-extrabold tracking-tight text-xs text-foreground">
                Antigravity ERP
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center py-8">
          {children}
        </div>

        {/* Mobile footer */}
        <div className="lg:hidden text-center text-xs text-muted-foreground mt-8">
          &copy; {new Date().getFullYear()} Antigravity ERP. All rights reserved.
        </div>
      </div>
    </div>
  );
}
