import React from 'react';
import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import CategoryHero from '@/components/category/CategoryHero';
import CategorySidebar from '@/components/category/CategorySidebar';
import CategoryGameGrid from '@/components/category/CategoryGameGrid';
import CategoryInfoBanner from '@/components/category/CategoryInfoBanner';
import CategoryFAQ from '@/components/category/CategoryFAQ';
import CategoryCollections from '@/components/category/CategoryCollections';
import { categoriesData } from '@/lib/mockCategories';
import { createPublicClient } from '@/lib/supabase/server';
import { getCachedCategoryCounts, getCachedCategoryTopGames } from '@/lib/catalog-cache';

export const runtime = 'edge';
export const revalidate = 600; // 10-minute Edge CDN ISR caching

const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  'retro-games': 'retro-arcade-games',
  'retro': 'retro-arcade-games',
  'skill-games': 'arcade-games',
  'skill': 'arcade-games',
  'classic-games': 'arcade-games',
  'classic': 'arcade-games',
  'endless-games': 'runner-games',
  'endless': 'runner-games',
  'all': '/categories',
  'all-games': '/categories',
  'more': '/categories',
  'more-games': '/categories',
  'html5-games': '/games',
  'html5': '/games',
  'sports': 'sports-games',
  'simulation': 'simulation-games',
  'cyberpunk': 'action-games',
  'cyberpunk-games': 'action-games',
};

// Dynamic metadata generation based on slug
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const alias = CATEGORY_SLUG_ALIASES[params.slug];
  const targetSlug = alias && !alias.startsWith('/') ? alias : params.slug;
  const category = categoriesData[targetSlug as keyof typeof categoriesData] || categoriesData[params.slug as keyof typeof categoriesData];
  if (!category) {
    if (alias) {
      const canonicalTarget = alias.startsWith('/') ? `https://spielcade.com${alias}` : `https://spielcade.com/categories/${alias}`;
      return {
        title: 'Redirecting Category | Spielcade',
        alternates: { canonical: canonicalTarget },
      };
    }
    return { title: 'Category Not Found | Spielcade' };
  }
  
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

async function getCachedCategorySlugGames(
  slug: string,
  dbCategoryName: string,
  searchTerm?: string,
  parentCategory?: string
): Promise<any[]> {
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
      gamesQuery = gamesQuery.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
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

    // Ensure thematic category hubs (e.g. 3-player-games, cricket-games, fps-games) never render thin (< 36 games)
    if (games.length < 36) {
      const fallbackCat = parentCategory || dbCategoryName || 'Arcade';
      const parentGames = await getCachedCategoryTopGames(fallbackCat, 60);
      if (parentGames && parentGames.length > 0) {
        const seen = new Set(games.map((g) => g.slug));
        let hash = 0;
        for (let i = 0; i < slug.length; i++) {
          hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
        }
        const offset = Math.abs(hash) % parentGames.length;
        for (let i = 0; i < parentGames.length; i++) {
          const g = parentGames[(offset + i) % parentGames.length];
          if (g?.slug && !seen.has(g.slug)) {
            seen.add(g.slug);
            games.push(g);
          }
          if (games.length >= 48) break;
        }
      }
    }
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
  const alias = CATEGORY_SLUG_ALIASES[params.slug];
  if (alias) {
    permanentRedirect(alias.startsWith('/') ? alias : `/categories/${alias}`);
  }

  const category = categoriesData[params.slug as keyof typeof categoriesData];
  
  if (!category) {
    notFound();
  }

  const dbCategoryName = category.title.replace(' Games', '');

  const [games, categoryCounts] = await Promise.all([
    getCachedCategorySlugGames(params.slug, dbCategoryName, category.searchTerm, category.parentCategory),
    getCachedCategoryCounts(),
  ]);

  const activeCount = Math.max(categoryCounts[dbCategoryName] || 0, games.length);

  const totalPlays = games.reduce((sum, g) => sum + (g.total_plays ?? 0), 0);
  const formattedPlays = totalPlays >= 1000000 
    ? `${(totalPlays / 1000000).toFixed(1)}M+`
    : `${Math.max(10, Math.floor(totalPlays / 1000))}K+`;

  const dynamicCategory = {
    ...category,
    stats: {
      games: `${activeCount}+`,
      plays: formattedPlays,
      rating: '4.8'
    }
  };
  
  // Create Google ItemList Carousel, CollectionPage, and FAQPage schema
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
      },
      {
        "@type": "FAQPage",
        "@id": `https://spielcade.com/categories/${params.slug}#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": `What are the best free ${category.title} on Spielcade?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `${category.description} Popular playable titles in ${category.title} include ${games.slice(0, 4).map(g => g.title).join(', ') || 'top HTML5 arcade classics'}.`
            }
          },
          {
            "@type": "Question",
            "name": `Can I play ${category.title} unblocked on Chromebook and mobile?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Yes! Every game in our ${category.title} hub is built with responsive HTML5 and WebGL for instant, no-download play on Chromebooks, desktops, iPhones, and Android devices.`
            }
          }
        ]
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
