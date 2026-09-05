import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import GameCard from '@/components/GameCard';
import { ChevronRight, Tag } from 'lucide-react';

export const runtime = 'edge';
export const revalidate = 3600;

interface TagPageProps {
  params: {
    tag: string;
  };
}

function formatTag(rawTag: string): string {
  return decodeURIComponent(rawTag)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tagName = formatTag(params.tag);
  const title = `${tagName} Games — Play Free Online | Spielcade`;
  const description = `Play the best free online ${tagName} games with no downloads required. Enjoy instant browser play on desktop, mobile, and Chromebook!`;
  const canonicalUrl = `https://spielcade.com/games/tags/${params.tag}`;

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
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Spielcade',
      type: 'website',
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const rawTag = decodeURIComponent(params.tag).replace(/-/g, ' ').toLowerCase();
  const formattedTag = formatTag(params.tag);
  const supabase = createClient();

  // Search for active games matching the tag in title or category or metadata
  const { data: gamesData } = await supabase
    .from('games')
    .select('id, title, slug, image_url, category, rating, total_plays')
    .eq('status', 'active')
    .or(`title.ilike.%${rawTag}%,category.ilike.%${rawTag}%`)
    .order('total_plays', { ascending: false })
    .limit(48);

  let games = gamesData || [];

  // Fallback to top games if search yields few results
  if (games.length < 6) {
    const { data: fallbackGames } = await supabase
      .from('games')
      .select('id, title, slug, image_url, category, rating, total_plays')
      .eq('status', 'active')
      .order('total_plays', { ascending: false })
      .limit(24);

    games = fallbackGames || [];
  }

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
