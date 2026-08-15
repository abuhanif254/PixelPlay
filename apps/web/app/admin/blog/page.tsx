import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin';
import BlogTable from './BlogTable';

export const revalidate = 0;

export default async function AdminBlogPage() {
  await requireAdmin();
  const supabase = createClient();

  const { data: posts } = await supabase
    .from('blog_posts')
    .select(`
      id, title, slug, content, excerpt, cover_image, tags,
      status, views, read_time, created_at, updated_at,
      profiles:author_id(id, username, avatar_url)
    `)
    .order('created_at', { ascending: false });

  const mappedPosts = (posts || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    content: p.content || '',
    excerpt: p.excerpt || '',
    cover_image: p.cover_image || '',
    tags: p.tags || [],
    status: p.status as 'published' | 'draft',
    views: p.views ?? 0,
    read_time: p.read_time ?? 5,
    author: p.profiles?.username || 'Unknown',
    author_id: p.profiles?.id || '',
    author_avatar: p.profiles?.avatar_url || '',
    created_at: p.created_at,
    updated_at: p.updated_at,
  }));

  return <BlogTable initialPosts={mappedPosts} />;
}
