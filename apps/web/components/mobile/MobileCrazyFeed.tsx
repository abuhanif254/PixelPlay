'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, Zap, Trophy, RefreshCw } from 'lucide-react';
import MobileVibeScroller from './MobileVibeScroller';
import MobileSectionHeader from './MobileSectionHeader';
import MobileFeaturedCard from './MobileFeaturedCard';
import MobileAppGrid from './MobileAppGrid';
import MobileHomeSEO from './MobileHomeSEO';
import RecentGames from '@/components/RecentGames';
import { MobileCrazyFeedProps, MobileGameItem } from './types';

// Helper to derive country flag from browser locale
function getCountryFlag(): string {
  if (typeof navigator === 'undefined') return '🔥';
  try {
    const locale = navigator.language || (navigator.languages && navigator.languages[0]) || '';
    const parts = locale.split('-');
    if (parts.length >= 2) {
      const countryCode = parts[1].toUpperCase();
      if (/^[A-Z]{2}$/.test(countryCode)) {
        // Convert 2-letter ISO code to regional indicator symbols (flag emoji)
        return String.fromCodePoint(
          127397 + countryCode.charCodeAt(0),
          127397 + countryCode.charCodeAt(1)
        );
      }
    }
  } catch {
    // Graceful fallback
  }
  return '🔥';
}

export default function MobileCrazyFeed({
  trending,
  newGames,
  topRated,
  totalGamesCount,
}: MobileCrazyFeedProps) {
  const [countryFlag, setCountryFlag] = useState<string>('🔥');

  useEffect(() => {
    setCountryFlag(getCountryFlag());
  }, []);

  // Partition games for rhythmic feed
  const featured1: MobileGameItem | undefined = trending[0];
  const grid1: MobileGameItem[] = trending.slice(1, 7);

  const featured2: MobileGameItem | undefined = trending[7] || newGames[0];
  const grid2: MobileGameItem[] = trending.slice(8, 14);

  const featured3: MobileGameItem | undefined = trending[14] || topRated[0];
  const grid3: MobileGameItem[] = trending.slice(15, 21);

  const grid4: MobileGameItem[] = (newGames.length >= 6 ? newGames : trending).slice(0, 6);

  const featured4: MobileGameItem | undefined = topRated[1] || trending[21];
  const grid5: MobileGameItem[] = (topRated.length >= 8 ? topRated : trending).slice(2, 8);

  return (
    <div className="flex flex-col w-full pb-20 pt-1 bg-white dark:bg-[#070818] text-slate-900 dark:text-white min-h-screen">
      {/* 1. Top Quick Vibe / Mood Cards Scroller (Screenshot 2) */}
      <MobileVibeScroller />

      {/* 2. Top Games Today Section */}
      <section aria-label="Top Games Today" className="w-full">
        <MobileSectionHeader
          title="Top games today"
          flag={countryFlag}
          actionHref="/popular"
          actionText="View all"
        />

        {/* Featured Card 1 (Top Hero) */}
        {featured1 && (
          <MobileFeaturedCard
            game={featured1}
            priority={true}
            badge="video"
          />
        )}

        {/* 3-Column Grid 1 (6 games) */}
        <MobileAppGrid games={grid1} priorityFirstRow={true} />
      </section>

      {/* 3. Mid-Stream Showcase Card 2 & Grid 2 (Screenshot 1 & 3) */}
      <section aria-label="Popular Games" className="w-full mt-2">
        {featured2 && (
          <MobileFeaturedCard
            game={featured2}
            priority={false}
            badge="refresh"
          />
        )}

        {/* 3-Column Grid 2 (6 games) */}
        <MobileAppGrid games={grid2} />
      </section>

      {/* 4. Continue Playing Shelf (Client localStorage personal history) */}
      <div className="px-3.5 sm:px-4 my-2">
        <RecentGames />
      </div>

      {/* 5. Featured Games Section (Screenshot 3) */}
      <section aria-label="Featured Games" className="w-full mt-2">
        <MobileSectionHeader
          title="Featured games"
          icon={
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-3.5 h-3.5 fill-white" />
            </div>
          }
          actionHref="/games"
          actionText="More"
        />

        {/* Featured Card 3 */}
        {featured3 && (
          <MobileFeaturedCard
            game={featured3}
            priority={false}
            badge="star"
          />
        )}

        {/* 3-Column Grid 3 (6 games) */}
        <MobileAppGrid games={grid3} />
      </section>

      {/* 6. Instant Play & New Arrivals Section */}
      <section aria-label="Fresh Releases" className="w-full mt-2">
        <MobileSectionHeader
          title="Instant Play & Action"
          icon={
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-white" />
            </div>
          }
          actionHref="/games/new"
          actionText="New"
        />

        {/* 3-Column Grid 4 (6 games) */}
        <MobileAppGrid games={grid4} />
      </section>

      {/* 7. Hall of Fame / Community Favorites */}
      <section aria-label="Community Champions" className="w-full mt-2">
        <MobileSectionHeader
          title="Hall of Fame"
          icon={
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600 flex items-center justify-center text-white shadow-sm">
              <Trophy className="w-3.5 h-3.5 fill-white" />
            </div>
          }
          actionHref="/popular"
          actionText="Top rated"
        />

        {/* Featured Card 4 */}
        {featured4 && (
          <MobileFeaturedCard
            game={featured4}
            priority={false}
            badge="flame"
          />
        )}

        {/* 3-Column Grid 5 (6 games) */}
        <MobileAppGrid games={grid5} />
      </section>

      {/* 8. Collapsible Mobile SEO & FAQ Block */}
      <MobileHomeSEO />
    </div>
  );
}
