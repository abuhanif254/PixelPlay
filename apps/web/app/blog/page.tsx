import { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';
import { constructMetadata } from '@/lib/seo';
import BlogPreviewCard from '@/components/BlogPreviewCard';

export const metadata: Metadata = constructMetadata({
  title: 'Blog & News',
  description: 'Read the latest guides, tips, and industry news about browser gaming.',
  path: '/blog',
});

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0B1A] pt-12 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-outfit font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">PlayHub</span> Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Insights, strategies, and the latest news in the world of browser gaming.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogPreviewCard
              key={post.slug}
              title={post.title}
              excerpt={post.excerpt}
              date={post.date}
              readTime={post.readTime}
              category={post.category}
              imageUrl={post.imageUrl}
              slug={post.slug}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
