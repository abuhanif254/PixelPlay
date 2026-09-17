'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, Compass, Gamepad2 } from 'lucide-react';
import { homepageFaqs } from '@/lib/constants';
import { arcadeAudio } from '@/lib/arcade-audio';

export default function MobileHomeSEO() {
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const popularCategories = [
    { name: 'Action Games', href: '/categories/action-games' },
    { name: 'Puzzle Games', href: '/categories/puzzle-games' },
    { name: 'Car Games', href: '/categories/car-games' },
    { name: '2 Player Games', href: '/categories/2-player-games' },
    { name: 'Shooting Games', href: '/categories/shooting-games' },
    { name: 'Arcade Games', href: '/categories/arcade-games' },
    { name: 'IO Games', href: '/categories/io-games' },
    { name: 'Runner Games', href: '/categories/runner-games' },
    { name: 'Unblocked Games', href: '/categories/unblocked-games' },
  ];

  return (
    <div className="px-3.5 sm:px-4 pt-6 pb-12 space-y-3">
      {/* Category Pills Quick Links */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#111228]/60 border border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <Compass className="w-4 h-4 text-indigo-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Explore All Genres
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {popularCategories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              onClick={() => arcadeAudio.playBlip()}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5 hover:border-indigo-500 active:scale-95 transition-all"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Expandable FAQs Accordion */}
      <div className="rounded-2xl bg-slate-50 dark:bg-[#111228]/60 border border-slate-200 dark:border-white/5 overflow-hidden">
        <button
          type="button"
          onClick={() => {
            setIsFaqOpen(!isFaqOpen);
            arcadeAudio.playBlip();
          }}
          className="w-full p-4 flex items-center justify-between text-left active:bg-slate-100 dark:active:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Frequently Asked Questions
            </h3>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isFaqOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isFaqOpen && (
          <div className="px-4 pb-4 space-y-3.5 border-t border-slate-200 dark:border-white/5 pt-3">
            {homepageFaqs.map((faq, i) => (
              <div key={i} className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {faq.q}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expandable About Spielcade SEO Block */}
      <div className="rounded-2xl bg-slate-50 dark:bg-[#111228]/60 border border-slate-200 dark:border-white/5 overflow-hidden">
        <button
          type="button"
          onClick={() => {
            setIsAboutOpen(!isAboutOpen);
            arcadeAudio.playBlip();
          }}
          className="w-full p-4 flex items-center justify-between text-left active:bg-slate-100 dark:active:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              About Free Online Games on Spielcade
            </h3>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isAboutOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isAboutOpen && (
          <div className="px-4 pb-4 text-[11px] text-slate-600 dark:text-slate-400 space-y-2 border-t border-slate-200 dark:border-white/5 pt-3 leading-relaxed">
            <p>
              Spielcade offers over 17,000 free online games playable directly in your mobile browser without app downloads or installations.
            </p>
            <p>
              Enjoy high-speed HTML5 games including car games, unblocked games, 2-player multiplayer games, puzzle challenges, and competitive arcade games across any smartphone or tablet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
