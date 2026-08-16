'use server'


import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function updateProfile(data: {
  username?: string
  full_name?: string
  bio?: string
  avatar_url?: string
  banner_url?: string
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/profile')
  revalidatePath('/leaderboard')
  return { success: true }
}

export async function toggleFavoriteGame(gameId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('favorite_game_ids')
    .eq('id', user.id)
    .single()

  const current: string[] = profile?.favorite_game_ids || []
  const isFav = current.includes(gameId)
  const updated = isFav
    ? current.filter((id) => id !== gameId)
    : [...current, gameId]

  const { error } = await supabase
    .from('profiles')
    .update({ favorite_game_ids: updated, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/profile')
  return { success: true, isFavorite: !isFav }
}

export async function checkAndAwardAchievements() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }

  try {
    await supabase.rpc('check_and_award_achievements', { p_user_id: user.id })
    revalidatePath('/profile')
    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function updateStreak() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('streak, last_played_at')
    .eq('id', user.id)
    .single()

  const now = new Date()
  const lastPlayed = profile?.last_played_at ? new Date(profile.last_played_at) : null
  const daysSince = lastPlayed
    ? Math.floor((now.getTime() - lastPlayed.getTime()) / 86400000)
    : null

  let newStreak = profile?.streak ?? 0
  if (daysSince === null || daysSince >= 2) {
    newStreak = 1 // reset
  } else if (daysSince === 1) {
    newStreak = newStreak + 1 // continue streak
  }
  // daysSince === 0 → same day, no change to streak

  await supabase
    .from('profiles')
    .update({
      streak: newStreak,
      last_played_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('id', user.id)
}

export async function sendNotification(userId: string, type: string, message: string, link: string | null = null) {
  const supabase = createClient();
  await supabase.from('user_notifications').insert({
    user_id: userId,
    type,
    message,
    link
  });
}
