import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface LandingHeaderProps {
  isLoggedIn: boolean;
  activeOrganizationId?: string | null;
}

export function LandingHeader({
  isLoggedIn,
  activeOrganizationId,
}: LandingHeaderProps) {
  return (
    <header className="glass border-b border-(--glass-border) sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-black text-xl text-primary-foreground shadow-(--glass-shadow) glow-sm hover:scale-105 transition-transform duration-200">
            Q
          </div>
          <span className="font-extrabold tracking-tight text-xl text-foreground">
            Quantix CD
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a
            href="#features"
            className="hover:text-primary transition-colors duration-200"
          >
            Features
          </a>
          <a
            href="#architecture"
            className="hover:text-primary transition-colors duration-200"
          >
            Architecture
          </a>
          <a
            href="#stack"
            className="hover:text-primary transition-colors duration-200"
          >
            Tech Stack
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isLoggedIn ? (
            <>
              <Link
                href="/profile"
                className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-(--glass-bg) text-sm font-medium transition-colors duration-200"
              >
                Profile
              </Link>
              {activeOrganizationId && (
                <Link
                  href={`/${activeOrganizationId}/inventory/products`}
                  className="px-4 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-sm font-semibold transition-all duration-200 shadow-(--glass-shadow) glow-sm flex items-center gap-1.5"
                >
                  Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-(--glass-bg) text-sm font-medium transition-colors duration-200"
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
  );
}
