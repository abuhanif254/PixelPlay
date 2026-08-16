import React from 'react';
import { Metadata } from 'next';
import BlogHero from '@/components/blog/BlogHero';
import FeaturedArticles from '@/components/blog/FeaturedArticles';
import LatestArticles from '@/components/blog/LatestArticles';
import BlogSidebar from '@/components/blog/BlogSidebar';

export const metadata: Metadata = {
  title: 'Blog & Guides | Spielcade Games',
  description: 'Tips, guides, news and strategies to level up your gaming experience on Spielcade.',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05050F] text-gray-900 dark:text-white transition-colors">
      
      {/* Top Hero Section */}
      <div className="pt-20">
        <BlogHero />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1400px] pt-12 pb-20">

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
