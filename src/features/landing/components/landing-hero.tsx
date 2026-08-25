"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Play, Check } from "lucide-react";
import { HeroDashboardMockup } from "./hero-dashboard-mockup";
import { EASE_OUT_EXPO } from "./animate-on-enter";

interface LandingHeroProps {
  isLoggedIn: boolean;
  activeOrganizationId?: string | null;
}

export function LandingHero({
  isLoggedIn,
  activeOrganizationId,
}: LandingHeroProps) {
  const reduced = useReducedMotion();

  const getStartedHref = isLoggedIn
    ? activeOrganizationId
      ? `/${activeOrganizationId}/inventory/products`
      : "/profile"
    : "/sign-up";

  const makeFadeUpVariant = (delay: number, distance: number = 20) => ({
    initial: reduced ? false : { opacity: 0, y: distance },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.45,
      delay,
      ease: EASE_OUT_EXPO,
    },
  });

  return (
    <section className="relative pt-16 pb-28 md:pt-24 md:pb-36 lg:pt-28 lg:pb-44 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-12 items-center">
          {/* Left Column — Staggered Fade Up on Load */}
          <div className="lg:col-span-5 space-y-8 text-left">
            {/* Eyebrow */}
            <motion.div {...makeFadeUpVariant(0.04, 14)} className="inline-block">
              <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
                Accounting that works for you
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              {...makeFadeUpVariant(0.12, 20)}
              className="font-serif text-5xl sm:text-6xl text-stone-900 dark:text-white leading-[1.08] tracking-tight font-normal"
            >
              Sales in.
              <br />
              Statements{" "}
              <span className="text-primary font-medium italic">out.</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              {...makeFadeUpVariant(0.2, 18)}
              className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed max-w-lg"
            >
              Quantix CD turns your everyday sales activity into trustworthy financial statements — automatically. No accounting knowledge required.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              {...makeFadeUpVariant(0.28, 16)}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link
                href={getStartedHref}
                className="px-6 py-3.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition-all duration-150 shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 hover:scale-[1.02] active:scale-[0.99] inline-flex items-center gap-2"
              >
                Start for free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="px-5 py-3.5 rounded-lg border border-stone-300/80 dark:border-stone-700 bg-white/80 dark:bg-stone-900/80 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-sm font-medium transition-colors inline-flex items-center gap-2 shadow-xs"
              >
                <span>See how it works</span>
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </span>
              </a>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              {...makeFadeUpVariant(0.36, 14)}
              className="flex flex-wrap items-center gap-6 pt-3 text-xs text-stone-600 dark:text-stone-400"
            >
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-2" />
                </div>
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-2" />
                </div>
                <span>Setup in minutes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-2" />
                </div>
                <span>Cancel anytime</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Delayed Screenshot Fade + Subtle Scale */}
          <motion.div
            className="lg:col-span-7 relative"
            initial={reduced ? false : { opacity: 0, scale: 0.985, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.35,
              ease: EASE_OUT_EXPO,
            }}
          >
            <HeroDashboardMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
