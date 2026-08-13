import React from 'react';
import { Metadata } from 'next';
import CategoryHero from '@/components/category/CategoryHero';
import CategorySidebar from '@/components/category/CategorySidebar';
import CategoryGameGrid from '@/components/category/CategoryGameGrid';
import CategoryInfoBanner from '@/components/category/CategoryInfoBanner';
import CategoryFAQ from '@/components/category/CategoryFAQ';
import CategoryCollections from '@/components/category/CategoryCollections';

export const metadata: Metadata = {
  title: 'Puzzle Games | PixelPlay',
  description: 'Challenge your mind with our collection of the best puzzle games.',
};

export default function CategoryPage({ params }: { params: { slug: string } }) {
  // In a real app, you would fetch category data using the slug
  // const categoryData = await fetchCategory(params.slug);
  
  return (
    <div className="min-h-screen bg-[#05050F] text-white pt-20 pb-20">
      
      {/* Hero Section */}
      <CategoryHero />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1400px]">
        
        {/* 12 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          
          {/* Left Sidebar (3 cols) */}
          <div className="hidden lg:block lg:col-span-3 relative">
            <div className="sticky top-24">
              <CategorySidebar />
            </div>
          </div>

          {/* Main Content (9 cols) */}
          <div className="col-span-1 lg:col-span-9 flex flex-col">
            <CategoryGameGrid />
            <CategoryInfoBanner />
            
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
