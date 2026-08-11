'use client';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const homepageFaqs = [
  {
    q: "Are the games on PixelPlay really free?",
    a: "Yes! Every single game on PixelPlay is 100% free to play. We sustain our platform through non-intrusive advertising so you never have to pay to enjoy your favorite games."
  },
  {
    q: "Do I need to download or install anything?",
    a: "No downloads or installations are required. All of our games are built using web technologies like HTML5 and WebGL, meaning they run directly inside your web browser."
  },
  {
    q: "Can I play on my mobile phone or tablet?",
    a: "Absolutely. PixelPlay is fully optimized for mobile devices. Our responsive design ensures that most games will automatically adapt to your screen size for a perfect touch-screen experience."
  },
  {
    q: "Do I need to create an account to play?",
    a: "You can play most games without an account. However, creating a free account allows you to save your progress in the cloud, track your achievements, and maintain a customized list of favorite games."
  }
];

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
