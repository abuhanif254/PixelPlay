import React from 'react';
import { Metadata } from 'next';
import LeaderboardSidebar from '@/components/leaderboard/LeaderboardSidebar';
import LeaderboardHero from '@/components/leaderboard/LeaderboardHero';
import TopThreePodium from '@/components/leaderboard/TopThreePodium';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import TopChampionCard from '@/components/leaderboard/TopChampionCard';
import LeaderboardFilters from '@/components/leaderboard/LeaderboardFilters';
import UserRankCard from '@/components/leaderboard/UserRankCard';

export const metadata: Metadata = {
  title: 'Global Leaderboard | PixelPlay',
  description: 'Compete with players around the world and become the ultimate champion!',
};

export default function LeaderboardPage() {
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
            <TopThreePodium />
            <LeaderboardTable />
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
