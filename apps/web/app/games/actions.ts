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
