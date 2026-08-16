'use server'

export const runtime = 'edge';

import { createClient } from '@/lib/supabase/server'
import { verifyAdminAction } from '@/lib/admin'
import { revalidatePath } from 'next/cache'

type BlogPostData = {
  title: string
  content: string
  excerpt?: string
  cover_image?: string
  tags?: string[]
  status: 'published' | 'draft'
}

// ─── Generate a URL-safe slug ──────────────────────────────────────────────────
function makeSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now()
}

// ─── Create Blog Post ──────────────────────────────────────────────────────────
export async function createBlogPost(data: BlogPostData) {
  const auth = await verifyAdminAction()
  if (!auth.success) return auth

  const supabase = createClient()

  const { error } = await supabase.from('blog_posts').insert([{
    author_id: auth.userId,
    title: data.title,
    slug: makeSlug(data.title),
    content: data.content,
    excerpt: data.excerpt || null,
    cover_image: data.cover_image || null,
    tags: data.tags || [],
    status: data.status,
  }])

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  return { success: true }
}

// ─── Update Blog Post ──────────────────────────────────────────────────────────
export async function updateBlogPost(id: string, data: Partial<BlogPostData>) {
  const auth = await verifyAdminAction()
  if (!auth.success) return auth

  const supabase = createClient()

  const { error } = await supabase.from('blog_posts').update({
    ...data,
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  return { success: true }
}

// ─── Toggle Publish Status ─────────────────────────────────────────────────────
export async function togglePublishStatus(id: string, currentStatus: string) {
  const auth = await verifyAdminAction()
  if (!auth.success) return auth

  const supabase = createClient()

  const newStatus = currentStatus === 'published' ? 'draft' : 'published'

  const { error } = await supabase.from('blog_posts').update({
    status: newStatus,
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  return { success: true, newStatus }
}

// ─── Delete Blog Post ──────────────────────────────────────────────────────────
export async function deleteBlogPost(id: string) {
  const auth = await verifyAdminAction()
  if (!auth.success) return auth

  const supabase = createClient()

  const { error } = await supabase.from('blog_posts').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  return { success: true }
}

// ─── Increment Views ───────────────────────────────────────────────────────────
export async function incrementViews(id: string) {
  try {
    const supabase = createClient()
    await supabase.from('blog_posts').update({ views: 1 }).eq('id', id)
  } catch {
    // silent — view tracking is best-effort
  }
}

