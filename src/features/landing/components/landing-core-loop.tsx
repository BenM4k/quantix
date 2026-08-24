import React from "react";
import {
  FileText,
  Receipt,
  CreditCard,
  Package,
  BookOpen,
  BarChart3,
  ArrowRight,
} from "lucide-react";

interface StepItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: StepItem[] = [
  {
    icon: <FileText className="w-5 h-5 text-[#FA5A1E]" />,
    title: "Quote",
    description: "Create and send professional quotes.",
  },
  {
    icon: <Receipt className="w-5 h-5 text-[#FA5A1E]" />,
    title: "Invoice",
    description: "Convert to invoices in one click.",
  },
  {
    icon: <CreditCard className="w-5 h-5 text-[#FA5A1E]" />,
    title: "Payment",
    description: "Record payments and reconcile automatically.",
  },
  {
    icon: <Package className="w-5 h-5 text-[#FA5A1E]" />,
    title: "Stock",
    description: "Update inventory in real time.",
  },
  {
    icon: <BookOpen className="w-5 h-5 text-[#FA5A1E]" />,
    title: "Journal",
    description: "Automatic journal entries behind the scenes.",
  },
  {
    icon: <BarChart3 className="w-5 h-5 text-[#FA5A1E]" />,
    title: "Reports",
    description: "Accurate reports, always up to date.",
  },
];

export function LandingCoreLoop() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 border-t border-stone-200/60 dark:border-stone-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-[11px] font-bold tracking-[0.2em] text-stone-500 dark:text-stone-400 uppercase">
            The core loop, visualized
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative">
          {steps.map((step, index) => (
            <div key={step.title} className="relative flex flex-col items-center text-center group">
              {/* Connector Arrow (visible on desktop between items) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-6 -right-3 translate-x-1/2 z-10 text-stone-300 dark:text-stone-700">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}

              {/* Icon Container */}
              <div className="w-13 h-13 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs flex items-center justify-center mb-3.5 transition-transform duration-200 group-hover:scale-105 group-hover:border-orange-200 dark:group-hover:border-orange-900">
                {step.icon}
              </div>

              {/* Title & Description */}
              <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100 mb-1.5">
                {step.title}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-[150px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
