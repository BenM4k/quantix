"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { AnimateOnEnter, EASE_OUT_EXPO } from "./animate-on-enter";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Do I need an accountant to use Quantix CD?",
    answer:
      "No. Quantix CD is built from the ground up for business owners and operators. Everyday sales, invoices, and expenses automatically turn into accurate double-entry financial statements.",
  },
  {
    question: "Can I invite my accountant?",
    answer:
      "Yes — you can invite your CPA, bookkeeper, or financial advisor with specialized read-only or advisor permissions at no additional cost.",
  },
  {
    question: "Can I have more than one company?",
    answer:
      "Absolutely. Quantix CD supports multiple isolated organizations and companies under a single login with seamless switching.",
  },
  {
    question: "Is my data secure?",
    answer:
      "We use bank-grade AES-256 encryption at rest and TLS in transit, automated daily backups with point-in-time recovery, and strict tenant isolation.",
  },
  {
    question: "Can I import my existing data?",
    answer:
      "Yes — you can import your chart of accounts, customers, vendors, products, and historical transactions via standard CSV or Excel templates.",
  },
  {
    question: "What if I need help?",
    answer:
      "Our support team is available via email and in-app chat. We also provide comprehensive documentation and workflow guides.",
  },
];

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduced = useReducedMotion();

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-20 md:py-32 border-b border-stone-200/60 dark:border-stone-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20">
          {/* Left: Title */}
          <AnimateOnEnter className="lg:col-span-4 space-y-4">
            <span className="text-[11px] font-bold tracking-[0.2em] text-stone-400 uppercase">
              FAQ
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-white leading-[1.15] font-normal">
              Questions?
              <br />
              We&apos;ve got answers.
            </h2>
          </AnimateOnEnter>

          {/* Right: Flat accordion with smooth height & opacity transition */}
          <div className="lg:col-span-8">
            <div className="divide-y divide-stone-200/80 dark:divide-stone-800">
              {faqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div key={faq.question} className="overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggle(idx)}
                      aria-expanded={isOpen}
                      className="w-full py-6 text-left flex items-center justify-between text-sm font-medium text-stone-900 dark:text-stone-100 hover:text-primary transition-colors gap-4 cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>
                    {reduced ? (
                      isOpen && (
                        <p className="pb-6 text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      )
                    ) : (
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              duration: 0.22,
                              ease: EASE_OUT_EXPO,
                            }}
                            className="overflow-hidden"
                          >
                            <p className="pb-6 text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
