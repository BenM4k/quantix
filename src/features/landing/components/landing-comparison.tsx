import React from "react";
import { UserPlus, Building2, FileText, CheckCircle } from "lucide-react";
import { AnimateOnEnter, StaggerContainer, StaggerItem } from "./animate-on-enter";

const setupSteps = [
  {
    step: "01",
    time: "90 sec",
    icon: <UserPlus className="w-5 h-5" />,
    title: "Create your account",
    description: "Sign up with email. No credit card, no lengthy form.",
  },
  {
    step: "02",
    time: "2 min",
    icon: <Building2 className="w-5 h-5" />,
    title: "Add your company",
    description:
      "Enter your business name and currency. Your chart of accounts is built automatically.",
  },
  {
    step: "03",
    time: "3 min",
    icon: <FileText className="w-5 h-5" />,
    title: "Add a product and a customer",
    description:
      "Two quick forms — you only need what you'll actually use on the first invoice.",
  },
  {
    step: "04",
    time: "90 sec",
    icon: <CheckCircle className="w-5 h-5" />,
    title: "Send your first invoice",
    description:
      "Create, preview, and send. Payment recorded → stock updated → books closed. Done.",
  },
];

export function LandingComparison() {
  return (
    <section className="py-20 md:py-32 bg-[#FAF5F0]/70 dark:bg-stone-900/40 border-y border-stone-200/60 dark:border-stone-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 items-start">
          {/* Left: Steps */}
          <StaggerContainer className="lg:col-span-7 space-y-0" staggerDelay={0.08}>
            {setupSteps.map((item, i) => (
              <StaggerItem
                key={item.step}
                className={`flex gap-6 py-7 ${
                  i < setupSteps.length - 1
                    ? "border-b border-stone-200/70 dark:border-stone-800"
                    : ""
                }`}
              >
                {/* Icon */}
                <div className="shrink-0 w-11 h-11 rounded-full bg-[#FA5A1E]/8 dark:bg-[#FA5A1E]/10 text-[#FA5A1E] flex items-center justify-center mt-0.5">
                  {item.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 mb-1.5">
                    <span className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                      {item.title}
                    </span>
                    <span className="text-[11px] font-bold text-[#FA5A1E] bg-[#FA5A1E]/8 dark:bg-[#FA5A1E]/10 px-2.5 py-0.5 rounded-full shrink-0">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl">
                    {item.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Right: Proof claim */}
          <AnimateOnEnter className="lg:col-span-5 lg:sticky lg:top-28 space-y-6" delay={0.1}>
            <p className="text-[11px] font-bold tracking-[0.2em] text-stone-400 uppercase">
              No consultants required
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl text-stone-900 dark:text-white leading-[1.1] font-normal">
              First invoice
              <br />
              in under{" "}
              <span className="text-[#FA5A1E] italic">8 minutes.</span>
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
              Traditional ERP implementations take months and cost thousands in
              consulting fees. Quantix CD is designed to be self-serve from day
              one — your only requirement is knowing what you sell and who you
              sell it to.
            </p>

            {/* Micro social proof */}
            <div className="pt-3 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["F", "M", "J", "A"].map((initial) => (
                  <div
                    key={initial}
                    className="w-7 h-7 rounded-full bg-stone-200 dark:bg-stone-700 border-2 border-[#FAF5F0] dark:border-stone-900 flex items-center justify-center text-[10px] font-semibold text-stone-600 dark:text-stone-300"
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Founders who set up without help this week
              </p>
            </div>
          </AnimateOnEnter>
        </div>
      </div>
    </section>
  );
}
