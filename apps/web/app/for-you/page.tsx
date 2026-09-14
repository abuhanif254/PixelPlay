import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import ForYouFeed from '@/components/ForYouFeed';

export const runtime = 'edge';
export const revalidate = 120;

export default async function ForYouPage() {
  const supabase = createClient();

  const { data: games } = await supabase
    .from('games')
    .select('id, title, slug, image_url, category, rating, total_plays, description')
    .eq('status', 'active')
    .order('total_plays', { ascending: false })
    .limit(80);

  const activeGames = games || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080918] text-slate-900 dark:text-white pt-20 pb-24 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-indigo-500 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-indigo-500 font-bold">For You</span>
        </div>

        {/* Feed Component */}
        <ForYouFeed initialGames={activeGames} />
      </div>
    </div>
  );
}
