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

export const runtime = 'edge';

// Dynamic metadata generation based on slug
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = categoriesData[params.slug as keyof typeof categoriesData];
  if (!category) return { title: 'Category Not Found | PixelPlay' };
  
  return {
    title: `${category.title} | PixelPlay`,
    description: category.description,
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = categoriesData[params.slug as keyof typeof categoriesData];
  
  if (!category) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-[#05050F] text-white pt-20 pb-20">
      
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
            <CategoryGameGrid category={category} />
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
