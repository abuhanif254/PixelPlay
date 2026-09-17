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
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) console.error('Auth error in updateProfile:', authError)
    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
      .from('profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) return { success: false, error: error.message }

    try {
      revalidatePath('/profile')
      revalidatePath('/leaderboard')
    } catch (revalError) {
      console.error('revalidatePath error:', revalError)
      // We don't fail the action if revalidatePath fails, just log it.
    }
    
    return { success: true }
  } catch (err: any) {
    console.error('Unhandled error in updateProfile:', err)
    return { success: false, error: err?.message || String(err) }
  }
}

export async function toggleFavoriteGame(gameId: string) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { success: false, error: 'Unauthorized' }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('favorite_game_ids')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Error fetching profile in toggleFavoriteGame:', profileError)
    }

    const current: string[] = profile?.favorite_game_ids || []
    const isFav = current.includes(gameId)
    const updated = isFav
      ? current.filter((id) => id !== gameId)
      : [...current, gameId]

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ favorite_game_ids: updated, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating favorite_game_ids:', updateError)
      return { success: false, error: updateError.message }
    }

    try {
      revalidatePath('/profile')
      revalidatePath('/profile/favorites')
    } catch (revalErr) {
      // Ignore Edge runtime revalidate errors
    }

    return { success: true, isFavorite: !isFav }
  } catch (err: any) {
    console.error('Unhandled error in toggleFavoriteGame:', err)
    return { success: false, error: err?.message || 'Failed to toggle favorite' }
  }
}

export async function checkAndAwardAchievements() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }

  try {
    await supabase.rpc('check_and_award_achievements', { p_user_id: user.id })
    try {
      revalidatePath('/profile')
    } catch {}
    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function updateStreak() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('streak, last_played_at')
      .eq('id', user.id)
      .maybeSingle()

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
  } catch (err) {
    console.error('Error updating streak:', err)
  }
}

export async function sendNotification(userId: string, type: string, message: string, link: string | null = null) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('sendNotification rejected: Unauthenticated session');
      return { success: false, error: 'Unauthorized' };
    }

    // SEC-06: Strict link sanitization: only internal relative paths are permitted
    let safeLink: string | null = null;
    if (link && typeof link === 'string') {
      const trimmed = link.trim();
      if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('\\')) {
        safeLink = trimmed;
      } else {
        console.warn(`[Security Alert] Rejected non-relative notification link: "${link}"`);
      }
    }

    const { error } = await supabase.from('user_notifications').insert({
      user_id: userId,
      type: String(type).trim().slice(0, 50),
      message: String(message).trim().slice(0, 500),
      link: safeLink
    });

    if (error) {
      console.error('sendNotification database error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error sending notification:', err);
    return { success: false, error: err?.message || 'Failed to send notification' };
  }
}


