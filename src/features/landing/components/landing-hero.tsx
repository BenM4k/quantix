import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface LandingHeroProps {
  isLoggedIn: boolean;
}

export function LandingHero({ isLoggedIn }: LandingHeroProps) {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center">
      {/* Heading */}
      <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-5xl mb-6 text-foreground">
        The Next-Generation ERP for Modern SaaS
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
            {["bg-primary/20", "bg-accent/20", "bg-[var(--glass-bg)]"].map(
              (bg, i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl glass p-4 flex flex-col justify-between"
                >
                  <div className="w-12 h-2.5 rounded bg-[var(--glass-bg)]" />
                  <div className={`w-20 h-5 rounded-lg ${bg}`} />
                </div>
              ),
            )}
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
  );
}
