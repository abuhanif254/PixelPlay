import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CategoryHero from '@/components/category/CategoryHero';
import CategorySidebar from '@/components/category/CategorySidebar';
import CategoryGameGrid from '@/components/category/CategoryGameGrid';
import CategoryInfoBanner from '@/components/category/CategoryInfoBanner';
import CategoryFAQ from '@/components/category/CategoryFAQ';
import CategoryCollections from '@/components/category/CategoryCollections';
import { categoriesData } from '@/lib/mockCategories';
import { createPublicClient } from '@/lib/supabase/server';
import { getCachedCategoryCounts } from '@/lib/catalog-cache';

export const runtime = 'edge';
export const revalidate = 600; // 10-minute Edge CDN ISR caching

// Dynamic metadata generation based on slug
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = categoriesData[params.slug as keyof typeof categoriesData];
  if (!category) return { title: 'Category Not Found | Spielcade' };
  
  return {
    title: `${category.title} | Spielcade`,
    description: category.description,
    keywords: [`${category.title} games`, 'free browser games', 'play online', 'spielcade', category.title.toLowerCase()],
    alternates: {
      canonical: `https://spielcade.com/categories/${params.slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: `${category.title} | Spielcade`,
      description: category.description,
      url: `https://spielcade.com/categories/${params.slug}`,
      siteName: 'Spielcade Games',
      type: 'website',
      images: [
        {
          url: 'https://spielcade.com/og-default.jpg',
          width: 1200,
          height: 630,
          alt: `${category.title} on Spielcade`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.title} | Spielcade`,
      description: category.description,
      images: ['https://spielcade.com/og-default.jpg'],
    },
  };
}

interface CachedCategorySlugEntry {
  games: any[];
  cachedAt: number;
}

const gCatSlugCache = globalThis as unknown as { __spielcade_cat_slug_cache?: Map<string, CachedCategorySlugEntry> };
if (!gCatSlugCache.__spielcade_cat_slug_cache) {
  gCatSlugCache.__spielcade_cat_slug_cache = new Map();
}

const CAT_SLUG_TTL_MS = 900_000; // 15 minutes

async function getCachedCategorySlugGames(slug: string, dbCategoryName: string, searchTerm?: string): Promise<any[]> {
  const memCache = gCatSlugCache.__spielcade_cat_slug_cache!;
  const cached = memCache.get(slug);
  if (cached && Date.now() - cached.cachedAt < CAT_SLUG_TTL_MS) {
    return cached.games;
  }

  let games: any[] = [];
  try {
    const supabase = createPublicClient();
    let gamesQuery = supabase
      .from('games')
      .select('id, title, slug, description, category, image_url, total_plays, rating')
      .eq('status', 'active');

    if (searchTerm !== undefined && searchTerm.length > 0) {
      gamesQuery = gamesQuery.ilike('title', `%${searchTerm}%`);
    } else if (searchTerm === '') {
      // Unblocked / Chromebook / School games - top catalog hits
    } else {
      // Canonical root category
      gamesQuery = gamesQuery.eq('category', dbCategoryName);
    }

    const { data: gamesData } = await gamesQuery
      .order('total_plays', { ascending: false })
      .limit(100);

    games = gamesData || [];
  } catch (err) {
    console.error('[CategoryPage] Error fetching category games:', slug, err);
  }

  if (memCache.size >= 100) {
    const oldestKey = memCache.keys().next().value;
    if (oldestKey) memCache.delete(oldestKey);
  }
  memCache.set(slug, { games, cachedAt: Date.now() });

  return games;
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = categoriesData[params.slug as keyof typeof categoriesData];
  
  if (!category) {
    notFound();
  }

  const dbCategoryName = category.title.replace(' Games', '');

  const [games, categoryCounts] = await Promise.all([
    getCachedCategorySlugGames(params.slug, dbCategoryName, category.searchTerm),
    getCachedCategoryCounts(),
  ]);

  const activeCount = categoryCounts[dbCategoryName] || games.length;

  const totalPlays = games.reduce((sum, g) => sum + (g.total_plays ?? 0), 0);
  const formattedPlays = totalPlays >= 1000000 
    ? `${(totalPlays / 1000000).toFixed(1)}M+`
    : `${Math.floor(totalPlays / 1000)}K+`;

  const dynamicCategory = {
    ...category,
    stats: {
      games: `${activeCount}+`,
      plays: formattedPlays,
      rating: '4.8'
    }
  };
  
  // Create Google ItemList Carousel and CollectionPage schema
  const richSchemas = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `https://spielcade.com/categories/${params.slug}#collection`,
        "name": `${category.title} on Spielcade`,
        "description": category.description,
        "url": `https://spielcade.com/categories/${params.slug}`,
        "hasPart": games.slice(0, 30).map(game => ({
          "@type": "SoftwareApplication",
          "name": game.title,
          "applicationCategory": "Game",
          "operatingSystem": "Any"
        }))
      },
      {
        "@type": "ItemList",
        "@id": `https://spielcade.com/categories/${params.slug}#itemlist`,
        "name": `Best ${category.title}`,
        "description": category.description,
        "url": `https://spielcade.com/categories/${params.slug}`,
        "numberOfItems": games.length,
        "itemListElement": games.slice(0, 30).map((game, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "url": `https://spielcade.com/games/${game.slug}`,
          "name": game.title,
          "image": game.image_url || 'https://spielcade.com/og-default.jpg'
        }))
      }
    ]
  };

  // Compute related categories for semantic internal link mesh
  const allEntries = Object.entries(categoriesData);
  const relatedCategories = allEntries
    .filter(([s, c]) => {
      if (s === params.slug) return false;
      if (category.parentCategory && c.parentCategory === category.parentCategory) return true;
      if (c.parentCategory === dbCategoryName) return true;
      return false;
    })
    .slice(0, 8)
    .map(([_, c]) => ({
      slug: c.slug,
      title: c.title,
      icon: c.icon,
      color: c.color,
    }));

  // Fallback to primary genres if fewer than 4 related items exist
  if (relatedCategories.length < 4) {
    const canonicalFallback = ['action-games', 'arcade-games', 'puzzle-games', 'racing-games', 'adventure-games', 'sports-games']
      .filter(s => s !== params.slug && !relatedCategories.some(r => r.slug === s))
      .slice(0, 6 - relatedCategories.length)
      .map(s => {
        const cat = categoriesData[s as keyof typeof categoriesData];
        return {
          slug: cat.slug,
          title: cat.title,
          icon: cat.icon,
          color: cat.color,
        };
      });
    relatedCategories.push(...canonicalFallback);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05050F] text-gray-900 dark:text-white pt-20 pb-20 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://spielcade.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Categories",
                "item": "https://spielcade.com/categories"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": category.title,
                "item": `https://spielcade.com/categories/${params.slug}`
              }
            ]
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(richSchemas) }}
      />
      
      {/* Hero Section with Live Stats & Semantic Internal Links */}
      <CategoryHero category={dynamicCategory} relatedCategories={relatedCategories} />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1400px] pb-24 md:pb-12">
        
        {/* 12 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          
          {/* Left Sidebar (3 cols) */}
          <div className="hidden lg:block lg:col-span-3 relative">
            <div className="sticky top-24">
              <CategorySidebar currentSlug={params.slug} categoryCounts={categoryCounts} />
            </div>
          </div>

          {/* Main Content (9 cols) */}
          <div className="col-span-1 lg:col-span-9 flex flex-col">
            <CategoryGameGrid 
              category={dynamicCategory} 
              games={games} 
              currentSlug={params.slug} 
              categoryCounts={categoryCounts} 
            />
            <CategoryInfoBanner category={dynamicCategory} />
            
            {/* Bottom Section Layout (FAQ left, Collections right/below) */}
            <div className="flex flex-col xl:flex-row gap-8">
              <div className="xl:w-1/2">
                <CategoryFAQ category={dynamicCategory} />
              </div>
              <div className="xl:w-1/2">
                <CategoryCollections currentSlug={params.slug} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
