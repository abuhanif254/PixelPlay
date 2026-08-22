export const runtime = 'edge';
export const revalidate = 60;

import React from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import ArticleHeader from '@/components/article/ArticleHeader';
import ArticleHeroImage from '@/components/article/ArticleHeroImage';
import InThisArticle from '@/components/article/InThisArticle';
import ArticleContent from '@/components/article/ArticleContent';
import ArticleCTA from '@/components/article/ArticleCTA';
import PostNavigation from '@/components/article/PostNavigation';
import CommentsSection from '@/components/article/CommentsSection';

import AuthorCard from '@/components/article/AuthorCard';
import RelatedPostsWidget from '@/components/article/RelatedPostsWidget';
import TableOfContentsWidget from '@/components/article/TableOfContentsWidget';
import NewsletterWidget from '@/components/article/NewsletterWidget';
import TagsWidget from '@/components/article/TagsWidget';

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { getComments, getLikeCount, hasUserLiked } from '../actions';

type Props = {
  params: { slug: string };
};

// Fetch post helper
async function getPostData(slug: string) {
  const supabase = createClient();
  const { data: post } = await supabase
    .from('blog_posts')
    .select(`
      id, title, slug, content, excerpt, cover_image, tags,
      read_time, created_at, status,
      profiles:author_id(username, avatar_url)
    `)
    .eq('slug', slug)
    .single();

  if (!post || post.status !== 'published') return null;

  const profiles = post.profiles as any;

  return {
    ...post,
    author: profiles?.username || 'Spielcade Team',
    author_avatar: profiles?.avatar_url || '',
  };
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await getPostData(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found | Spielcade',
    };
  }

  const defaultImage = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80';
  const coverImage = post.cover_image || defaultImage;

  return {
    title: `${post.title} | Spielcade`,
    description: post.excerpt,
    keywords: post.tags,
    alternates: {
      canonical: `https://spielcade.com/blog/${post.slug}`,
    },
    openGraph: {
      title: `${post.title} | Spielcade`,
      description: post.excerpt,
      url: `https://spielcade.com/blog/${post.slug}`,
      siteName: 'Spielcade Games',
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: 'article',
      publishedTime: post.created_at,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | Spielcade`,
      description: post.excerpt,
      images: [coverImage],
    },
  };
}

export default async function SingleArticlePage({ params }: Props) {
  const post = await getPostData(params.slug);

  if (!post) {
    notFound();
  }

  // Fetch engagement data in parallel
  const [comments, likeCount, userHasLiked] = await Promise.all([
    getComments(post.id),
    getLikeCount(post.id),
    hasUserLiked(post.id)
  ]);

  // Handle views count increment
  try {
    const supabase = createClient();
    await supabase.rpc('increment_blog_views', { post_id: post.id });
  } catch (err) {
    console.error('Failed to increment views:', err);
  }

  const coverImage = post.cover_image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05050F] text-gray-900 dark:text-white pt-24 pb-20 transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": post.title,
              "image": [coverImage],
              "datePublished": post.created_at,
              "dateModified": post.created_at,
              "author": [{
                  "@type": "Person",
                  "name": post.author
              }]
            },
            {
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
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": post.title,
                  "item": `https://spielcade.com/blog/${post.slug}`
                }
              ]
            }
          ])
        }}
      />
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1200px]">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 flex flex-col">
            <ArticleHeader post={post} likeCount={likeCount} hasLiked={userHasLiked} />
            <ArticleHeroImage post={post} />
            {/* Hiding InThisArticle for now since ToC usually relies on parsing markdown */}
            {/* <InThisArticle /> */}
            <ArticleContent content={post.content} />
            <ArticleCTA />
            {/* <PostNavigation /> */}
            <CommentsSection postId={post.id} comments={comments} />
          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-4 flex flex-col gap-0">
            {/* <AuthorCard /> */}
            <RelatedPostsWidget />
            
            {/* Sticky Container for the rest of the sidebar */}
            <div className="sticky top-24">
              <TableOfContentsWidget />
              <NewsletterWidget />
              <TagsWidget />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
