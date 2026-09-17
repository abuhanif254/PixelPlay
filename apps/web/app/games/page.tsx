import Image from 'next/image';
import Link from 'next/link';
import React, { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import AllGamesClient from './AllGamesClient';
import { Metadata } from 'next';
import DynamicSEOBlock from '@/components/DynamicSEOBlock';

export const runtime = 'edge';
export const revalidate = 60;

type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
}

const VALID_CATEGORIES = ['Action', 'Adventure', 'Arcade', 'Board', 'Puzzle', 'Racing', 'Sports', 'Strategy'];

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const category = typeof searchParams.category === 'string' ? searchParams.category : 'All Games';
  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : (typeof searchParams.search === 'string' ? searchParams.search : '');
  const isCanonicalCategory = VALID_CATEGORIES.includes(category);
  const pageNum = parseInt(typeof searchParams.page === 'string' ? searchParams.page : '1', 10) || 1;

  const title = searchQuery
    ? `Search Results for "${searchQuery}" — Free Online Games | Spielcade`
    : category === 'All Games' 
      ? (pageNum > 1 ? `All Free Online Games (Page ${pageNum}) | Spielcade` : 'All Games — Play Free Online HTML5 Games | Spielcade')
      : `${category} Games${pageNum > 1 ? ` (Page ${pageNum})` : ''} — Play Free Online on Spielcade`;

  const canonicalPath = isCanonicalCategory && !searchQuery
    ? (pageNum > 1 ? `/categories/${category.toLowerCase().replace(/\s+/g, '-')}-games?page=${pageNum}` : `/categories/${category.toLowerCase().replace(/\s+/g, '-')}-games`)
    : (pageNum > 1 ? `/games?page=${pageNum}` : '/games');

  return {
    title,
    description: `Explore our collection of the best free online ${category.toLowerCase()} games. No downloads, no installs - click and play instantly!`,
    alternates: {
      canonical: `https://spielcade.com${canonicalPath}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
    },
  };
}

export default async function AllGamesPage({ searchParams }: Props) {
  try {
    const supabase = createClient();
    const activeCategory = typeof searchParams.category === 'string' ? searchParams.category : 'All Games';
    const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : (typeof searchParams.search === 'string' ? searchParams.search : '');
    const currentPage = Math.max(1, parseInt(typeof searchParams.page === 'string' ? searchParams.page : '1', 10) || 1);
    const PAGE_SIZE = 40;
    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let rawGames: any[] = [];
    let totalCount = 0;

    if (searchQuery) {
      // 1. Attempt high-speed hybrid search via search_games RPC
      const { data: rpcResults, error: rpcErr } = await supabase.rpc('search_games', {
        search_query: searchQuery,
        category_filter: activeCategory !== 'All Games' ? activeCategory : null,
        limit_val: PAGE_SIZE,
      });

      if (!rpcErr && Array.isArray(rpcResults)) {
        rawGames = rpcResults;
        totalCount = rpcResults.length;
      } else {
        let fallbackQuery = supabase
          .from('games')
          .select('id, title, slug, description, category, image_url, total_plays, rating, created_at')
          .eq('status', 'active');
        if (activeCategory !== 'All Games') {
          fallbackQuery = fallbackQuery.eq('category', activeCategory);
        }
        fallbackQuery = fallbackQuery.ilike('title', `%${searchQuery}%`).order('total_plays', { ascending: false }).range(from, to);
        const { data } = await fallbackQuery;
        rawGames = data || [];
        totalCount = rawGames.length;
      }
    } else {
      // 1. Get exact total count for active category filter
      let countQuery = supabase
        .from('games')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeCategory !== 'All Games') {
        countQuery = countQuery.eq('category', activeCategory);
      }

      const { count } = await countQuery;
      totalCount = count || 0;

      // 2. Fetch current page slice with index-friendly order
      let query = supabase
        .from('games')
        .select('id, title, slug, description, category, image_url, total_plays, rating, created_at')
        .eq('status', 'active');

      if (activeCategory !== 'All Games') {
        query = query.eq('category', activeCategory);
      }

      query = query.order('created_at', { ascending: false }).range(from, to);
      const { data } = await query;
      rawGames = data || [];
    }

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    const allGames = (rawGames || []).map(game => ({
      id: game.id,
      title: game.title,
      slug: game.slug,
      description: game.description,
      category: game.category,
      image: game.image_url,
      totalPlays: game.total_plays,
      rating: game.rating,
      created_at: game.created_at
    }));

    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": activeCategory === 'All Games' ? "All Free Online Games on Spielcade" : `${activeCategory} Games on Spielcade`,
      "description": `Play the best free online ${activeCategory.toLowerCase()} games.`,
      "url": `https://spielcade.com/games${currentPage > 1 ? `?page=${currentPage}` : ''}`,
      "hasPart": allGames.slice(0, 40).map(game => ({
        "@type": "SoftwareApplication",
        "name": game.title,
        "applicationCategory": "Game",
        "operatingSystem": "Any"
      }))
    };

    const heroSubtitle = activeCategory === 'All Games'
      ? `Explore our massive collection of ${totalCount > 0 ? `${totalCount.toLocaleString()}+` : 'thousands of'} free online games. No downloads, no installs - just click and play your favorite games instantly!`
      : `Explore ${totalCount.toLocaleString()}+ free online ${activeCategory.toLowerCase()} games. Handpicked, instant play, and 100% free with no downloads required!`;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#05050F] text-gray-900 dark:text-white pt-24 pb-12 transition-colors duration-300">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
        <div className="container mx-auto px-4 md:px-8 max-w-[1600px]">
          
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6 font-medium">
            <Link href="/" className="hover:text-[#6366F1] transition-colors">Home</Link>
            <span>&gt;</span>
            <span className="text-gray-900 dark:text-gray-200">{activeCategory}</span>
            {currentPage > 1 && (
              <>
                <span>&gt;</span>
                <span className="text-[#6366F1]">Page {currentPage}</span>
              </>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative w-full h-[220px] overflow-hidden bg-gradient-to-r from-[#111228] to-[#1D1B4B] mb-8 flex items-center shadow-2xl shadow-[#6366F1]/10">
          <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          
          <div className="container mx-auto px-4 md:px-8 max-w-[1600px] relative z-10 w-full h-full flex items-center">
            <div className="w-full md:w-1/2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-outfit font-extrabold text-white mb-2 leading-tight">
                {activeCategory}
              </h1>
              <p className="text-gray-300 text-sm md:text-base max-w-md">
                {heroSubtitle}
              </p>
            </div>
          </div>
          
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-1/2">
            <div className="relative w-full h-full">
              <Image 
                src="/images/hero-controller-3d.jpg" 
                alt="Gaming Controller" 
                fill
                className="object-cover object-left mask-image-linear-left"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1D1B4B] via-transparent to-transparent" />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-8 max-w-[1600px]">
          {/* Interactive Client Section */}
          <Suspense fallback={<div className="w-full h-96 bg-gray-100 dark:bg-white/5 animate-pulse rounded-2xl" />}>
            <AllGamesClient 
              initialGames={allGames} 
              totalCount={totalCount} 
              serverCurrentPage={currentPage}
              serverTotalPages={totalPages}
              serverCategory={activeCategory}
            />
          </Suspense>
          
          {/* Dynamic SEO Block */}
          <DynamicSEOBlock category={activeCategory} />
          
        </div>
      </div>
    );
  } catch (error: any) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Error Rendering Games Page</h1>
        <pre className="bg-black/50 p-6 rounded-xl text-white max-w-3xl overflow-auto border border-red-500/30">
          {error?.stack || error?.message || String(error)}
        </pre>
      </div>
    );
  }
}
