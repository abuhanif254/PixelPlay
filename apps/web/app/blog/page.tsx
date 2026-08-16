export const runtime = 'edge';
export const revalidate = 60; // ISR cache for 60 seconds

import React from 'react';
import { Metadata } from 'next';
import BlogHero from '@/components/blog/BlogHero';
import FeaturedArticles from '@/components/blog/FeaturedArticles';
import LatestArticles from '@/components/blog/LatestArticles';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Blog & Guides | Spielcade Games',
  description: 'Tips, guides, news and strategies to level up your gaming experience on Spielcade.',
};

export default async function BlogPage() {
  const supabase = createClient();
  
  // Fetch all published posts
  const { data: rawPosts } = await supabase
    .from('blog_posts')
    .select(`
      id, title, slug, excerpt, cover_image, tags,
      read_time, created_at,
      profiles:author_id(username, avatar_url)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  // Map to the expected UI format
  const posts = (rawPosts || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt || '',
    cover_image: p.cover_image || '',
    tags: p.tags || [],
    read_time: p.read_time ?? 5,
    author: p.profiles?.username || 'Spielcade Team',
    author_avatar: p.profiles?.avatar_url || '',
    created_at: p.created_at,
  }));

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
            <FeaturedArticles posts={posts} />
            <LatestArticles posts={posts} />
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
