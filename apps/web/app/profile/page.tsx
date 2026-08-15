import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import ProfileHero from '@/components/profile/ProfileHero';
import ProfileGameRow from '@/components/profile/ProfileGameRow';
import ProfileAchievements from '@/components/profile/ProfileAchievements';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileActivity from '@/components/profile/ProfileActivity';
import ProfileCollections from '@/components/profile/ProfileCollections';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'My Profile | PixelPlay',
    description: 'Your player profile, stats, achievements and activity.',
  };
}

export default async function ProfilePage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // ── Full profile ────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, banner_url, bio, xp, level, streak, favorite_game_ids, last_played_at, created_at')
    .eq('id', user.id)
    .single();

  // ── All scores with game data ────────────────────────────────────────
  const { data: scores } = await supabase
    .from('scores')
    .select('id, score, created_at, game_id, games(id, title, slug, image_url, category)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const typedScores = (scores || []) as any[];

  // ── Compute stats ────────────────────────────────────────────────────
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000);

  const scoresThisWeek = typedScores.filter(s => new Date(s.created_at) >= weekAgo);
  const scoresPrevWeek = typedScores.filter(s => {
    const d = new Date(s.created_at);
    return d >= twoWeeksAgo && d < weekAgo;
  });

  const totalScore = typedScores.reduce((a, s) => a + (s.score || 0), 0);
  const totalScoreThisWeek = scoresThisWeek.reduce((a, s) => a + (s.score || 0), 0);
  const totalScorePrevWeek = scoresPrevWeek.reduce((a, s) => a + (s.score || 0), 0);
  const highestScore = typedScores.length > 0 ? Math.max(...typedScores.map(s => s.score || 0)) : 0;

  // Unique games played
  const uniqueGamesPlayed = new Set(typedScores.map(s => s.game_id)).size;
  const gamesThisWeek = new Set(scoresThisWeek.map(s => s.game_id)).size;
  const gamesPrevWeek = new Set(scoresPrevWeek.map(s => s.game_id)).size;

  // ── Category breakdown for radar chart ──────────────────────────────
  const categoryMap: Record<string, number> = {};
  typedScores.forEach(s => {
    const cat = s.games?.category || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const totalCategoryScores = Object.values(categoryMap).reduce((a, b) => a + b, 0) || 1;
  const categoryStats = Object.entries(categoryMap)
    .map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / totalCategoryScores) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // ── Recently played (unique games, most recent first) ────────────────
  const recentGamesMap = new Map<string, any>();
  typedScores.forEach(score => {
    if (score.games && !recentGamesMap.has(score.games.id)) {
      recentGamesMap.set(score.games.id, {
        id: score.games.id,
        title: score.games.title,
        slug: score.games.slug,
        image: score.games.image_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${score.games.slug}`,
        meta: new Date(score.created_at).toLocaleDateString(),
        isFavorite: (profile?.favorite_game_ids || []).includes(score.games.id),
      });
    }
  });
  const recentGamesList = Array.from(recentGamesMap.values()).slice(0, 4);

  // ── Favorite games (from profile.favorite_game_ids) ──────────────────
  const favoriteIds: string[] = profile?.favorite_game_ids || [];
  let favoriteGamesList: any[] = [];
  if (favoriteIds.length > 0) {
    const { data: favGames } = await supabase
      .from('games')
      .select('id, title, slug, image_url, category, rating')
      .in('id', favoriteIds)
      .limit(4);
    favoriteGamesList = (favGames || []).map(g => ({
      id: g.id,
      title: g.title,
      slug: g.slug,
      image: g.image_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${g.slug}`,
      rating: g.rating?.toFixed(1) || '5.0',
      isFavorite: true,
    }));
  }

  // ── Achievements ─────────────────────────────────────────────────────
  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*')
    .order('condition_value', { ascending: true });

  const { data: earnedRows } = await supabase
    .from('user_achievements')
    .select('achievement_id, earned_at')
    .eq('user_id', user.id);

  const earnedIds = new Set((earnedRows || []).map((r: any) => r.achievement_id));
  const earnedDates: Record<string, string> = {};
  (earnedRows || []).forEach((r: any) => { earnedDates[r.achievement_id] = r.earned_at; });

  const achievementsData = (allAchievements || []).map((a: any) => ({
    ...a,
    earned: earnedIds.has(a.id),
    earned_at: earnedDates[a.id] || null,
  }));

  // ── XP progress ──────────────────────────────────────────────────────
  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const xpForCurrentLevel = (level - 1) * 1000;
  const xpForNextLevel = level * 1000;
  const xpProgress = Math.min(100, Math.round(((xp - xpForCurrentLevel) / 1000) * 100));

  const profileData = {
    id: user.id,
    email: user.email || '',
    username: profile?.username || user.email?.split('@')[0] || 'Player',
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'player'}&backgroundColor=b6e3f4`,
    banner_url: profile?.banner_url || '',
    bio: profile?.bio || '',
    xp,
    level,
    xpProgress,
    xpForNextLevel,
    streak: profile?.streak ?? 0,
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0B1A] text-gray-900 dark:text-white pt-24 pb-20 relative">
      {/* Ambient glows */}
      <div className="absolute top-[10%] left-[5%] w-[40vw] h-[40vw] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[0%] w-[35vw] h-[35vw] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 xl:px-8 max-w-[1600px] flex flex-col lg:flex-row gap-8 relative z-10">

        {/* Left Sidebar */}
        <div className="hidden lg:block relative">
          <div className="sticky top-24">
            <ProfileSidebar profile={profileData} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6 w-full overflow-hidden">

          <ProfileHero
            profile={profileData}
            gamesPlayed={uniqueGamesPlayed}
            gamesThisWeek={gamesThisWeek}
            gamesPrevWeek={gamesPrevWeek}
            totalScore={totalScore}
            totalScoreThisWeek={totalScoreThisWeek}
            totalScorePrevWeek={totalScorePrevWeek}
            highestScore={highestScore}
            earnedCount={earnedIds.size}
            totalAchievements={achievementsData.length}
          />

          {/* Row: Recently Played & Favorites */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ProfileGameRow
              title="Recently Played"
              games={recentGamesList}
              viewAllLink="/profile/recent"
              favoriteIds={favoriteIds}
            />
            <ProfileGameRow
              title="Favorite Games"
              games={favoriteGamesList}
              viewAllLink="/profile/favorites"
              favoriteIds={favoriteIds}
              showToggle
            />
          </div>

          {/* Row: Achievements & Game Stats */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ProfileAchievements achievements={achievementsData} />
            <ProfileStats categoryStats={categoryStats} />
          </div>

          {/* Row: Activity Feed & Collections */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ProfileActivity scores={typedScores} earnedAchievements={achievementsData.filter((a: any) => a.earned)} />
            <ProfileCollections favoriteCount={favoriteIds.length} />
          </div>

        </div>
      </div>
    </div>
  );
}
