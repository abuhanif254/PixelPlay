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
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

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
    openGraph: {
      title: `${category.title} | Spielcade`,
      description: category.description,
      url: `https://spielcade.com/categories/${params.slug}`,
      siteName: 'Spielcade Games',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.title} | Spielcade`,
      description: category.description,
    },
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = categoriesData[params.slug as keyof typeof categoriesData];
  
  if (!category) {
    notFound();
  }

  const supabase = createClient();
  const dbCategoryName = category.title.replace(' Games', '');
  
  // Build query for games
  let gamesQuery = supabase
    .from('games')
    .select('id, title, slug, description, category, image_url, total_plays, rating')
    .eq('status', 'active');

  let countQuery = supabase
    .from('games')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  if (category.searchTerm !== undefined && category.searchTerm.length > 0) {
    gamesQuery = gamesQuery.or(`title.ilike.%${category.searchTerm}%,description.ilike.%${category.searchTerm}%`);
    countQuery = countQuery.or(`title.ilike.%${category.searchTerm}%,description.ilike.%${category.searchTerm}%`);
  } else if (category.searchTerm === '') {
    // Unblocked games - entire catalog
  } else {
    // Canonical root category
    gamesQuery = gamesQuery.eq('category', dbCategoryName);
    countQuery = countQuery.eq('category', dbCategoryName);
  }

  const [{ data: gamesData }, { count: totalMatchCount }] = await Promise.all([
    gamesQuery.order('total_plays', { ascending: false }).limit(100),
    countQuery
  ]);

  const games = gamesData || [];

  // Default baseline category counts for sidebar
  const categoryCounts: Record<string, number> = {
    'Action': 3250,
    'Arcade': 4120,
    'Racing': 1680,
    'Puzzle': 3450,
    'Adventure': 1340,
    'Sports': 1050,
    'Strategy': 1280,
    'Board': 520,
  };
  if (totalMatchCount && categoryCounts[dbCategoryName]) {
    categoryCounts[dbCategoryName] = totalMatchCount;
  }

  const activeCount = totalMatchCount || games.length;
  const totalPlays = games.reduce((sum, g) => sum + (g.total_plays || 10000), 0);
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
  
  // Create rich snippet collection schema
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${category.title} on Spielcade`,
    "description": category.description,
    "url": `https://spielcade.com/categories/${params.slug}`,
    "hasPart": games.map(game => ({
      "@type": "SoftwareApplication",
      "name": game.title,
      "applicationCategory": "Game",
      "operatingSystem": "Any"
    }))
  };

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      
      {/* Hero Section with Live Stats */}
      <CategoryHero category={dynamicCategory} />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1400px]">
        
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
            <CategoryGameGrid category={dynamicCategory} games={games} />
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
