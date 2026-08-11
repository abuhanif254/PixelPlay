import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { constructMetadata, siteConfig } from '@/lib/seo';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
interface BlogPostPageProps {
  params: {
    slug: string;
  };
}
export const runtime = 'edge';

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  
  if (!post) {
    return {};
  }

  return constructMetadata({
    title: post.title,
    description: post.excerpt,
    image: post.imageUrl,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPostBySlug(params.slug);
  
  if (!post) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    image: [post.imageUrl],
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`
      }
    },
    description: post.excerpt
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0B1A] pt-8 pb-24 text-gray-900 dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <Link href="/blog" className="inline-flex items-center text-primary hover:text-accent transition-colors mb-12 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>
        
        <article>
          <header className="mb-12">
            <div className="flex items-center space-x-4 text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">
              <span className="text-primary font-bold uppercase tracking-wider">{post.category}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </time>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1.5" />
                <span>{post.readTime}</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-outfit font-extrabold text-black dark:text-white tracking-tight mb-8 leading-[1.1]">
              {post.title}
            </h1>
            
            <div className="flex items-center">
              <img 
                src={post.author.avatar} 
                alt={post.author.name} 
                className="w-12 h-12 rounded-full mr-4 border-2 border-gray-100 dark:border-gray-800"
              />
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{post.author.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Editor</p>
              </div>
            </div>
          </header>
          
          <div className="w-full aspect-video rounded-3xl overflow-hidden mb-12 border border-gray-100 dark:border-gray-800/50 shadow-2xl">
            <img 
              src={post.imageUrl} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div 
            className="prose prose-lg dark:prose-invert prose-headings:font-outfit prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-a:text-primary max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </div>
  );
}
