export const runtime = 'edge';
export const revalidate = 300; // ISR cache for 5 minutes

import React from 'react';
import { Metadata } from 'next';
import BlogHero from '@/components/blog/BlogHero';
import FeaturedArticles from '@/components/blog/FeaturedArticles';
import LatestArticles from '@/components/blog/LatestArticles';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { createPublicClient } from '@/lib/supabase/server';

import { getAllBlogPosts } from '@/lib/blogData';

export const metadata: Metadata = {
  title: 'Blog & Guides — Gaming Tips, Walkthroughs & News',
  description: 'Tips, guides, news and strategies to level up your gaming experience on Spielcade.',
  alternates: {
    canonical: 'https://spielcade.com/blog',
  },
  openGraph: {
    title: 'Blog & Guides | Spielcade Games',
    description: 'Tips, guides, news and strategies to level up your gaming experience on Spielcade.',
    url: 'https://spielcade.com/blog',
    siteName: 'Spielcade',
    type: 'website',
  },
};

type BlogPageProps = {
  searchParams?: {
    tag?: string;
    category?: string;
    q?: string;
  };
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const supabase = createPublicClient();
  const q = searchParams?.q?.trim();
  const category = searchParams?.category?.trim();
  const tag = searchParams?.tag?.trim();

  let rawPosts: any[] | null = null;
  try {
    let query = supabase
      .from('blog_posts')
      .select(`
        id, title, slug, excerpt, cover_image, tags,
        read_time, created_at,
        profiles:author_id(username, avatar_url)
      `)
      .eq('status', 'published');

    if (q) {
      query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`);
    }

    if (category && category.toLowerCase() !== 'all posts') {
      query = query.or(`title.ilike.%${category}%,excerpt.ilike.%${category}%`);
    }

    if (tag) {
      query = query.or(`title.ilike.%${tag}%,excerpt.ilike.%${tag}%`);
    }

    const res = await query.order('created_at', { ascending: false });
    rawPosts = res.data;
  } catch {
    rawPosts = [];
  }

  // Map to the expected UI format
  let posts = (rawPosts || []).map((p: any) => ({
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

  // Fallback to curated articles if DB query returned no posts (including for ?category= or ?tag= filters)
  if (posts.length === 0) {
    const fallbackList = getAllBlogPosts().map((p, idx) => ({
      id: `fallback-${idx}`,
      title: p.title,
      slug: p.slug,
      excerpt: p.description,
      cover_image: p.coverImage,
      tags: p.keywords,
      categoryName: (p as any).category || '',
      read_time: 5,
      author: p.author.name,
      author_avatar: p.author.avatar || '',
      created_at: p.date,
    }));

    const filterTerm = (q || category || tag || '').toLowerCase();
    if (filterTerm && filterTerm !== 'all posts') {
      const filtered = fallbackList.filter(
        (p) =>
          p.title.toLowerCase().includes(filterTerm) ||
          p.excerpt.toLowerCase().includes(filterTerm) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(filterTerm)) ||
          p.tags.some((t) => t.toLowerCase().includes(filterTerm))
      );
      posts = filtered.length > 0 ? filtered : fallbackList;
    } else {
      posts = fallbackList;
    }
  }

  // SEO JSON-LD Schema
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Blog & Guides | Spielcade Games",
    "description": "Tips, guides, news and strategies to level up your gaming experience on Spielcade.",
    "url": "https://spielcade.com/blog",
    "blogPost": posts.slice(0, 10).map((post: any) => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "datePublished": post.created_at,
      "url": `https://spielcade.com/blog/${post.slug}`,
      "author": {
        "@type": "Person",
        "name": post.author
      }
    }))
  };

  const breadcrumbSchema = {
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
        "name": "Blog",
        "item": "https://spielcade.com/blog"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05050F] text-gray-900 dark:text-white transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([blogSchema, breadcrumbSchema]) }}
      />
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
