'use server'

export const runtime = 'edge';

import { createClient } from '@/lib/supabase/server'
import { verifyAdminAction } from '@/lib/admin'
import { revalidatePath } from 'next/cache'

// ─── Update User Role ──────────────────────────────────────────────────────────
export async function updateUserRole(userId: string, role: 'user' | 'admin') {
  const auth = await verifyAdminAction()
  if (!auth.success) return auth

  // Prevent self-demotion
  if (userId === auth.userId && role !== 'admin') {
    return { success: false, error: 'You cannot demote yourself from admin.' }
  }

  const supabase = createClient()
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}

// ─── Get User Score Count ──────────────────────────────────────────────────────
// Used when we need per-user score counts separately
export async function getUserScores(userId: string) {
  const auth = await verifyAdminAction()
  if (!auth.success) return { success: false, error: auth.error, data: [] }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('scores')
    .select('id, score, created_at, games:game_id(title)')
    .eq('user_id', userId)
    .order('score', { ascending: false })
    .limit(20)

  if (error) return { success: false, error: error.message, data: [] }
  return { success: true, data: data || [] }
}

// ─── Toggle User Ban ───────────────────────────────────────────────────────────
export async function toggleBan(userId: string, isBanned: boolean, reason?: string) {
  const auth = await verifyAdminAction()
  if (!auth.success) return auth

  if (userId === auth.userId) {
    return { success: false, error: 'You cannot ban yourself.' }
  }

  const supabase = createClient()
  
  // Note: If you want to store the reason, you would need a 'ban_reason' column in 'profiles'. 
  // For now, we accept it to fix the type signature from the client call.
  const { error } = await supabase.from('profiles').update({ is_banned: isBanned }).eq('id', userId)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}

