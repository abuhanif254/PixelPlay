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
  
  const { data: gamesData } = await supabase
    .from('games')
    .select('*')
    .eq('category', dbCategoryName)
    .order('total_plays', { ascending: false });

  const games = gamesData || [];
  
  // Create rich snippet collection schema
  const collectionSchema = {
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
      
      {/* Hero Section */}
      <CategoryHero category={category} />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1400px]">
        
        {/* 12 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          
          {/* Left Sidebar (3 cols) */}
          <div className="hidden lg:block lg:col-span-3 relative">
            <div className="sticky top-24">
              <CategorySidebar currentSlug={params.slug} />
            </div>
          </div>

          {/* Main Content (9 cols) */}
          <div className="col-span-1 lg:col-span-9 flex flex-col">
            <CategoryGameGrid category={category} games={games} />
            <CategoryInfoBanner category={category} />
            
            {/* Bottom Section Layout (FAQ left, Collections right/below) */}
            <div className="flex flex-col xl:flex-row gap-8">
              <div className="xl:w-1/2">
                <CategoryFAQ />
              </div>
              <div className="xl:w-1/2">
                <CategoryCollections />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
