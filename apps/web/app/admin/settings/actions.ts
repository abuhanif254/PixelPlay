'use server'



import { createClient } from '@/lib/supabase/server'
import { verifyAdminAction } from '@/lib/admin'
import { revalidatePath } from 'next/cache'

// ─── Update Admin's Own Profile ────────────────────────────────────────────────
export async function updateAdminProfile(data: {
  username?: string
  full_name?: string
  avatar_url?: string
}) {
  const auth = await verifyAdminAction()
  if (!auth.success) return auth

  const supabase = createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', auth.userId)

  if (error) return { success: false, error: error.message }

  try {
    revalidatePath('/admin/settings')
  } catch (e) {
    console.error('revalidatePath error:', e)
  }
  return { success: true }
}

// ─── Clear All Scores for a Game ──────────────────────────────────────────────
export async function clearGameScores(gameId: string) {
  const auth = await verifyAdminAction()
  if (!auth.success) return auth

  const supabase = createClient()

  const { error } = await supabase.from('scores').delete().eq('game_id', gameId)
  if (error) return { success: false, error: error.message }

  try {
    revalidatePath('/admin')
    revalidatePath('/leaderboard')
  } catch (e) {
    console.error('revalidatePath error:', e)
  }
  return { success: true }
}

// ─── Mark All Notifications as Read ───────────────────────────────────────────
export async function markAllNotificationsRead() {
  const auth = await verifyAdminAction()
  if (!auth.success) return auth

  const supabase = createClient()
  const { error } = await supabase
    .from('admin_notifications')
    .update({ is_read: true })
    .eq('is_read', false)

  if (error) return { success: false, error: error.message }
  try {
    revalidatePath('/admin')
  } catch (e) {
    console.error('revalidatePath error:', e)
  }
  return { success: true }
}

// ─── Mark Single Notification as Read ─────────────────────────────────────────
export async function markNotificationRead(id: string) {
  const supabase = createClient()
  await supabase.from('admin_notifications').update({ is_read: true }).eq('id', id)
  return { success: true }
}

// ─── Update Site Config ────────────────────────────────────────────────────────
export async function updateSiteConfig(key: string, value: any) {
  const auth = await verifyAdminAction()
  if (!auth.success) return auth

  const supabase = createClient()
  
  const { error } = await supabase
    .from('site_config')
    .upsert({ config_key: key, config_value: value }, { onConflict: 'config_key' })

  if (error) return { success: false, error: error.message }

  try {
    revalidatePath('/', 'layout')
  } catch (e) {
    console.error('revalidatePath error:', e)
  }
  return { success: true }
}

