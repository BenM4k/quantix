import Link from "next/link";
import { QuantixLogo } from "./quantix-logo";

interface LandingHeaderProps {
  isLoggedIn: boolean;
  activeOrganizationId?: string | null;
}

export function LandingHeader({
  isLoggedIn,
  activeOrganizationId,
}: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#faf9f6]/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200/60 dark:border-stone-800/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <QuantixLogo iconSize="md" />

        <nav className="hidden md:flex items-center gap-9 text-[14px] font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200">
          <a
            href="#product"
            className="hover:text-stone-950 dark:hover:text-white transition-colors"
          >
            Product
          </a>
          <a
            href="#how-it-works"
            className="hover:text-stone-950 dark:hover:text-white transition-colors"
          >
            How it works
          </a>
          <a
            href="#pricing"
            className="hover:text-stone-950 dark:hover:text-white transition-colors"
          >
            Pricing
          </a>
          <a
            href="#resources"
            className="hover:text-stone-950 dark:hover:text-white transition-colors"
          >
            Resources
          </a>
          <a
            href="#company"
            className="hover:text-stone-950 dark:hover:text-white transition-colors"
          >
            Company
          </a>
        </nav>

        <div className="flex items-center gap-4 text-sm font-medium">
          {isLoggedIn ? (
            <Link
              href={
                activeOrganizationId
                  ? `/${activeOrganizationId}/inventory/products`
                  : "/profile"
              }
              className="px-4 py-2 rounded-lg bg-[#FA5A1E] hover:bg-[#E0480E] text-white font-medium text-sm transition-all shadow-sm shadow-orange-500/20"
            >
              Go to App
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-colors font-medium px-2 py-1"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="px-4.5 py-2.5 rounded-lg bg-[#FA5A1E] hover:bg-[#E0480E] text-white font-medium text-sm transition-all duration-150 shadow-sm shadow-orange-500/25 hover:shadow-orange-500/35"
              >
                Start for free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
