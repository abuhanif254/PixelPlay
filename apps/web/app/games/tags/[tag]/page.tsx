import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { createPublicClient } from '@/lib/supabase/server';
import { getCachedCatalogData } from '@/lib/catalog-cache';
import GameCard from '@/components/GameCard';
import { ChevronRight, Tag } from 'lucide-react';

export const runtime = 'edge';
export const revalidate = 3600;

interface TagPageProps {
  params: {
    tag: string;
  };
}

interface CachedTagEntry {
  games: any[];
  matchedGameSlug: string | null;
  matchedCategoryHref: string | null;
  cleanTagSlug: string;
  cachedAt: number;
}

const gTagCache = globalThis as unknown as { __spielcade_tag_cache?: Map<string, CachedTagEntry> };
if (!gTagCache.__spielcade_tag_cache) {
  gTagCache.__spielcade_tag_cache = new Map();
}

const TAG_CACHE_TTL_MS = 1800_000; // 30 minutes
const MAX_TAG_CACHE_ENTRIES = 300;

const TAG_TO_CATEGORY_HUB: Record<string, string> = {
  action: '/categories/action-games',
  adventure: '/categories/adventure-games',
  arcade: '/categories/arcade-games',
  board: '/categories/board-games',
  puzzle: '/categories/puzzle-games',
  racing: '/categories/racing-games',
  sports: '/categories/sports-games',
  strategy: '/categories/strategy-games',
  car: '/categories/car-games',
  drift: '/categories/drift-games',
  moto: '/categories/moto-games',
  bike: '/categories/moto-games',
  zombie: '/categories/zombie-games',
  zombies: '/categories/zombie-games',
  stickman: '/categories/stickman-games',
  '2 player': '/categories/2-player-games',
  multiplayer: '/categories/multiplayer-games',
  escape: '/categories/escape-games',
  shooting: '/categories/shooting-games',
  shooter: '/categories/shooting-games',
  sniper: '/categories/sniper-games',
  fps: '/categories/fps-games',
  'dress up': '/categories/dress-up-games',
  cooking: '/categories/cooking-games',
  football: '/categories/football-games',
  soccer: '/categories/football-games',
  basketball: '/categories/basketball-games',
  tennis: '/categories/tennis-games',
  pool: '/categories/pool-games',
  billiards: '/categories/pool-games',
  bowling: '/categories/bowling-games',
  golf: '/categories/golf-games',
  boxing: '/categories/boxing-games',
  cricket: '/categories/cricket-games',
  clicker: '/categories/clicker-games',
  idle: '/categories/clicker-games',
  runner: '/categories/runner-games',
  parkour: '/categories/parkour-games',
  ninja: '/categories/ninja-games',
  chess: '/categories/chess-games',
  mahjong: '/categories/mahjong-games',
  solitaire: '/categories/solitaire-games',
  brain: '/categories/brain-games',
  horror: '/categories/horror-games',
  tank: '/categories/tank-games',
  tanks: '/categories/tank-games',
  war: '/categories/war-games',
  defense: '/categories/tower-defense-games',
  'tower defense': '/categories/tower-defense-games',
  match: '/categories/match-3-games',
  bubble: '/categories/bubble-shooter-games',
  jigsaw: '/categories/jigsaw-puzzle-games',
  word: '/categories/word-games',
  io: '/categories/io-games',
  physics: '/categories/physics-games',
  casual: '/categories/casual-games',
  retro: '/categories/retro-arcade-games',
  unblocked: '/categories/unblocked-games',
  chromebook: '/categories/chromebook-games',
};

function tagHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function safeDecodeTag(rawTag: string): string {
  try {
    return decodeURIComponent(rawTag || '');
  } catch {
    return rawTag || '';
  }
}

function cleanTagWords(rawTag: string): string {
  const decoded = safeDecodeTag(rawTag)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u200B-\u200F\uFEFF]/g, '')
    .replace(/&amp;/gi, ' ')
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Strip synthetic prefixes/suffixes so e.g. "free-stickman-sniper-3d" or "maze-speed-for-chromebook" finds matching games
  const cleaned = decoded
    .replace(/^(free|play)\s+/i, '')
    .replace(/\s+(for chromebook|unblocked|online|free|games|game)$/i, '')
    .replace(/\s+(for chromebook|unblocked|online|free|games|game)$/i, '')
    .trim();

  return cleaned || decoded || 'arcade';
}

function formatTag(rawTag: string): string {
  const cleaned = safeDecodeTag(rawTag)
    .replace(/[\u200B-\u200F\uFEFF]/g, '')
    .replace(/&amp;/gi, '&')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return 'Arcade';
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

async function getCachedTagData(rawTagParam: string): Promise<CachedTagEntry> {
  const searchPhrase = cleanTagWords(rawTagParam);
  const cleanTagSlug = searchPhrase.replace(/\s+/g, '-');
  const memCache = gTagCache.__spielcade_tag_cache!;
  const cached = memCache.get(searchPhrase);
  if (cached && Date.now() - cached.cachedAt < TAG_CACHE_TTL_MS) {
    return cached;
  }

  let games: any[] = [];
  let matchedGameSlug: string | null = null;
  const matchedCategoryHref: string | null = TAG_TO_CATEGORY_HUB[searchPhrase] || null;

  try {
    const supabase = createPublicClient();

    // 1. Check if this tag is actually a specific game's slug (e.g. /games/tags/tanks-1944 or /games/tags/coastal-defense-unblocked)
    const slugCandidates = [cleanTagSlug, `${cleanTagSlug}-game`];
    const { data: exactGame } = await supabase
      .from('games')
      .select('id, title, slug, image_url, category, rating, total_plays')
      .eq('status', 'active')
      .in('slug', slugCandidates)
      .limit(1);

    if (exactGame && exactGame.length > 0) {
      matchedGameSlug = exactGame[0].slug;
      games.push(exactGame[0]);
    }

    if (searchPhrase.length >= 2) {
      const { data: gamesData } = await supabase
        .from('games')
        .select('id, title, slug, image_url, category, rating, total_plays')
        .eq('status', 'active')
        .or(`title.ilike.%${searchPhrase}%,category.ilike.%${searchPhrase}%`)
        .order('total_plays', { ascending: false })
        .limit(36);

      if (gamesData && gamesData.length > 0) {
        const seen = new Set(games.map((g) => g.slug));
        for (const g of gamesData) {
          if (g.slug && !seen.has(g.slug)) {
            seen.add(g.slug);
            games.push(g);
          }
        }
        // If only 1 game matched the multi-word phrase, this tag is a per-game tag for that game
        if (!matchedGameSlug && gamesData.length <= 2 && searchPhrase.split(' ').length >= 2) {
          matchedGameSlug = gamesData[0].slug;
        }
      }
    }

    // If full phrase yielded < 6 matches and has multiple words, query by primary significant token
    if (games.length < 6) {
      const stopWords = new Set(['the', 'and', 'for', 'in', 'of', 'to', 'vs', 'with', '3d', '2d', 'io']);
      const tokens = searchPhrase
        .split(' ')
        .filter((w) => w.length >= 3 && !stopWords.has(w));

      if (tokens.length > 0) {
        const primaryToken = tokens[0];
        const { data: tokenMatches } = await supabase
          .from('games')
          .select('id, title, slug, image_url, category, rating, total_plays')
          .eq('status', 'active')
          .ilike('title', `%${primaryToken}%`)
          .order('total_plays', { ascending: false })
          .limit(36);

        if (tokenMatches && tokenMatches.length > 0) {
          const seen = new Set(games.map((g) => g.slug));
          for (const g of tokenMatches) {
            if (g.slug && !seen.has(g.slug)) {
              seen.add(g.slug);
              games.push(g);
            }
            if (games.length >= 36) break;
          }
        }
      }
    }
  } catch (err) {
    console.error('[TagPage] Error fetching tag games:', err);
  }

  // Fast in-memory fallback from warm catalog cache with deterministic hash offset so tag pages never share identical game grids
  if (games.length < 12) {
    try {
      const catalog = await getCachedCatalogData();
      const pool = [...(catalog.trending || []), ...(catalog.topRated || []), ...(catalog.newGames || [])];
      if (pool.length > 0) {
        const seen = new Set(games.map((g) => g.slug));
        const offset = tagHash(searchPhrase) % pool.length;
        for (let i = 0; i < pool.length; i++) {
          const g = pool[(offset + i) % pool.length];
          if (g && g.slug && !seen.has(g.slug)) {
            seen.add(g.slug);
            games.push({
              id: g.id,
              title: g.title,
              slug: g.slug,
              image_url: g.image_url || g.image || '',
              category: g.category,
              rating: g.rating || 4.8,
              total_plays: g.total_plays ?? 15000,
            });
          }
          if (games.length >= 24) break;
        }
      }
    } catch {
      // Ignore fallback errors
    }
  }

  const entry: CachedTagEntry = {
    games,
    matchedGameSlug,
    matchedCategoryHref,
    cleanTagSlug,
    cachedAt: Date.now(),
  };

  if (memCache.size >= MAX_TAG_CACHE_ENTRIES) {
    const oldestKey = memCache.keys().next().value;
    if (oldestKey) memCache.delete(oldestKey);
  }
  memCache.set(searchPhrase, entry);

  return entry;
}

const BLOCKLISTED_TAGS = new Set([
  'adult',
  'nsfw',
  'porn',
  'sex',
  'xxx',
  'casino',
  'gambling',
  'instant-play',
  'super',
]);

const HIGH_INTENT_TAGS = new Set([
  '2048',
  'checkers',
  'ludo',
  'dominoes',
  'monster-truck',
  'parking',
  'archery',
  'aircraft',
  'pixel',
  'merge',
  'obby',
  'skibidi',
  'brawl-stars',
  'fnf',
  'squid-game',
  'minecraft',
  'stickman-archery',
  'penalty',
  'pinball',
  'water-slide',
]);

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tagName = formatTag(params.tag);
  const tagData = await getCachedTagData(params.tag);

  if (BLOCKLISTED_TAGS.has(tagData.cleanTagSlug)) {
    notFound();
  }

  if (tagData.matchedCategoryHref) {
    permanentRedirect(tagData.matchedCategoryHref);
  }

  if (tagData.matchedGameSlug) {
    permanentRedirect(`/games/${tagData.matchedGameSlug}`);
  }

  const isHighIntent = HIGH_INTENT_TAGS.has(tagData.cleanTagSlug);
  const canonicalUrl = `https://spielcade.com/games/tags/${tagData.cleanTagSlug}`;
  const title = `${tagName} Games — Play Free Online | Spielcade`;
  const description = `Play the best free online ${tagName} games with no downloads required. Enjoy instant browser play on desktop, mobile, and Chromebook!`;

  return {
    title,
    description,
    keywords: [
      `${tagName.toLowerCase()} games`,
      `free ${tagName.toLowerCase()} games`,
      `${tagName.toLowerCase()} online`,
      'browser games',
      'free online games',
      'unblocked games',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: isHighIntent,
      follow: true,
      googleBot: {
        index: isHighIntent,
        follow: true,
        'max-image-preview': 'large',
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Spielcade',
      type: 'website',
      images: [
        {
          url: 'https://spielcade.com/og-default.jpg',
          width: 1200,
          height: 630,
          alt: `${tagName} Games on Spielcade`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://spielcade.com/og-default.jpg'],
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const formattedTag = formatTag(params.tag);
  const tagData = await getCachedTagData(params.tag);

  if (BLOCKLISTED_TAGS.has(tagData.cleanTagSlug)) {
    notFound();
  }

  if (tagData.matchedCategoryHref) {
    permanentRedirect(tagData.matchedCategoryHref);
  }

  if (tagData.matchedGameSlug) {
    permanentRedirect(`/games/${tagData.matchedGameSlug}`);
  }

  const { games } = tagData;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://spielcade.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Games',
        item: 'https://spielcade.com/games',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${formattedTag} Games`,
        item: `https://spielcade.com/games/tags/${params.tag}`,
      },
    ],
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${formattedTag} Games on Spielcade`,
    description: `Play free online ${formattedTag} games instantly in your web browser.`,
    url: `https://spielcade.com/games/tags/${params.tag}`,
    hasPart: games.map((game) => ({
      '@type': 'SoftwareApplication',
      name: game.title,
      applicationCategory: 'Game',
      operatingSystem: 'Any',
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05050F] text-gray-900 dark:text-white pt-24 pb-16 transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <div className="container mx-auto px-4 md:px-8 max-w-[1400px]">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#6366F1] font-bold mb-6">
          <Link href="/" className="hover:underline">Home</Link>
          <ChevronRight size={14} className="text-gray-400 dark:text-gray-500" />
          <Link href="/games" className="hover:underline">Games</Link>
          <ChevronRight size={14} className="text-gray-400 dark:text-gray-500" />
          <span className="text-gray-600 dark:text-gray-400">#{formattedTag}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3 border border-indigo-200 dark:border-indigo-900/50">
            <Tag size={14} />
            <span>Tag Hub</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold font-outfit tracking-tight text-gray-900 dark:text-white mb-3">
            {formattedTag} Games
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-sm md:text-base leading-relaxed">
            Discover and play the best free online {formattedTag.toLowerCase()} games. All titles run directly in your browser with no downloads, installs, or logins required.
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {games.map((game) => (
            <div key={game.id} className="h-full">
              <GameCard
                title={game.title}
                slug={game.slug}
                imageUrl={game.image_url}
                category={game.category}
                rating={game.rating || 4.7}
                plays={
                  game.total_plays >= 1000000
                    ? `${(game.total_plays / 1000000).toFixed(1)}M`
                    : `${Math.floor((game.total_plays || 10000) / 1000)}K`
                }
              />
            </div>
          ))}
        </div>

        {/* SEO Information Box */}
        <div className="mt-16 p-8 rounded-2xl bg-white dark:bg-[#0A0B1A] border border-gray-200 dark:border-white/5 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold font-outfit text-gray-900 dark:text-white mb-3">
            About Free Online {formattedTag} Games
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed mb-4">
            Welcome to the dedicated {formattedTag} gaming hub on Spielcade! Whether you are playing on a mobile phone, tablet, desktop computer, or school Chromebook, our HTML5 web games are lightweight, responsive, and 100% free to enjoy.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/categories" className="text-xs font-bold text-[#6366F1] hover:underline">
              Browse All Categories →
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/popular" className="text-xs font-bold text-[#6366F1] hover:underline">
              View Popular Games →
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/leaderboard" className="text-xs font-bold text-[#6366F1] hover:underline">
              Global Leaderboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
