import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Gamepad2, Star, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

interface GameEmbedProps {
  id: string; // The game slug
}

export default async function GameEmbed({ id }: GameEmbedProps) {
  const supabase = createClient();
  const { data: game } = await supabase
    .from('games')
    .select('*')
    .eq('slug', id)
    .single();

  if (!game) return null;

  return (
    <div className="my-8 relative overflow-hidden rounded-2xl bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 shadow-lg group flex flex-col sm:flex-row">
      <div className="w-full sm:w-1/3 aspect-[4/3] relative overflow-hidden shrink-0">
        <Image 
          src={game.thumbnail_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80'}
          alt={game.title}
          fill
          sizes="(max-width: 640px) 100vw, 300px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Play Overlay */}
        <Link href={`/games/${game.slug}`} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-[#6366F1] text-white flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-[0_0_20px_rgba(99,102,241,0.5)]">
            <Gamepad2 size={24} className="ml-1" />
          </div>
        </Link>
      </div>

      <div className="p-6 flex flex-col justify-center flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white m-0 p-0 leading-none group-hover:text-[#6366F1] transition-colors">
            {game.title}
          </h3>
          <span className="px-2 py-0.5 bg-[#10B981]/20 text-[#10B981] text-[10px] font-bold uppercase rounded tracking-wider">
            Play Free
          </span>
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 mt-2 leading-relaxed">
          {game.short_description}
        </p>

        <div className="flex items-center gap-4 text-xs font-bold mt-auto">
          <div className="flex items-center gap-1 text-[#F59E0B]">
            <Star size={14} className="fill-current" />
            <span>{(game.rating || 4.5).toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Users size={14} />
            <span>{(game.plays_count || 1024).toLocaleString()} Plays</span>
          </div>
        </div>
      </div>
    </div>
  );
}
