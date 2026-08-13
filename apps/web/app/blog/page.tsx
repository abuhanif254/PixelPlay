import React from 'react';
import { Metadata } from 'next';
import BlogHero from '@/components/blog/BlogHero';
import FeaturedArticles from '@/components/blog/FeaturedArticles';
import LatestArticles from '@/components/blog/LatestArticles';
import BlogSidebar from '@/components/blog/BlogSidebar';

export const metadata: Metadata = {
  title: 'Blog & Guides | PixelPlay Games',
  description: 'Tips, guides, news and strategies to level up your gaming experience on PixelPlay.',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#05050F] text-white pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1400px]">
        
        {/* Top Hero Section */}
        <BlogHero />

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 flex flex-col gap-12">
            <FeaturedArticles />
            <LatestArticles />
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <BlogSidebar />
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
