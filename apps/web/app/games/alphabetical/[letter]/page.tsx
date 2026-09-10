import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import GameCard from '@/components/GameCard';
import { ChevronRight, Compass } from 'lucide-react';

export const runtime = 'edge';
export const revalidate = 3600;

interface AlphabeticalPageProps {
  params: {
    letter: string;
  };
}

const ALPHABET = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
  'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
  'u', 'v', 'w', 'x', 'y', 'z', '0-9'
];

export async function generateMetadata({ params }: AlphabeticalPageProps): Promise<Metadata> {
  const cleanLetter = (params.letter || 'a').toLowerCase();
  const displayLetter = cleanLetter === '0-9' ? '0–9 (Numbers)' : cleanLetter.toUpperCase();

  const title = `Games Starting with "${displayLetter}" — Free Online Games | Spielcade`;
  const description = `Browse and play free online browser games starting with the letter ${displayLetter}. Instant unblocked HTML5 games with zero download on PC, mobile, and Chromebook.`;
  const canonicalUrl = `https://spielcade.com/games/alphabetical/${cleanLetter}`;

  return {
    title,
    description,
    keywords: [
      `games starting with ${cleanLetter}`,
      `free online games ${cleanLetter}`,
      `unblocked games ${cleanLetter}`,
      'a-z games directory',
      'browser games',
      'free online games'
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Spielcade Games',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function AlphabeticalPage({ params }: AlphabeticalPageProps) {
  const cleanLetter = (params.letter || 'a').toLowerCase();
  const displayLetter = cleanLetter === '0-9' ? '0–9' : cleanLetter.toUpperCase();
  const supabase = createClient();

  let query = supabase
    .from('games')
    .select('id, title, slug, image_url, category, rating, total_plays')
    .eq('status', 'active');

  if (cleanLetter === '0-9') {
    query = query.or('title.ilike.0%,title.ilike.1%,title.ilike.2%,title.ilike.3%,title.ilike.4%,title.ilike.5%,title.ilike.6%,title.ilike.7%,title.ilike.8%,title.ilike.9%');
  } else {
    query = query.ilike('title', `${cleanLetter}%`);
  }

  const { data: gamesData } = await query
    .order('total_plays', { ascending: false })
    .limit(72);

  const games = gamesData || [];

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
        name: `Letter ${displayLetter}`,
        item: `https://spielcade.com/games/alphabetical/${cleanLetter}`,
      },
    ],
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Free Games Starting with Letter ${displayLetter} on Spielcade`,
    description: `Complete list of free online games starting with ${displayLetter}. Instant play in your browser.`,
    url: `https://spielcade.com/games/alphabetical/${cleanLetter}`,
    hasPart: games.slice(0, 30).map((game) => ({
      '@type': 'SoftwareApplication',
      name: game.title,
      applicationCategory: 'Game',
      operatingSystem: 'Any',
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05050F] text-gray-900 dark:text-white pt-24 pb-20 transition-colors">
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
          <span className="text-gray-600 dark:text-gray-400">Letter {displayLetter}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3 border border-indigo-200 dark:border-indigo-900/50">
            <Compass size={14} />
            <span>A–Z Directory</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold font-outfit tracking-tight text-gray-900 dark:text-white mb-3">
            Games Starting with "{displayLetter}"
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl text-sm md:text-base leading-relaxed">
            Browse our complete directory of free online games beginning with the letter <strong>{displayLetter}</strong>. All games run directly inside your web browser with zero downloads required.
          </p>
        </div>

        {/* A-Z Letter Navigation Bar */}
        <div className="mb-10 p-3 rounded-2xl bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 shadow-sm">
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {ALPHABET.map((item) => {
              const isActive = cleanLetter === item;
              return (
                <Link
                  key={item}
                  href={`/games/alphabetical/${item}`}
                  className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold uppercase transition-all ${
                    isActive
                      ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/30 scale-105'
                      : 'bg-gray-100 dark:bg-[#0A0B1A] text-gray-700 dark:text-gray-300 hover:bg-[#6366F1] hover:text-white dark:hover:bg-[#6366F1] border border-gray-200 dark:border-white/5'
                  }`}
                >
                  {item === '0-9' ? '#' : item}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Games Grid */}
        {games.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {games.map((game) => (
              <div key={game.id} className="h-full">
                <GameCard
                  title={game.title}
                  slug={game.slug}
                  imageUrl={game.image_url}
                  category={game.category}
                  rating={game.rating || 4.8}
                  plays={
                    game.total_plays >= 1000000
                      ? `${(game.total_plays / 1000000).toFixed(1)}M`
                      : `${Math.floor((game.total_plays || 10000) / 1000)}K`
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center rounded-2xl bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5">
            <h3 className="text-xl font-bold mb-2">No games found for letter {displayLetter}</h3>
            <p className="text-sm text-gray-500 mb-6">Explore other letters in our A-Z directory or visit all games.</p>
            <Link
              href="/games"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-[#6366F1] text-white font-bold text-sm hover:bg-[#5457DF] transition-colors"
            >
              Browse All Games
            </Link>
          </div>
        )}

        {/* SEO Context Footer Block */}
        <div className="mt-16 p-8 rounded-2xl bg-white dark:bg-[#0A0B1A] border border-gray-200 dark:border-white/5 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold font-outfit text-gray-900 dark:text-white mb-3">
            About Free Browser Games Starting with "{displayLetter}"
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed mb-4">
            Looking for specific browser games starting with {displayLetter}? Spielcade organizes over 17,000 HTML5 and WebGL web games into this shallow-crawl directory to ensure instant discovery for both players and search engine crawlers. Enjoy seamless, unblocked access on school Chromebooks, mobile smartphones, tablets, and desktop computers.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/categories" className="text-xs font-bold text-[#6366F1] hover:underline">
              Browse All Categories →
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/popular" className="text-xs font-bold text-[#6366F1] hover:underline">
              Top 100 Popular Games →
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/categories/unblocked-games" className="text-xs font-bold text-[#6366F1] hover:underline">
              Unblocked Games Hub →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
