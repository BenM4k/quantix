"use client";

import { motion, useReducedMotion } from "framer-motion";
import React from "react";

/** Shared easing — cubic-bezier(0.16, 1, 0.3, 1) ease-out-expo. Used sitewide. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface AnimateOnEnterProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  distance?: number;
  duration?: number;
}

/**
 * Scroll-triggered fade-up wrapper that fires once on first viewport entry.
 * Degrades to instant end-state when prefers-reduced-motion is set.
 */
export function AnimateOnEnter({
  children,
  delay = 0,
  className,
  distance = 20,
  duration = 0.45,
}: AnimateOnEnterProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration,
        delay,
        ease: EASE_OUT_EXPO,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger container for sequential child reveals when scrolling into view.
 */
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  delayChildren = 0,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Child item inside a StaggerContainer.
 */
export function StaggerItem({
  children,
  className,
  distance = 18,
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: distance },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.45,
            ease: EASE_OUT_EXPO,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
