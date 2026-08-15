export const runtime = 'edge';
import React from 'react';
import { Metadata } from 'next';
import LeaderboardSidebar from '@/components/leaderboard/LeaderboardSidebar';
import LeaderboardHero from '@/components/leaderboard/LeaderboardHero';
import TopThreePodium from '@/components/leaderboard/TopThreePodium';
import LeaderboardTable, { PlayerScore } from '@/components/leaderboard/LeaderboardTable';
import TopChampionCard from '@/components/leaderboard/TopChampionCard';
import LeaderboardFilters from '@/components/leaderboard/LeaderboardFilters';
import UserRankCard from '@/components/leaderboard/UserRankCard';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Global Leaderboard | PixelPlay',
  description: 'Compete with players around the world and become the ultimate champion!',
};

export const revalidate = 0; // Dynamic route for live scores

export default async function LeaderboardPage() {
  const supabase = createClient();
  
  // Fetch top 10 scores
  const { data: scores } = await supabase
    .from('scores')
    .select(`
      score,
      games ( title ),
      profiles ( username, avatar_url )
    `)
    .order('score', { ascending: false })
    .limit(10);

  // Map to PlayerScore format
  const mappedPlayers: PlayerScore[] = (scores || []).map((s: any, index) => ({
    rank: index + 1,
    name: s.profiles?.username || 'Unknown Player',
    score: s.score.toLocaleString(),
    topGame: s.games?.title || 'Unknown Game',
    avatar: s.profiles?.avatar_url || ''
  }));

  const topThree = mappedPlayers.slice(0, 3);
  const remainingPlayers = mappedPlayers.slice(3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05050F] text-gray-900 dark:text-white pt-24 pb-20 transition-colors">
      <div className="container mx-auto px-4 xl:px-8 max-w-[1400px]">
        
        {/* 12 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative">
          
          {/* Left Sidebar (2 cols) */}
          <div className="hidden lg:block lg:col-span-2 relative">
            <div className="sticky top-24">
              <LeaderboardSidebar />
            </div>
          </div>

          {/* Main Content (7 cols) */}
          <div className="col-span-1 lg:col-span-7 flex flex-col">
            <LeaderboardHero />
            <TopThreePodium topThree={topThree} />
            <LeaderboardTable players={remainingPlayers} />
          </div>

          {/* Right Sidebar (3 cols) */}
          <div className="col-span-1 lg:col-span-3 flex flex-col">
            <TopChampionCard />
            <div className="sticky top-24">
              <LeaderboardFilters />
              <UserRankCard />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
