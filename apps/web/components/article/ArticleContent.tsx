"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import GameEmbed from '../mdx/GameEmbed';
import PremiumCTA from '../mdx/PremiumCTA';

// Define the custom components that can be used inside MDX
const components = {
  gameembed: GameEmbed,
  premiumcta: PremiumCTA,
};

export default function ArticleContent({ content }: { content: string }) {
  return (
    <article className="prose dark:prose-invert max-w-none prose-headings:font-outfit prose-headings:font-bold prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-[#6366F1] hover:prose-a:text-[#5457DF] prose-img:rounded-2xl prose-img:shadow-lg mb-12">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components as any}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
