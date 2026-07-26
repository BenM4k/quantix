import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemeShortcut } from "@/components/ThemeShortcut";

const geistSans = { variable: "--font-geist-sans" };
const geistMono = { variable: "--font-geist-mono" };

export const metadata: Metadata = {
  title: "Quantix CD",
  description: "Modern multi-tenant ERP SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* Global D-key shortcut — active on every route */}
          <ThemeShortcut />

          {/* Ambient background */}
          <div className="ambient-bg">
            <div
              className="ambient-orb w-[600px] h-[600px] -top-40 -left-40"
              style={{ background: "var(--glow-orange)" }}
            />
            <div
              className="ambient-orb w-[500px] h-[500px] top-1/2 -right-32"
              style={{
                background: "var(--glow-amber)",
                animationDelay: "-7s",
                animationDuration: "25s",
              }}
            />
            <div
              className="ambient-orb w-[400px] h-[400px] -bottom-32 left-1/3"
              style={{
                background: "var(--glow-orange)",
                animationDelay: "-14s",
                animationDuration: "18s",
                opacity: 0.3,
              }}
            />
          </div>
          <div className="vignette" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
