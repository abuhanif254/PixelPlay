'use client';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { homepageFaqs } from '@/lib/constants';

export default function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-extrabold font-outfit text-gray-900 dark:text-white mb-2">
          Frequently Asked Questions
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Everything you need to know about playing and publishing games on Spielcade.
        </p>
      </div>

      {homepageFaqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div 
            key={index} 
            className={`bg-white dark:bg-[#111228]/90 backdrop-blur-md rounded-2xl overflow-hidden border transition-all duration-300 ${
              isOpen 
                ? 'border-[#6366F1]/50 shadow-[0_4px_25px_rgba(99,102,241,0.15)] ring-1 ring-[#6366F1]/20' 
                : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
            }`}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full px-6 py-4 flex items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] group"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3 pr-4">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0 transition-colors ${
                  isOpen ? 'bg-[#6366F1] text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white'
                }`}>
                  {index + 1}
                </span>
                <span className={`font-bold text-base md:text-lg transition-colors ${isOpen ? 'text-[#6366F1] dark:text-[#818CF8]' : 'text-gray-900 dark:text-white'}`}>
                  {faq.q}
                </span>
              </div>
              <ChevronDown 
                className={`w-5 h-5 shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180 text-[#6366F1]' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white'
                }`} 
              />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div className="px-6 pb-5 pl-15 text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed border-t border-gray-100 dark:border-white/5 pt-3">
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
