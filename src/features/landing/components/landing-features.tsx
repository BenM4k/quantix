import { Shield, BarChart3, KeyRound } from "lucide-react";

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="max-w-7xl mx-auto px-6 py-24 border-t border-[var(--glass-border)]"
    >
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-foreground">
          Enterprise-Grade Capabilities
        </h2>
        <p className="text-muted-foreground font-light leading-relaxed">
          Every detail engineered for correctness, compliance, and strict
          multi-tenant isolation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: <Shield className="w-6 h-6 text-primary" />,
            title: "Strict Tenant Isolation",
            body: "All data is completely isolated using tenant organization context verified from server session credentials. Bypassing check guards is impossible.",
            glow: "hover:border-primary/30",
            iconBg: "bg-primary/10 border-primary/20",
          },
          {
            icon: <BarChart3 className="w-6 h-6 text-accent" />,
            title: "Real-Time Financial Ledgers",
            body: "Built-in accounting module tracks multi-currency entries, company configurations, and offers transactional integrity.",
            glow: "hover:border-accent/30",
            iconBg: "bg-accent/10 border-accent/20",
          },
          {
            icon: <KeyRound className="w-6 h-6 text-primary" />,
            title: "Granular RBAC Security",
            body: "Role-based security configurations (Owner, Admin, Accountant, Staff, Platform Admin) enforce strict access rules on every action.",
            glow: "hover:border-primary/30",
            iconBg: "bg-primary/10 border-primary/20",
          },
        ].map(({ icon, title, body, glow, iconBg }) => (
          <div
            key={title}
            className={`p-8 rounded-2xl glass border-[var(--glass-border)] ${glow} transition-all duration-300 flex flex-col gap-4 group`}
          >
            <div
              className={`w-12 h-12 rounded-xl ${iconBg} border flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
            >
              {icon}
            </div>
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed font-light">
              {body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
