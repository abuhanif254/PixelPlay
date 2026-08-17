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
  title: 'Global Leaderboard | Spielcade',
  description: 'Compete with players around the world and become the ultimate champion!',
};

export const revalidate = 0; // Dynamic route for live scores

export default async function LeaderboardPage({ searchParams }: { searchParams: { game?: string, time?: string, region?: string } }) {
  const supabase = createClient();
  
  // Resolve filters
  const gameSlug = searchParams.game;
  const timePeriod = searchParams.time; // e.g., 'This Week'
  
  let gameId = null;
  if (gameSlug && gameSlug !== 'All Games') {
    const { data: g } = await supabase.from('games').select('id').eq('slug', gameSlug).single();
    if (g) gameId = g.id;
  }
  
  let days = null;
  if (timePeriod === 'This Week') days = 7;
  else if (timePeriod === 'This Month') days = 30;

  // Fetch games for filters/sidebar
  const { data: gamesList } = await supabase.from('games').select('id, title, slug');
  const availableGames = gamesList || [];

  // Fetch leaderboard via RPC
  const { data: leaderboardData } = await supabase.rpc('get_global_leaderboard', { 
    p_game_id: gameId, 
    p_days: days 
  });

  const rawPlayers = leaderboardData || [];

  // Map to PlayerScore format
  const mappedPlayers: PlayerScore[] = rawPlayers.map((s: any) => ({
    rank: Number(s.rank),
    userId: s.user_id,
    name: s.username || 'Unknown Player',
    score: Number(s.best_score).toLocaleString(),
    topGame: s.top_game_title || 'Unknown Game',
    gamesPlayed: Number(s.games_played) || 0,
    avatar: s.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`
  }));

  const topThree = mappedPlayers.slice(0, 3);
  const remainingPlayers = mappedPlayers.slice(3);
  const topChampion = mappedPlayers.length > 0 ? mappedPlayers[0] : null;

  // Get current user's rank
  const { data: { user } } = await supabase.auth.getUser();
  let userRankData = null;

  if (user) {
    const userInLeaderboard = mappedPlayers.find(p => p.userId === user.id);
    if (userInLeaderboard) {
      userRankData = userInLeaderboard;
    } else {
      // User is logged in but not in the leaderboard for this filter (0 games/score)
      const { data: profile } = await supabase.from('profiles').select('username, avatar_url').eq('id', user.id).single();
      if (profile) {
        userRankData = {
          rank: 0, // indicates unranked
          userId: user.id,
          name: profile.username || 'Player',
          score: '0',
          topGame: 'None',
          gamesPlayed: 0,
          avatar: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`
        };
      }
    }
  }

  // SEO JSON-LD Schema
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Global Leaderboard - Spielcade",
    "description": "Top players on Spielcade across all games.",
    "itemListElement": mappedPlayers.slice(0, 50).map((player, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Person",
        "name": player.name,
        "url": `https://spielcade.com/profile/${player.name}`
      }
    }))
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05050F] text-gray-900 dark:text-white pt-24 pb-20 transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <div className="container mx-auto px-4 xl:px-8 max-w-[1400px]">
        
        {/* 12 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative">
          
          {/* Left Sidebar (2 cols) */}
          <div className="hidden lg:block lg:col-span-2 relative">
            <div className="sticky top-24">
              <LeaderboardSidebar games={availableGames} topPlayers={topThree} />
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
            <TopChampionCard champion={topChampion} />
            <div className="sticky top-24">
              <LeaderboardFilters games={availableGames} currentFilters={{ game: gameSlug, time: timePeriod }} />
              <UserRankCard userRank={userRankData} isLoggedIn={!!user} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
