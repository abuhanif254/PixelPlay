'use client';
import React, { useEffect, useState } from 'react';

export default function TableOfContentsWidget() {
  const [activeId, setActiveId] = useState<string>('section-1');

  const items = [
    { id: 'section-1', title: 'What Makes a Great Adventure Game?' },
    { id: 'section-2', title: 'Our Top 10 Adventure Games for 2024' },
    { id: 'section-3', title: 'Comparison Table' },
    { id: 'section-4', title: 'Which Game Should You Play?' },
    { id: 'section-5', title: 'Final Thoughts' },
    { id: 'section-6', title: 'FAQs' }
  ];

  useEffect(() => {
    // Simple intersection observer to highlight active section in TOC
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-transparent border border-white/5 rounded-2xl p-6 shadow-xl mb-6">
      <h3 className="text-xl font-bold font-outfit text-white mb-6">Table of Contents</h3>
      <nav className="flex flex-col gap-3">
        {items.map((item, index) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`flex items-start gap-3 text-sm transition-colors ${
              activeId === item.id 
              ? 'text-[#6366F1] font-bold' 
              : 'text-gray-400 hover:text-white font-medium'
            }`}
          >
            <span className="shrink-0">{index + 1}.</span>
            <span className="leading-snug">{item.title}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
