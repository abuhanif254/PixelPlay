'use server'

export const runtime = 'edge';;

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// --- Likes ---

export async function toggleLike(postId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be logged in to like a post.' };
  }

  // Check if like exists
  const { data: existingLike } = await supabase
    .from('blog_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('blog_likes')
      .delete()
      .eq('id', existingLike.id);
    
    if (error) return { success: false, error: error.message };
    
    revalidatePath(`/blog`);
    return { success: true, liked: false };
  } else {
    // Like
    const { error } = await supabase
      .from('blog_likes')
      .insert([{ post_id: postId, user_id: user.id }]);
      
    if (error) return { success: false, error: error.message };
    
    revalidatePath(`/blog`);
    return { success: true, liked: true };
  }
}

export async function getLikeCount(postId: string) {
  const supabase = createClient();
  const { count } = await supabase
    .from('blog_likes')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId);
    
  return count || 0;
}

export async function hasUserLiked(postId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: like } = await supabase
    .from('blog_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  return !!like;
}

// --- Comments ---

export async function addComment(postId: string, content: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be logged in to comment.' };
  }

  if (!content.trim()) {
    return { success: false, error: 'Comment cannot be empty.' };
  }

  const { error } = await supabase
    .from('blog_comments')
    .insert([{ post_id: postId, author_id: user.id, content: content.trim() }]);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/blog`);
  return { success: true };
}

export async function getComments(postId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('blog_comments')
    .select(`
      id, content, created_at,
      author:author_id (id, username, avatar_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) return [];
  return data;
}

