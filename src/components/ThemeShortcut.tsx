"use client";

import { useEffect, useCallback } from "react";
import { useTheme } from "next-themes";

/**
 * Mounts once in the root layout (inside ThemeProvider).
 * Listens for the `D` key globally and toggles dark/light.
 * Skips the event when focus is inside an input, textarea, or
 * contentEditable element so users can still type normally.
 */
export function ThemeShortcut() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggle = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }
      if (e.key === "d" || e.key === "D") toggle();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [toggle]);

  // Renders nothing — purely behavioral.
  return null;
}
