import { getSession } from "@/services/better-auth/session";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Shield,
  BarChart3,
  KeyRound,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Antigravity ERP - Modern Multi-Tenant ERP SaaS",
  description:
    "Next-generation ERP SaaS offering strict tenant isolation, real-time ledgers, granular RBAC, and sleek modern layouts.",
};

export default async function LandingPage() {
  const session = await getSession();
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Header */}
      <header className="glass border-b border-[var(--glass-border)] sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-black text-xl text-primary-foreground shadow-[var(--glass-shadow)] glow-sm hover:scale-105 transition-transform duration-200">
              E
            </div>
            <span className="font-extrabold tracking-tight text-xl text-foreground">
              Antigravity ERP
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors duration-200">
              Features
            </a>
            <a href="#architecture" className="hover:text-primary transition-colors duration-200">
              Architecture
            </a>
            <a href="#stack" className="hover:text-primary transition-colors duration-200">
              Tech Stack
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-sm font-semibold transition-all duration-200 shadow-[var(--glass-shadow)] glow-sm flex items-center gap-1.5"
              >
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-[var(--glass-bg)] text-sm font-medium transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 shadow-[var(--glass-shadow)] glow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-subtle text-muted-foreground text-xs font-semibold mb-8">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Introducing Antigravity Multi-Tenancy ERP</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-5xl mb-6 text-foreground">
            The Next-Generation ERP for{" "}
            <span className="text-primary">
              Modern SaaS
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed font-light">
            Secure organization-scoped tenant isolation, lightning-fast financial
            accounting, and a sleek developer-first architecture.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-20 justify-center">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-8 py-4 rounded-2xl bg-primary hover:opacity-90 text-primary-foreground font-bold text-base shadow-[var(--glass-shadow)] glow-orange transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2"
              >
                Go to Workspace Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="px-8 py-4 rounded-2xl bg-primary hover:opacity-90 text-primary-foreground font-bold text-base shadow-[var(--glass-shadow)] glow-orange transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2"
                >
                  Create Your Free Account
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/sign-in"
                  className="px-8 py-4 rounded-2xl glass hover:opacity-80 border-[var(--glass-border)] text-foreground font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2"
                >
                  Sign In to Tenant
                </Link>
              </>
            )}
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="w-full max-w-5xl rounded-2xl glass p-4 shadow-[var(--glass-shadow)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl" />
            <div className="w-full aspect-[16/9] bg-background/60 rounded-xl border border-[var(--glass-border)] p-6 flex flex-col gap-6 relative">
              {/* Fake header bar */}
              <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="w-3 h-3 rounded-full bg-accent" />
                  <span className="w-3 h-3 rounded-full bg-primary" />
                  <div className="ml-4 h-5 w-28 rounded-lg bg-[var(--glass-bg)] animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-20 rounded-lg bg-[var(--glass-bg)] animate-pulse" />
                  <div className="h-7 w-7 rounded-full bg-primary/20" />
                </div>
              </div>

              {/* Fake stat cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  "bg-primary/20",
                  "bg-accent/20",
                  "bg-[var(--glass-bg)]",
                ].map((bg, i) => (
                  <div
                    key={i}
                    className="h-24 rounded-xl glass p-4 flex flex-col justify-between"
                  >
                    <div className="w-12 h-2.5 rounded bg-[var(--glass-bg)]" />
                    <div className={`w-20 h-5 rounded-lg ${bg}`} />
                  </div>
                ))}
              </div>

              {/* Fake list */}
              <div className="flex-1 rounded-xl glass p-4 flex flex-col gap-3">
                <div className="w-full h-7 rounded-lg bg-primary/10" />
                <div className="w-full h-7 rounded-lg bg-[var(--glass-bg)]" />
                <div className="w-full h-7 rounded-lg bg-[var(--glass-bg)]" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24 border-t border-[var(--glass-border)]">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-foreground">
              Enterprise-Grade Capabilities
            </h2>
            <p className="text-muted-foreground font-light leading-relaxed">
              Every detail engineered for correctness, compliance, and strict multi-tenant isolation.
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
                <p className="text-muted-foreground text-sm leading-relaxed font-light">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture Section */}
        <section id="architecture" className="max-w-7xl mx-auto px-6 py-24 border-t border-[var(--glass-border)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Solid Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Strict Layered Architecture
              </h2>
              <p className="text-muted-foreground leading-relaxed font-light">
                Our application enforces a deterministic architecture sequence.
                Queries and database mutations are restricted to the DAL, invoked
                via business services called strictly from server actions.
              </p>

              <div className="flex flex-col gap-4 mt-2">
                {[
                  { num: "1", label: "Action Layer", desc: "Validates payload inputs and user session context.", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
                  { num: "2", label: "Service Layer", desc: "Executes business logic validations and coordination.", color: "text-accent", bg: "bg-accent/10 border-accent/20" },
                  { num: "3", label: "DAL (Data Access Layer)", desc: "Performs isolated queries within database transactions.", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
                ].map(({ num, label, desc, color, bg }) => (
                  <div key={num} className="flex items-start gap-4">
                    <div className={`w-6 h-6 rounded-lg ${bg} border flex items-center justify-center text-xs font-bold ${color} mt-0.5 shrink-0`}>
                      {num}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{label}</h4>
                      <p className="text-muted-foreground text-sm font-light">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture Visual */}
            <div className="p-8 rounded-2xl glass flex flex-col gap-3 shadow-[var(--glass-shadow)]">
              {[
                { label: "UI component", sub: "Dashboard / Form", color: "text-primary" },
                { label: "Server Action", sub: "Input validation + session check", color: "text-primary" },
                { label: "Service Logic", sub: "Orchestrating tenant operations", color: "text-accent" },
                { label: "Data Access Layer", sub: "Scoping queries by org_id", color: "text-primary" },
              ].map(({ label, sub, color }, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-full p-4 rounded-xl glass-subtle text-center font-mono text-sm text-muted-foreground">
                    <span className={color}>{label}</span>{" "}
                    <span className="text-xs opacity-70">({sub})</span>
                  </div>
                  {i < 3 && <div className="w-px h-6 bg-[var(--glass-border)]" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section id="stack" className="max-w-7xl mx-auto px-6 py-24 border-t border-[var(--glass-border)]">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-foreground">
              Modern Tech Stack
            </h2>
            <p className="text-muted-foreground font-light leading-relaxed">
              Engineered using the best and most performant industry tools.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Next.js 16", sub: "App Router" },
              { name: "Tailwind CSS v4", sub: "Engineered Styling" },
              { name: "Drizzle ORM", sub: "Type-Safe SQL Queries" },
              { name: "Better Auth", sub: "SaaS Plugins Enabled" },
            ].map(({ name, sub }) => (
              <div
                key={name}
                className="p-6 rounded-2xl glass text-center flex flex-col gap-2 hover:glow-sm transition-all duration-200"
              >
                <span className="text-base font-bold text-foreground">{name}</span>
                <span className="text-xs text-muted-foreground">{sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="p-12 rounded-3xl glass-strong text-center flex flex-col items-center gap-6 relative overflow-hidden">
            <div className="absolute inset-0 glow-orange opacity-10 pointer-events-none rounded-3xl" />
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground relative z-10">
              Ready to onboard your tenant?
            </h2>
            <p className="text-muted-foreground font-light max-w-2xl leading-relaxed relative z-10">
              Launch a fast, scalable, isolated company configuration in seconds.
              Keep your ledgers clean and compliant from day one.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-4 relative z-10">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="px-8 py-4 rounded-2xl bg-primary hover:opacity-90 text-primary-foreground font-bold transition-all duration-200 shadow-[var(--glass-shadow)] glow-orange flex items-center gap-1.5"
                >
                  Enter Workspace
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-up"
                    className="px-8 py-4 rounded-2xl bg-primary hover:opacity-90 text-primary-foreground font-bold transition-all duration-200 shadow-[var(--glass-shadow)] glow-orange"
                  >
                    Start for Free
                  </Link>
                  <Link
                    href="/sign-in"
                    className="px-8 py-4 rounded-2xl glass text-foreground font-semibold transition-all duration-200"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-[var(--glass-border)] py-10 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-foreground">Antigravity ERP</span>
            <span>&copy; {new Date().getFullYear()} All Rights Reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Security Status"].map((label) => (
              <a key={label} href="#" className="hover:text-primary transition-colors duration-200">
                {label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
