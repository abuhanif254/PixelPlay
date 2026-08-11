"use client";

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="mb-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
      <div className="flex flex-col gap-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          
          return (
            <div 
              key={index} 
              className={`rounded-xl border transition-colors duration-200 overflow-hidden ${
                isOpen 
                  ? 'bg-white dark:bg-white/10 border-primary/30 dark:border-primary/30 shadow-md shadow-primary/5' 
                  : 'bg-gray-50 dark:bg-[#12132A] border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
              >
                <span className="font-semibold text-gray-900 dark:text-white pr-4">
                  {faq.q}
                </span>
                <ChevronDown 
                  size={20} 
                  className={`text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-primary dark:text-primary' : ''}`}
                />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? 'max-h-96 opacity-100 pb-4 px-4' : 'max-h-0 opacity-0 px-4'
                }`}
              >
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
