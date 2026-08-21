'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFavorite(gameId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not logged in' }
  }

  // Get current profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('favorite_game_ids')
    .eq('id', user.id)
    .single()

  if (profileError) {
    return { success: false, error: profileError.message }
  }

  let favoriteIds = profile.favorite_game_ids || []
  const isFavorited = favoriteIds.includes(gameId)

  if (isFavorited) {
    favoriteIds = favoriteIds.filter((id: string) => id !== gameId)
  } else {
    favoriteIds = [...favoriteIds, gameId]
  }

  // Update profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ favorite_game_ids: favoriteIds })
    .eq('id', user.id)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath('/profile')
  revalidatePath('/games/[slug]', 'page')
  
  return { success: true, isFavorited: !isFavorited }
}
