export const runtime = 'edge';
import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { History, ArrowLeft, Gamepad2 } from 'lucide-react';
import ProfileGameRow from '@/components/profile/ProfileGameRow'; // We can reuse the UI component for a grid

export const metadata = {
  title: 'Recently Played | My Profile | Spielcade',
  description: 'View your recently played games.',
};

export const revalidate = 0;

export default async function RecentGamesPage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user || null;
  if (!user) redirect('/login');

  // Fetch favorite ids
  const { data: profile } = await supabase
    .from('profiles')
    .select('favorite_game_ids')
    .eq('id', user.id)
    .single();

  const favoriteIds = profile?.favorite_game_ids || [];

  // Fetch all scores
  const { data: scores } = await supabase
    .from('scores')
    .select('created_at, games(id, title, slug, image_url, category)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Map to unique recent games
  const recentGamesMap = new Map<string, any>();
  (scores || []).forEach((score: any) => {
    if (score.games && !recentGamesMap.has(score.games.id)) {
      recentGamesMap.set(score.games.id, {
        id: score.games.id,
        title: score.games.title,
        slug: score.games.slug,
        image: score.games.image_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${score.games.slug}`,
        meta: new Date(score.created_at).toLocaleDateString(),
        isFavorite: favoriteIds.includes(score.games.id),
      });
    }
  });

  const recentGamesList = Array.from(recentGamesMap.values());

  return (
    <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm min-h-[500px]">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200 dark:border-white/5">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
          <History size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Recently Played</h1>
          <p className="text-sm text-gray-500">All the games you've played recently</p>
        </div>
      </div>

      {/* Grid */}
      {recentGamesList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
          <Gamepad2 size={48} className="text-gray-300 dark:text-gray-700 mb-2" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No games played yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mb-4">Start playing some games and they will appear here in your history!</p>
          <Link href="/games" className="px-5 py-2.5 bg-[#6366F1] text-white text-sm font-bold rounded-xl hover:bg-[#5457DF] transition-colors">
            Browse Games
          </Link>
        </div>
      ) : (
        <ProfileGameRow 
          title="" 
          games={recentGamesList} 
          viewAllLink="#" 
          favoriteIds={favoriteIds} 
          showToggle 
        />
      )}

    </div>
  );
}
