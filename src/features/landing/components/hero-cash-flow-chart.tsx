"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { EASE_OUT_EXPO } from "./animate-on-enter";
import { CountUpNumber } from "./count-up-number";

export function HeroCashFlowChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();

  const lineVariants: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 0.85, ease: EASE_OUT_EXPO },
        opacity: { duration: 0.2, ease: "linear" },
      },
    },
  };

  const fillVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.7, delay: 0.2, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <div
      ref={containerRef}
      className="md:col-span-2 p-3 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-stone-800 dark:text-stone-200 text-xs">
          Cash flow
        </span>
        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
          +<CountUpNumber prefix="$" value={7350} /> this month
        </span>
      </div>

      <div className="h-24 relative">
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 300 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FA5A1E" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#FA5A1E" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Shaded Area Fill */}
          <motion.path
            d="M0,80 Q40,75 75,55 T150,45 T225,25 T300,15 L300,100 L0,100 Z"
            fill="url(#cashGrad)"
            initial={reduced ? "visible" : "hidden"}
            animate={isInView ? "visible" : "hidden"}
            variants={fillVariants}
          />

          {/* Animated Stroke Line */}
          <motion.path
            d="M0,80 Q40,75 75,55 T150,45 T225,25 T300,15"
            fill="none"
            stroke="#FA5A1E"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={reduced ? "visible" : "hidden"}
            animate={isInView ? "visible" : "hidden"}
            variants={lineVariants}
          />
        </svg>
      </div>

      <div className="flex justify-between text-[9px] text-stone-400 mt-1">
        <span>Aug 1</span>
        <span>Aug 8</span>
        <span>Aug 15</span>
        <span>Aug 22</span>
        <span>Aug 29</span>
      </div>
    </div>
  );
}
