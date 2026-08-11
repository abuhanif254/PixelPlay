'use client';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { homepageFaqs } from '@/lib/constants';

export default function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
      {homepageFaqs.map((faq, index) => (
        <div 
          key={index} 
          className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 shadow-sm"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-6 py-4 flex items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-expanded={openIndex === index}
          >
            <span className="font-semibold text-lg pr-4">{faq.q}</span>
            <ChevronDown 
              className={`w-5 h-5 shrink-0 transition-transform duration-200 text-gray-500 ${openIndex === index ? 'rotate-180' : ''}`} 
            />
          </button>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-6 pb-5 text-gray-600 dark:text-gray-300 prose prose-sm dark:prose-invert">
                  {faq.a}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
