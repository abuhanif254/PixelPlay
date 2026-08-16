'use server'



import { createClient } from '@/lib/supabase/server'
import { verifyAdminAction } from '@/lib/admin'
import { revalidatePath } from 'next/cache'
import { gamesRegistry } from '@spielcade/games/registry'

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
  status: 'active' | 'draft' | 'maintenance' | 'pending' | 'rejected'
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
    status?: 'active' | 'draft' | 'maintenance' | 'pending' | 'rejected'
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
  status: 'active' | 'draft' | 'maintenance' | 'pending' | 'rejected'
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

import { sendNotification } from '@/app/profile/actions';

// ─── Approve Game ──────────────────────────────────────────────────────────────
export async function approveGame(id: string) {
  const auth = await verifyAdminAction()
  if (!auth.success) return auth

  const supabase = createClient()

  const { data: game, error: fetchErr } = await supabase
    .from('games')
    .select('title, developer_id')
    .eq('id', id)
    .single();

  if (fetchErr) return { success: false, error: fetchErr.message }

  const { error } = await supabase.from('games').update({ status: 'active' }).eq('id', id)
  if (error) return { success: false, error: error.message }

  if (game?.developer_id) {
    await sendNotification(
      game.developer_id,
      'system',
      `Your game "${game.title}" has been approved and is now live!`,
      `/games/${id}`
    );
  }

  revalidatePath('/admin/games')
  revalidatePath('/admin/games/queue')
  revalidatePath('/games')
  return { success: true }
}

// ─── Reject Game ───────────────────────────────────────────────────────────────
export async function rejectGame(id: string, reason: string) {
  const auth = await verifyAdminAction()
  if (!auth.success) return auth

  const supabase = createClient()

  const { data: game, error: fetchErr } = await supabase
    .from('games')
    .select('title, developer_id')
    .eq('id', id)
    .single();

  if (fetchErr) return { success: false, error: fetchErr.message }

  const { error } = await supabase.from('games').update({ status: 'rejected' }).eq('id', id)
  if (error) return { success: false, error: error.message }

  if (game?.developer_id) {
    await sendNotification(
      game.developer_id,
      'system',
      `Your game "${game.title}" was rejected. Reason: ${reason}`
    );
  }

  revalidatePath('/admin/games')
  revalidatePath('/admin/games/queue')
  return { success: true }
}

