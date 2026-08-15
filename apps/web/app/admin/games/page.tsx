export const runtime = 'edge';
import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin';
import GamesTable from './GamesTable';

export const revalidate = 0;

export default async function AdminGamesPage() {
  await requireAdmin();
  const supabase = createClient();

  const { data: games, count } = await supabase
    .from('games')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  const mappedGames = (games || []).map((g: any) => ({
    id: g.id,
    title: g.title,
    slug: g.slug,
    description: g.description || '',
    category: g.category || 'Arcade',
    status: g.status || 'draft',
    total_plays: g.total_plays ?? 0,
    rating: g.rating ?? 5.0,
    image_url: g.image_url || '',
    source_url: g.source_url || '',
    created_at: g.created_at,
  }));

  return <GamesTable initialGames={mappedGames} totalCount={count ?? 0} />;
}
