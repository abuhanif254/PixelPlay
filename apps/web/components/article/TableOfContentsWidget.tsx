'use client';
import React, { useEffect, useState } from 'react';

type ToCItem = {
  id: string;
  title: string;
  level: number;
};

export default function TableOfContentsWidget() {
  const [activeId, setActiveId] = useState<string>('');
  const [items, setItems] = useState<ToCItem[]>([]);

  useEffect(() => {
    // Wait a brief moment for MDX to render
    const timeout = setTimeout(() => {
      const elements = Array.from(document.querySelectorAll('.prose h2, .prose h3'));
      const parsedItems: ToCItem[] = elements.map((el, i) => {
        // Ensure every heading has an ID
        if (!el.id) {
          el.id = el.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `heading-${i}`;
        }
        return {
          id: el.id,
          title: el.textContent || '',
          level: el.tagName === 'H3' ? 3 : 2
        };
      });
      setItems(parsedItems);

      if (parsedItems.length > 0) {
        setActiveId(parsedItems[0].id);
      }

      // Scroll Spy
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        },
        { rootMargin: '-10% 0px -80% 0px' }
      );

      elements.forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-xl mb-6 sticky top-24">
      <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white mb-6">Table of Contents</h3>
      <nav className="flex flex-col gap-3">
        {items.map((item, index) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex items-start gap-3 text-sm transition-colors ${
              item.level === 3 ? 'ml-4' : ''
            } ${
              activeId === item.id 
              ? 'text-[#6366F1] font-bold' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium'
            }`}
          >
            <span className="shrink-0 text-gray-400">{item.level === 2 ? `${index + 1}.` : '•'}</span>
            <span className="leading-snug">{item.title}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
