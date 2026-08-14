import React from 'react';
import { AlignLeft } from 'lucide-react';

export default function InThisArticle() {
  const items = [
    'What Makes a Great Adventure Game?',
    'Our Top 10 Adventure Games for 2024',
    'Comparison Table',
    'Which Game Should You Play?',
    'Final Thoughts',
    'FAQs'
  ];

  return (
    <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-2xl p-6 md:p-8 mb-10 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-3 mb-6">
        <AlignLeft className="text-[#6366F1]" size={20} />
        <h3 className="text-lg font-bold font-outfit text-gray-900 dark:text-white">In This Article</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {items.map((item, index) => (
          <a 
            key={index} 
            href={`#section-${index + 1}`}
            className="flex items-start gap-3 group"
          >
            <span className="text-gray-500 font-bold text-sm min-w-[20px]">{index + 1}.</span>
            <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-sm font-medium leading-relaxed">
              {item}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
