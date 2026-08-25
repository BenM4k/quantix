"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QuantixLogo } from "./quantix-logo";

interface HeaderScrollClientProps {
  isLoggedIn: boolean;
  activeOrganizationId?: string | null;
}

export function HeaderScrollClient({
  isLoggedIn,
  activeOrganizationId,
}: HeaderScrollClientProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-[#FAF9F6]/95 dark:bg-stone-950/95 backdrop-blur-md border-stone-200/80 dark:border-stone-800/80 shadow-xs shadow-stone-200/40 dark:shadow-black/20"
          : "bg-[#FAF9F6]/75 dark:bg-stone-950/75 backdrop-blur-xs border-stone-200/50 dark:border-stone-800/50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <QuantixLogo iconSize="md" />

        <nav className="hidden md:flex items-center gap-9 text-[14px] font-medium text-stone-600 dark:text-stone-400">
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
              className="px-4 py-2 rounded-lg bg-[#FA5A1E] hover:bg-[#E0480E] text-white font-medium text-sm transition-all duration-150 shadow-sm shadow-orange-500/20 hover:shadow-md hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.99]"
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
                className="px-4.5 py-2.5 rounded-lg bg-[#FA5A1E] hover:bg-[#E0480E] text-white font-medium text-sm transition-all duration-150 shadow-sm shadow-orange-500/25 hover:shadow-md hover:shadow-orange-500/35 hover:scale-[1.02] active:scale-[0.99]"
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
