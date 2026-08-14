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

export const runtime = 'edge';

type Props = {
  params: { slug: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // In a real app, you would fetch the post data by slug here
  const slug = params.slug;
  return {
    title: 'Top 10 Adventure Games You Should Play in 2024 | PixelPlay',
    description: 'Explore our handpicked list of the best adventure games that deliver epic stories, stunning worlds, and unforgettable moments.',
    keywords: ['adventure games', 'top 10 games', 'pixelplay blog', 'gaming news', 'guides'],
    alternates: {
      canonical: `https://pixelplay.com/blog/${slug}`,
    },
    openGraph: {
      title: 'Top 10 Adventure Games You Should Play in 2024 | PixelPlay',
      description: 'Explore our handpicked list of the best adventure games that deliver epic stories, stunning worlds, and unforgettable moments.',
      url: `https://pixelplay.com/blog/${slug}`,
      siteName: 'PixelPlay Games',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
          width: 1200,
          height: 630,
          alt: 'The Legend of Zelda: Tears of the Kingdom landscape',
        },
      ],
      type: 'article',
      publishedTime: '2024-05-12T00:00:00.000Z',
      authors: ['PlayHub Team'],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Top 10 Adventure Games You Should Play in 2024 | PixelPlay',
      description: 'Explore our handpicked list of the best adventure games that deliver epic stories, stunning worlds, and unforgettable moments.',
      images: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop'],
    },
  };
}

export default function SingleArticlePage({ params }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05050F] text-gray-900 dark:text-white pt-24 pb-20 transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": "Top 10 Adventure Games You Should Play in 2024",
              "image": [
                "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop"
              ],
              "datePublished": "2024-05-12T08:00:00+08:00",
              "dateModified": "2024-05-12T08:00:00+08:00",
              "author": [{
                  "@type": "Organization",
                  "name": "PlayHub Team"
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
                  "name": "Top 10 Adventure Games You Should Play in 2024",
                  "item": `https://pixelplay.com/blog/${params.slug}`
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
            <ArticleHeader />
            <ArticleHeroImage />
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
