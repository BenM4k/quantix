"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

const btnBase = [
  "inline-flex items-center justify-center w-9 h-9 rounded-xl",
  "glass-subtle border border-[var(--glass-border)]",
  "text-muted-foreground hover:text-foreground",
  "hover:border-primary/30 transition-all duration-200 hover:-translate-y-px",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
].join(" ");

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  // Defer icon render until after hydration to prevent server/client mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const toggle = () =>
    setTheme(resolvedTheme === "dark" ? "light" : "dark");

  const cls = [btnBase, className].filter(Boolean).join(" ");

  if (!mounted) {
    // Same DOM shape, no icon — avoids hydration mismatch.
    return (
      <button type="button" aria-hidden tabIndex={-1} className={cls}>
        <span className="w-4 h-4 block" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title="Toggle theme (D)"
      className={cls}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
