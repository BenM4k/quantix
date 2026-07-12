"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {/*
        next-themes injects a <script> tag before the first render to set
        the correct theme class and avoid FOUC. React 19 warns about script
        tags inside components, but this is an expected/intentional pattern.
        suppressHydrationWarning on the inner wrapper suppresses the mismatch
        that arises between the SSR HTML and the client hydration pass.
      */}
      <div suppressHydrationWarning>{children}</div>
    </NextThemesProvider>
  );
}
