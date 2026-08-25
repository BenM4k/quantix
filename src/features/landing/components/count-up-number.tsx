"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion, animate } from "framer-motion";
import { EASE_OUT_EXPO } from "./animate-on-enter";

interface CountUpNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  duration?: number;
}

function formatNumber(num: number, decimals: number): string {
  return decimals > 0
    ? num.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : Math.round(num).toLocaleString("en-US");
}

export function CountUpNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
  duration = 0.8,
}: CountUpNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (reduced || !isInView) return;

    const controls = animate(0, value, {
      duration,
      ease: EASE_OUT_EXPO,
      onUpdate: (latest) => {
        setDisplayValue(latest);
      },
    });

    return () => controls.stop();
  }, [isInView, value, duration, reduced]);

  if (reduced) {
    return (
      <span className={className}>
        {prefix}
        {formatNumber(value, decimals)}
        {suffix}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatNumber(displayValue, decimals)}
      {suffix}
    </span>
  );
}
