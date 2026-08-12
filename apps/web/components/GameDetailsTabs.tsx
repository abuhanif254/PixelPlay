'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import GameCardSmall from './GameCardSmall';

interface GameDetailsTabsProps {
  config: any; // GameConfig
  relatedGames: any[];
}

type TabType = 'About' | 'Tips & Tricks' | 'Features' | 'FAQ';

export default function GameDetailsTabs({ config, relatedGames }: GameDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('About');

  const TABS: TabType[] = ['About', 'Tips & Tricks', 'Features', 'FAQ'];

  return (
    <div className="w-full">
      {/* Tabs Header */}
      <div className="flex items-center gap-6 border-b border-white/5 mb-8 overflow-x-auto custom-scrollbar pb-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap pb-3 text-sm font-bold transition-all relative ${
              activeTab === tab 
                ? 'text-[#6366F1]' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366F1] rounded-t-full shadow-[0_-2px_10px_rgba(99,102,241,0.5)]" />
            )}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column - Dynamic Tab Content */}
        <div className="lg:col-span-8">
          
          <div className="bg-[#0A0B1A]/50 border border-white/5 rounded-2xl p-6 md:p-8">
            {activeTab === 'About' && (
              <div className="prose prose-invert max-w-none prose-p:text-gray-400 prose-headings:text-white prose-headings:font-outfit">
                <h3 className="text-xl font-bold mb-4 text-white">About {config.title}</h3>
                <p className="text-sm md:text-base leading-relaxed text-gray-300">
                  {config.description || `${config.title} is a free online game that you can play directly in your browser. No downloads or installations required.`}
                </p>
                {config.history && (
                  <>
                    <h3 className="text-xl font-bold mt-8 mb-4 text-white">History</h3>
                    <div dangerouslySetInnerHTML={{ __html: config.history }} className="text-sm md:text-base text-gray-300 leading-relaxed" />
                  </>
                )}
              </div>
            )}

            {activeTab === 'Tips & Tricks' && (
              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-bold mb-4 text-white font-outfit">Tips & Tricks</h3>
                {config.tips && config.tips.length > 0 ? (
                  <ul className="space-y-3 list-disc pl-5 text-gray-300 text-sm md:text-base">
                    {config.tips.map((tip: string, idx: number) => (
                      <li key={idx} className="pl-1">{tip}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-sm">No tips available for this game yet.</p>
                )}

                {config.strategy && (
                  <>
                    <h3 className="text-xl font-bold mt-8 mb-4 text-white font-outfit">Strategy</h3>
                    <div dangerouslySetInnerHTML={{ __html: config.strategy }} className="text-sm md:text-base text-gray-300 leading-relaxed" />
                  </>
                )}
              </div>
            )}

            {activeTab === 'Features' && (
              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-bold mb-4 text-white font-outfit">Game Features</h3>
                <ul className="space-y-3 list-none pl-0 text-gray-300 text-sm md:text-base">
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
                    Play instantly in your browser
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
                    Optimized for mobile and desktop
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
                    Free to play forever
                  </li>
                  {config.category && (
                    <li className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
                      Part of our premium {config.category} collection
                    </li>
                  )}
                </ul>
              </div>
            )}

            {activeTab === 'FAQ' && (
              <div>
                <h3 className="text-xl font-bold mb-6 text-white font-outfit">Frequently Asked Questions</h3>
                {config.faqs && config.faqs.length > 0 ? (
                  <div className="space-y-4">
                    {config.faqs.map((faq: {q: string, a: string}, idx: number) => (
                      <div key={idx} className="border border-white/10 rounded-xl overflow-hidden bg-[#111228]/50">
                        <div className="p-4 flex items-center justify-between">
                          <h4 className="font-bold text-white text-sm md:text-base">{faq.q}</h4>
                          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        {/* Always expanded for now based on design, or we can make it an accordion */}
                        {idx === 0 && (
                          <div className="px-4 pb-4 pt-1 text-sm text-gray-400 border-t border-white/5">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No FAQs available for this game yet.</p>
                )}
                
                <div className="mt-6 flex justify-end">
                  <button className="text-[#6366F1] text-xs font-bold hover:underline">
                    View All FAQs
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column - Related Games */}
        <div className="lg:col-span-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white font-outfit">Related Games</h3>
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
