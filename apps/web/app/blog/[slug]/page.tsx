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
  };
}

export default function SingleArticlePage({ params }: Props) {
  return (
    <div className="min-h-screen bg-[#05050F] text-white pt-24 pb-20">
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
