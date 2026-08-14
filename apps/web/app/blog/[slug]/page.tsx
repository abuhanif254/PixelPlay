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

import { getBlogPost, getAllBlogPosts } from '@/lib/blogData';
import { notFound } from 'next/navigation';

export const runtime = 'edge';

type Props = {
  params: { slug: string };
};

export function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = getBlogPost(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found | PixelPlay',
    };
  }

  return {
    title: `${post.title} | PixelPlay`,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `https://pixelplay.com/blog/${post.slug}`,
    },
    openGraph: {
      title: `${post.title} | PixelPlay`,
      description: post.description,
      url: `https://pixelplay.com/blog/${post.slug}`,
      siteName: 'PixelPlay Games',
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | PixelPlay`,
      description: post.description,
      images: [post.coverImage],
    },
  };
}

export default function SingleArticlePage({ params }: Props) {
  const post = getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

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
              "image": [
                post.coverImage
              ],
              "datePublished": post.date,
              "dateModified": post.date,
              "author": [{
                  "@type": "Organization",
                  "name": post.author.name
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
                  "item": "https://pixelplay.com/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Blog",
                  "item": "https://pixelplay.com/blog"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": post.title,
                  "item": `https://pixelplay.com/blog/${post.slug}`
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
            <ArticleHeader post={post} />
            <ArticleHeroImage post={post} />
            <InThisArticle />
            <ArticleContent />
            <ArticleCTA />
            <PostNavigation />
            <CommentsSection />
          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-4 flex flex-col gap-0">
            <AuthorCard />
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
