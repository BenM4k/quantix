"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const leftFaqs: FAQItem[] = [
  {
    question: "Do I need an accountant to use Quantix CD?",
    answer:
      "No. Quantix CD is built from the ground up for business owners and operators. Everyday sales, invoices, and expenses automatically turn into accurate double-entry financial statements.",
  },
  {
    question: "Can I invite my accountant?",
    answer:
      "Yes! You can invite your CPA, bookkeeper, or financial advisor with specialized read-only or advisor permissions at no additional cost.",
  },
  {
    question: "Can I have more than one company?",
    answer:
      "Absolutely. Quantix CD supports multiple isolated organizations and companies under a single login with seamless switching.",
  },
];

const rightFaqs: FAQItem[] = [
  {
    question: "Is my data secure?",
    answer:
      "We use bank-grade AES-256 encryption at rest and TLS in transit, automated daily backups with point-in-time recovery, and strict tenant isolation.",
  },
  {
    question: "Can I import my data?",
    answer:
      "Yes, you can import your chart of accounts, customers, vendors, products, and historical transactions via standard CSV or Excel templates.",
  },
  {
    question: "What if I need help?",
    answer:
      "Our support team is available via email and in-app chat. We also provide comprehensive documentation and workflow guides.",
  },
];

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <section className="py-16 md:py-24 border-b border-stone-200/60 dark:border-stone-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Left Title */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-[11px] font-bold tracking-[0.2em] text-stone-500 dark:text-stone-400 uppercase">
              FAQ
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-white leading-[1.15] font-normal">
              Questions?
              <br />
              We&apos;ve got answers.
            </h2>
          </div>

          {/* Right FAQs (2 columns) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="space-y-3">
              {leftFaqs.map((faq, idx) => {
                const id = `left-${idx}`;
                const isOpen = openIndex === id;
                return (
                  <div
                    key={faq.question}
                    className="border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggle(id)}
                      className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-100 hover:text-[#FA5A1E] transition-colors gap-2"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-[#FA5A1E]" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-stone-500 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/60">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              {rightFaqs.map((faq, idx) => {
                const id = `right-${idx}`;
                const isOpen = openIndex === id;
                return (
                  <div
                    key={faq.question}
                    className="border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggle(id)}
                      className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-100 hover:text-[#FA5A1E] transition-colors gap-2"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-[#FA5A1E]" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-stone-500 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/60">
                        {faq.answer}
                      </div>
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
