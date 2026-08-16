'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitScore(gameSlug: string, score: number) {
  const supabase = createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'User not logged in' }

  // Get game ID from slug
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('id')
    .eq('slug', gameSlug)
    .single()

  if (gameError || !game) {
    return { success: false, error: 'Game not found in database' }
  }

  // Insert score
  const { error: insertError } = await supabase
    .from('scores')
    .insert([
      { user_id: user.id, game_id: game.id, score }
    ])

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  // Revalidate so the updated score appears in Recent Games and Leaderboards instantly
  revalidatePath('/profile')
  revalidatePath('/profile/[username]', 'page')
  revalidatePath('/leaderboard')

  return { success: true }
}

export async function saveGameState(gameSlug: string, data: object) {
  const supabase = createClient()
  
  // 1. Enforce max size (100KB)
  const dataString = JSON.stringify(data)
  const sizeInBytes = new Blob([dataString]).size
  if (sizeInBytes > 102400) {
    return { success: false, error: 'Save data exceeds 100KB limit' }
  }

  // 2. Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'User not logged in' }

  // 3. Upsert save data
  const { error } = await supabase
    .from('game_saves')
    .upsert(
      { user_id: user.id, game_id: gameSlug, save_data: data, updated_at: new Date().toISOString() },
      { onConflict: 'user_id, game_id' }
    )

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function loadGameState(gameSlug: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'User not logged in' }

  const { data: save, error } = await supabase
    .from('game_saves')
    .select('save_data')
    .eq('user_id', user.id)
    .eq('game_id', gameSlug)
    .single()

  if (error) {
    // PGRST116 means no rows returned, which is fine (no save yet)
    if (error.code === 'PGRST116') {
      return { success: true, data: null }
    }
    return { success: false, error: error.message }
  }

  return { success: true, data: save?.save_data }
}
