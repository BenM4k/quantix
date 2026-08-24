import React from "react";
import { ArrowRight } from "lucide-react";
import { QuantixLogo } from "./quantix-logo";

export function LandingFooter() {
  return (
    <footer className="pt-16 pb-12 border-t border-stone-200/60 dark:border-stone-800/60 bg-[#FAF9F6] dark:bg-stone-950 text-xs text-stone-600 dark:text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 pb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <QuantixLogo />
            <p className="text-stone-500 dark:text-stone-400 text-xs leading-relaxed max-w-sm">
              The lightweight accounting ERP that turns daily business activity into trusted financial statements.
            </p>
            <div className="pt-2 text-[11px] text-stone-400">
              &copy; {new Date().getFullYear()} Quantix CD. All rights reserved.
            </div>
          </div>

          {/* Column: Product */}
          <div className="space-y-3">
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-xs">
              Product
            </h4>
            <ul className="space-y-2 text-stone-500 dark:text-stone-400 text-xs">
              <li><a href="#product" className="hover:text-stone-900 dark:hover:text-white transition-colors">Overview</a></li>
              <li><a href="#product" className="hover:text-stone-900 dark:hover:text-white transition-colors">Invoicing</a></li>
              <li><a href="#product" className="hover:text-stone-900 dark:hover:text-white transition-colors">Inventory</a></li>
              <li><a href="#product" className="hover:text-stone-900 dark:hover:text-white transition-colors">Accounting</a></li>
              <li><a href="#product" className="hover:text-stone-900 dark:hover:text-white transition-colors">Reports</a></li>
            </ul>
          </div>

          {/* Column: Resources */}
          <div className="space-y-3">
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-xs">
              Resources
            </h4>
            <ul className="space-y-2 text-stone-500 dark:text-stone-400 text-xs">
              <li><a href="#resources" className="hover:text-stone-900 dark:hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#resources" className="hover:text-stone-900 dark:hover:text-white transition-colors">Guides</a></li>
              <li><a href="#resources" className="hover:text-stone-900 dark:hover:text-white transition-colors">Accounting basics</a></li>
              <li><a href="#resources" className="hover:text-stone-900 dark:hover:text-white transition-colors">Changelog</a></li>
            </ul>
          </div>

          {/* Column: Company */}
          <div className="space-y-3">
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-xs">
              Company
            </h4>
            <ul className="space-y-2 text-stone-500 dark:text-stone-400 text-xs">
              <li><a href="#company" className="hover:text-stone-900 dark:hover:text-white transition-colors">About us</a></li>
              <li><a href="#company" className="hover:text-stone-900 dark:hover:text-white transition-colors">Careers</a></li>
              <li><a href="#company" className="hover:text-stone-900 dark:hover:text-white transition-colors">Contact</a></li>
              <li className="pt-2 font-semibold text-stone-900 dark:text-stone-100">Legal</li>
              <li><a href="#privacy" className="hover:text-stone-900 dark:hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#terms" className="hover:text-stone-900 dark:hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>

          {/* Column: Stay updated */}
          <div className="space-y-3">
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-xs">
              Stay updated
            </h4>
            <div className="flex items-center rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 text-base bg-transparent outline-none text-stone-800 dark:text-stone-200 placeholder:text-stone-400"
              />
              <button
                type="button"
                className="p-2 text-[#FA5A1E] hover:text-[#E0480E] transition-colors"
                aria-label="Subscribe to updates"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2 text-stone-500 dark:text-stone-400">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-stone-900 dark:hover:text-white transition-colors text-xs font-semibold"
                aria-label="LinkedIn"
              >
                in
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-stone-900 dark:hover:text-white transition-colors text-xs font-semibold"
                aria-label="X (formerly Twitter)"
              >
                𝕏
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
