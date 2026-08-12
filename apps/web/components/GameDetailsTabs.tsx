'use client';

import React from 'react';
import Link from 'next/link';
import GameCardSmall from './GameCardSmall';

interface GameDetailsTabsProps {
  config: any; // GameConfig
  relatedGames: any[];
}

export default function GameDetailsTabs({ config, relatedGames }: GameDetailsTabsProps) {
  const TABS = [
    { id: 'about', label: 'About' },
    { id: 'tips', label: 'Tips & Tricks' },
    { id: 'features', label: 'Features' },
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
      <div className="flex items-center gap-6 border-b border-white/5 mb-8 overflow-x-auto custom-scrollbar pb-1">
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => scrollToSection(tab.id)}
            className={`whitespace-nowrap pb-3 text-sm font-bold transition-all relative hover:text-[#6366F1] ${
              index === 0 ? 'text-[#6366F1]' : 'text-gray-400'
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
              <h3 className="text-xl font-bold mb-3 text-white font-outfit">About {config.title}</h3>
              <p className="text-sm md:text-base leading-relaxed text-gray-400">
                {config.description || `${config.title} is a free online game that you can play directly in your browser. No downloads or installations required.`}
              </p>
              {config.history && (
                <div dangerouslySetInnerHTML={{ __html: config.history }} className="text-sm md:text-base text-gray-400 leading-relaxed mt-4" />
              )}
            </div>

            <div className="w-full h-px bg-white/5 my-8" />

            {/* Tips Section */}
            <div id="tips" className="scroll-mt-32">
              <h3 className="text-xl font-bold mb-4 text-white font-outfit">Tips & Tricks</h3>
              {config.tips && config.tips.length > 0 ? (
                <ul className="space-y-2 list-disc pl-5 text-gray-400 text-sm md:text-base">
                  {config.tips.map((tip: string, idx: number) => (
                    <li key={idx} className="pl-1">{tip}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm">No tips available for this game yet.</p>
              )}
              {config.strategy && (
                <div dangerouslySetInnerHTML={{ __html: config.strategy }} className="text-sm md:text-base text-gray-400 leading-relaxed mt-4" />
              )}
            </div>

            <div className="w-full h-px bg-white/5 my-8" />

            {/* FAQ Section */}
            <div id="faq" className="scroll-mt-32">
              <h3 className="text-xl font-bold mb-4 text-white font-outfit">Frequently Asked Questions</h3>
              {config.faqs && config.faqs.length > 0 ? (
                <div className="space-y-3">
                  {config.faqs.map((faq: {q: string, a: string}, idx: number) => (
                    <div key={idx} className="border border-white/10 rounded-xl overflow-hidden bg-transparent transition-colors hover:bg-white/5">
                      <div className="p-4 flex items-center justify-between cursor-pointer">
                        <h4 className="font-bold text-gray-300 text-sm">{faq.q}</h4>
                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      {/* For exact visual matching, we leave the first one unexpanded or act like a standard accordion. In the image it's just collapsed rows. */}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No FAQs available for this game yet.</p>
              )}
              
              <div className="mt-4 flex justify-end">
                <button className="text-[#6366F1] text-xs font-bold hover:underline">
                  View All FAQs
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column - Related Games */}
        <div className="lg:col-span-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-white font-outfit">Related Games</h3>
            <Link 
              href={`/games?category=${config.category}`} 
              className="text-[#6366F1] text-xs font-bold hover:underline"
            >
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {relatedGames.slice(0, 4).map((game, i) => (
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
