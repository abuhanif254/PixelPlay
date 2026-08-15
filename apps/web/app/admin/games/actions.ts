'use server'

import { createClient } from '@/lib/supabase/server'
import { verifyAdminAction } from '@/lib/admin'
import { revalidatePath } from 'next/cache'
import { gamesRegistry } from '@pixelplay/games/registry'

// ─── Sync Plugin Registry → Supabase ──────────────────────────────────────────
export async function syncGames() {
  const auth = await verifyAdminAction()
  if (!auth.success) return auth

  const supabase = createClient()

  const gamesToUpsert = Object.entries(gamesRegistry).map(([slug, { config }]) => ({
    title: config.title,
    slug,
    description: config.description || '',
    category: config.category,
    image_url: config.image || '',
    status: 'active' as const,
  }))

  const { error } = await supabase
    .from('games')
    .upsert(gamesToUpsert, { onConflict: 'slug' })

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/games')
  return { success: true }
}

// ─── Add Game Manually ─────────────────────────────────────────────────────────
export async function addGameManually(data: {
  title: string
  slug: string
  description: string
  category: string
  image_url: string
  source_url?: string
  status: 'active' | 'draft' | 'maintenance'
}) {
  const auth = await verifyAdminAction()
  if (!auth.success) return auth

  const supabase = createClient()

  const { error } = await supabase.from('games').insert([data])
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/games')
  return { success: true }
}

// ─── Update Game ───────────────────────────────────────────────────────────────
export async function updateGame(
  id: string,
  data: {
    title?: string
    description?: string
    category?: string
    image_url?: string
    source_url?: string
    status?: 'active' | 'draft' | 'maintenance'
  }
) {
  const auth = await verifyAdminAction()
  if (!auth.success) return auth

  const supabase = createClient()

  const { error } = await supabase.from('games').update(data).eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/games')
  revalidatePath('/games')
  return { success: true }
}

// ─── Update Game Status ────────────────────────────────────────────────────────
export async function updateGameStatus(
  id: string,
  status: 'active' | 'draft' | 'maintenance'
) {
  const auth = await verifyAdminAction()
  if (!auth.success) return auth

  const supabase = createClient()

  const { error } = await supabase.from('games').update({ status }).eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/games')
  revalidatePath('/games')
  return { success: true }
}

// ─── Delete Game ───────────────────────────────────────────────────────────────
export async function deleteGame(id: string) {
  const auth = await verifyAdminAction()
  if (!auth.success) return auth

  const supabase = createClient()

  const { error } = await supabase.from('games').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/games')
  revalidatePath('/games')
  return { success: true }
}
