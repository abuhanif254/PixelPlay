'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import GameCardSmall from './GameCardSmall';
import GameMedia from './GameMedia';
import GameReviews from './GameReviews';
import GameTags from './GameTags';

interface GameDetailsTabsProps {
  config: any; // GameConfig
  relatedGames: any[];
}

export default function GameDetailsTabs({ config, relatedGames }: GameDetailsTabsProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const TABS = [
    { id: 'about', label: 'About' },
    { id: 'media', label: 'Media' },
    { id: 'tips', label: 'Tips & Tricks' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'faq', label: 'FAQ' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full mt-10">
      {/* Anchor Navigation Header */}
      <div className="flex items-center gap-6 border-b border-gray-200 dark:border-white/5 mb-8 overflow-x-auto custom-scrollbar pb-1">
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => scrollToSection(tab.id)}
            className={`whitespace-nowrap pb-3 text-sm font-bold transition-all relative hover:text-[#6366F1] ${
              index === 0 ? 'text-[#6366F1]' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {tab.label}
            {index === 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366F1] rounded-t-full shadow-[0_-2px_10px_rgba(99,102,241,0.5)]" />
            )}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column - Sequential Content */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          
          <div className="bg-transparent">
            
            {/* About Section */}
            <div id="about" className="scroll-mt-32">
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white font-outfit">About {config.title}</h3>
              <p className="text-sm md:text-base leading-relaxed text-gray-600 dark:text-gray-400">
                {config.description || `${config.title} is a free online game that you can play directly in your browser. No downloads or installations required.`}
              </p>
              {config.history && (
                <div dangerouslySetInnerHTML={{ __html: config.history }} className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed mt-4" />
              )}
            </div>

            {/* Media Section */}
            <GameMedia 
              title={config.title} 
              trailerUrl={config.trailerUrl} 
              screenshots={config.screenshots} 
            />

            <div className="w-full h-px bg-gray-200 dark:bg-white/5 my-8" />

            {/* Tips Section */}
            <div id="tips" className="scroll-mt-32">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white font-outfit">Tips & Tricks</h3>
              {config.tips && config.tips.length > 0 ? (
                <ul className="space-y-2 list-disc pl-5 text-gray-600 dark:text-gray-400 text-sm md:text-base">
                  {config.tips.map((tip: string, idx: number) => (
                    <li key={idx} className="pl-1">{tip}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-sm">No tips available for this game yet.</p>
              )}
              {config.strategy && (
                <div dangerouslySetInnerHTML={{ __html: config.strategy }} className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed mt-4" />
              )}
            </div>

            {/* Reviews Section */}
            <GameReviews title={config.title} rating={config.rating} />

            <div className="w-full h-px bg-gray-200 dark:bg-white/5 my-8" />

            {/* FAQ Section */}
            <div id="faq" className="scroll-mt-32">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white font-outfit">Frequently Asked Questions</h3>
              {config.faqs && config.faqs.length > 0 ? (
                <div className="space-y-3">
                  {config.faqs.map((faq: { q: string; a: string }, idx: number) => {
                    const isOpen = openFaq === idx;
                    return (
                      <div 
                        key={idx} 
                        className={`border rounded-xl overflow-hidden transition-colors ${
                          isOpen 
                            ? 'border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/20 dark:bg-indigo-950/20' 
                            : 'border-gray-200 dark:border-white/10 bg-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? null : idx)}
                          className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
                          aria-expanded={isOpen}
                        >
                          <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm md:text-base pr-4">
                            {faq.q}
                          </h4>
                          <svg 
                            className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#6366F1]' : ''}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div 
                          className={`px-4 pb-4 pt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/5 ${
                            isOpen ? 'block' : 'hidden'
                          }`}
                        >
                          {faq.a}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-sm">No FAQs available for this game yet.</p>
              )}
            </div>

            {/* Tags Section */}
            <GameTags tags={config.tags} category={config.category} />

          </div>

        </div>

        {/* Right Column - Related Games */}
        <div className="lg:col-span-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-outfit">Related Games</h3>
            <Link 
              href={`/categories/${(config.category || 'arcade').toLowerCase().replace(/\s+/g, '-')}-games`} 
              className="text-[#6366F1] text-xs font-bold hover:underline"
            >
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {relatedGames.slice(0, 10).map((game, i) => (
              <GameCardSmall 
                key={i} 
                title={game.title} 
                slug={game.slug} 
                rating={game.rating || 4.5} 
                imageUrl={game.image} 
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
