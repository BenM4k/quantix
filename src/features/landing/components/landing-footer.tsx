import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface LandingFooterProps {
  isLoggedIn: boolean;
}

export function LandingFooter({ isLoggedIn }: LandingFooterProps) {
  return (
    <>
      {/* Bottom CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 z-10">
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

      {/* Footer */}
      <footer className="glass border-t border-[var(--glass-border)] py-10 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-foreground">
              Quantix CD
            </span>
            <span>&copy; {new Date().getFullYear()} All Rights Reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Security Status"].map(
              (label) => (
                <a
                  key={label}
                  href="#"
                  className="hover:text-primary transition-colors duration-200"
                >
                  {label}
                </a>
              ),
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
