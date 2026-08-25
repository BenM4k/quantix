import React from "react";
import { ShieldCheck, Cloud, Lock, Shield } from "lucide-react";
import { AnimateOnEnter, StaggerContainer, StaggerItem } from "./animate-on-enter";

const items = [
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Bank-grade encryption",
    description: "AES-256 at rest, TLS in transit — your data never travels unprotected.",
  },
  {
    icon: <Cloud className="w-5 h-5" />,
    title: "Daily automated backups",
    description: "Point-in-time recovery so you can restore to any moment.",
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: "Role-based access control",
    description: "Granular permissions — each user sees exactly what they should.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "SOC 2 roadmap",
    description: "Working towards SOC 2 Type II. Your compliance requirements, met.",
  },
];

export function LandingSecurity() {
  return (
    <section className="py-20 md:py-32 border-b border-stone-200/60 dark:border-stone-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 items-start">
          {/* Left: heading */}
          <AnimateOnEnter className="lg:col-span-4 space-y-4">
            <span className="text-[11px] font-bold tracking-[0.2em] text-stone-400 uppercase">
              Your data is safe
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-white font-normal leading-[1.15]">
              Security and reliability
              <br />
              you can count on.
            </h2>
          </AnimateOnEnter>

          {/* Right: flat icon rows — staggered reveal */}
          <StaggerContainer
            className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10"
            staggerDelay={0.08}
          >
            {items.map((item) => (
              <StaggerItem key={item.title} className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary/8 dark:bg-primary/10 text-primary flex items-center justify-center mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
