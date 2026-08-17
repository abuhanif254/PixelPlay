import { Metadata } from 'next';
import PopularGamesClient from './PopularGamesClient';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Popular Games - Play Free Online on Spielcade',
  description: 'Play the most loved games by our community. Top picks, high ratings, and non-stop fun!',
};

export default async function PopularGamesPage() {
  const supabase = createClient();
  
  // Fetch up to 200 most popular active games
  const { data: games } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'active')
    .order('total_plays', { ascending: false })
    .limit(200);

  const initialGames = games?.map(game => ({
    id: game.id,
    title: game.title,
    slug: game.slug,
    description: game.description,
    category: game.category,
    image: game.image_url,
    totalPlays: game.total_plays,
    rating: game.rating,
    created_at: game.created_at
  })) || [];

  return (
    <div className="min-h-screen bg-[#05050F] text-white pt-20 pb-12 font-sans">
      <PopularGamesClient initialGames={initialGames} />
    </div>
  );
}
