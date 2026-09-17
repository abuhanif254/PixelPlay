import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LocalGameWrapper from '@/components/LocalGameWrapper';
import { gamesRegistry } from '@spielcade/games/registry';
import { GAME_IFRAME_SANDBOX, GAME_IFRAME_PERMISSIONS } from '@/lib/constants';

export const runtime = 'edge';

interface EmbedPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: EmbedPageProps): Promise<Metadata> {
  const { slug } = params;
  const localGame = gamesRegistry[slug];
  const title = localGame?.config?.title || slug;
  return {
    title: `${title} - Embed Player | Spielcade`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function EmbedGamePage({ params }: EmbedPageProps) {
  const { slug } = params;
  const isLocalGame = slug === 'snake' || slug === '2048' || slug === 'flappy-bird' || !!gamesRegistry[slug];

  if (isLocalGame) {
    return (
      <div className="fixed inset-0 z-[999] bg-black w-screen h-screen overflow-hidden flex items-center justify-center p-0 m-0">
        <div className="w-full h-full relative flex items-center justify-center">
          <LocalGameWrapper slug={slug} />
        </div>
      </div>
    );
  }

  // Database lookup for HTML5 source_url
  const supabase = createClient();
  const { data: game } = await supabase
    .from('games')
    .select('id, title, source_url')
    .eq('slug', slug)
    .maybeSingle();

  if (!game || !game.source_url) {
    return (
      <div className="fixed inset-0 z-[999] bg-[#070818] text-white flex flex-col items-center justify-center p-4 text-center">
        <div className="text-4xl mb-3">🕹️</div>
        <h1 className="text-xl font-bold font-outfit">Game Not Available in Standalone Embed</h1>
        <p className="text-xs text-gray-400 mt-1 max-w-sm">
          This game cannot be loaded directly or has moved.
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[999] bg-black w-screen h-screen overflow-hidden p-0 m-0">
      <iframe
        src={game.source_url}
        className="w-full h-full border-0"
        allow={GAME_IFRAME_PERMISSIONS}
        sandbox={GAME_IFRAME_SANDBOX}
        title={game.title}
      />
    </div>
  );
}
