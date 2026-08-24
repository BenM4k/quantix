import React from "react";
import Link from "next/link";

interface QuantixLogoProps {
  className?: string;
  iconSize?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function QuantixLogo({
  className = "",
  iconSize = "md",
  showText = true,
}: QuantixLogoProps) {
  const sizeMap = {
    sm: "w-7 h-7",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 group transition-opacity hover:opacity-90 ${className}`}
    >
      <div
        className={`${sizeMap[iconSize]} rounded-lg bg-[#FA5A1E] flex items-center justify-center text-white font-bold shadow-sm shadow-orange-500/20 relative overflow-hidden shrink-0`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-5 h-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 4h4v16H6zM14 4h4v8h-4zM14 16h4v4h-4z"
            fill="currentColor"
            opacity="0.95"
          />
        </svg>
      </div>
      {showText && (
        <span className="font-bold text-lg tracking-tight text-stone-900 dark:text-stone-100">
          Quantix <span className="font-semibold text-stone-600 dark:text-stone-400">CD</span>
        </span>
      )}
    </Link>
  );
}
