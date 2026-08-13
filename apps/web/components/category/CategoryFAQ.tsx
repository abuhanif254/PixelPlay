'use client';
import React, { useState } from 'react';

export default function CategoryFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What are puzzle games?',
      a: 'Puzzle games are a genre of video games that emphasize puzzle solving. The types of puzzles can test many problem-solving skills including logic, pattern recognition, sequence solving, spatial recognition, and word completion.'
    },
    {
      q: 'Are these puzzle games free to play?',
      a: 'Yes, all puzzle games on our platform are 100% free to play directly in your web browser.'
    },
    {
      q: 'Can I play puzzle games on my phone?',
      a: 'Absolutely! Most of our puzzle games are fully optimized for mobile devices and tablets.'
    },
    {
      q: 'Do puzzle games improve brain health?',
      a: 'Studies suggest that playing puzzle games can help improve memory, cognitive function, and problem-solving skills.'
    }
  ];

  return (
    <div className="flex flex-col flex-1">
      <h3 className="text-xl font-bold font-outfit text-white mb-6">Frequently Asked Questions</h3>
      <div className="flex flex-col gap-3">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={`border border-white/5 rounded-xl overflow-hidden transition-colors ${openIndex === index ? 'bg-[#111228] border-white/10' : 'bg-transparent hover:bg-white/5'}`}
          >
            <button 
              className="w-full px-6 py-4 flex items-center justify-between text-left"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <span className="text-sm font-bold text-gray-300">{faq.q}</span>
              <svg 
                className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-[#6366F1]' : ''}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div 
              className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-40 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <p className="text-sm text-gray-500 leading-relaxed">
                {faq.a}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
