export const runtime = 'edge';
import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Heart, Gamepad2 } from 'lucide-react';
import ProfileGameRow from '@/components/profile/ProfileGameRow';

export const metadata = {
  title: 'Favorite Games | My Profile | Spielcade',
  description: 'View your favorite games.',
};

export const revalidate = 0;

export default async function FavoriteGamesPage() {
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

  const favoriteIds: string[] = profile?.favorite_game_ids || [];
  let favoriteGamesList: any[] = [];

  if (favoriteIds.length > 0) {
    const { data: favGames } = await supabase
      .from('games')
      .select('id, title, slug, image_url, category, rating')
      .in('id', favoriteIds);

    favoriteGamesList = (favGames || []).map(g => ({
      id: g.id,
      title: g.title,
      slug: g.slug,
      image: g.image_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${g.slug}`,
      rating: g.rating?.toFixed(1) || '5.0',
      isFavorite: true,
    }));
  }

  return (
    <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm min-h-[500px]">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200 dark:border-white/5">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
          <Heart size={20} className="fill-current" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Favorite Games</h1>
          <p className="text-sm text-gray-500">Your collection of top games</p>
        </div>
      </div>

      {/* Grid */}
      {favoriteGamesList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
          <Heart size={48} className="text-gray-300 dark:text-gray-700 mb-2" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No favorite games yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mb-4">When you find a game you love, click the heart icon to add it here!</p>
          <Link href="/games" className="px-5 py-2.5 bg-[#6366F1] text-white text-sm font-bold rounded-xl hover:bg-[#5457DF] transition-colors">
            Browse Games
          </Link>
        </div>
      ) : (
        <ProfileGameRow 
          title="" 
          games={favoriteGamesList} 
          viewAllLink="" 
          favoriteIds={favoriteIds} 
          showToggle 
        />
      )}

    </div>
  );
}
