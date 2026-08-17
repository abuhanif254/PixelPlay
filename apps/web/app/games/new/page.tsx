import { Metadata } from 'next';
import NewGamesClient from './NewGamesClient';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'New Games - Play Free Online on Spielcade',
  description: 'Explore the latest games added to Spielcade. Fresh, fun and exciting games every week!',
};

export default async function NewGamesPage() {
  const supabase = createClient();
  
  // Fetch up to 200 newest active games
  const { data: games } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
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
      <NewGamesClient initialGames={initialGames} />
    </div>
  );
}
