"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FileText,
  Receipt,
  CreditCard,
  Package,
  BookOpen,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { AnimateOnEnter, EASE_OUT_EXPO } from "./animate-on-enter";

const steps = [
  {
    icon: <FileText className="w-5 h-5" />,
    title: "Quote",
    description: "Create and send professional quotes in seconds.",
  },
  {
    icon: <Receipt className="w-5 h-5" />,
    title: "Invoice",
    description: "Convert to an invoice in one click.",
  },
  {
    icon: <CreditCard className="w-5 h-5" />,
    title: "Payment",
    description: "Record payments — books reconcile automatically.",
  },
  {
    icon: <Package className="w-5 h-5" />,
    title: "Stock",
    description: "Inventory updates in real time.",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "Journal",
    description: "Double-entry entries happen behind the scenes.",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Reports",
    description: "P&L and balance sheet, always accurate.",
  },
];

const stats = [
  { value: "6", label: "steps fully automated" },
  { value: "$29", label: "flat monthly price" },
  { value: "0", label: "accountants required" },
];

export function LandingCoreLoop() {
  const reduced = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: EASE_OUT_EXPO,
      },
    },
  };

  return (
    <section id="how-it-works">
      {/* Restrained, warm neutral stat band with more vertical padding */}
      <div className="py-16 md:py-24 bg-primary-50 dark:bg-stone-900/50 border-y border-stone-200/80 dark:border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnEnter>
            <div className="grid grid-cols-3 gap-8 md:gap-14 divide-x divide-stone-200 dark:divide-stone-800">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center pl-8 first:pl-0">
                  <div className="font-serif text-5xl sm:text-6xl font-normal text-stone-900 dark:text-stone-100 leading-none tracking-tight">
                    {stat.value}
                  </div>
                  <div className="mt-3 text-[11px] sm:text-xs font-semibold tracking-wider text-stone-500 dark:text-stone-400 uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </AnimateOnEnter>
        </div>
      </div>

      {/* Process strip — generous breathing room and sequential reveal */}
      <div className="py-20 md:py-32 border-b border-stone-200/60 dark:border-stone-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnEnter>
            <p className="text-[11px] font-bold tracking-[0.2em] text-stone-400 uppercase text-center mb-16">
              The core loop, visualized
            </p>
          </AnimateOnEnter>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-12 relative"
            initial={reduced ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={containerVariants}
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                variants={itemVariants}
                className="relative flex flex-col items-center text-center group"
              >
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-5 -right-4 translate-x-1/2 z-10 text-stone-300 dark:text-stone-700">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}

                {/* Icon circle */}
                <div className="w-11 h-11 rounded-full bg-primary/8 dark:bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105">
                  {step.icon}
                </div>

                <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100 mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-[150px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
