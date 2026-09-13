'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitScore(gameSlug: string, score: number) {
  const supabase = createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'User not logged in' };

  // Get game ID from slug
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('id, total_plays')
    .eq('slug', gameSlug)
    .single();

  if (gameError || !game) {
    return { success: false, error: 'Game not found in database' };
  }

  // Insert score
  const { error: insertError } = await supabase
    .from('scores')
    .insert([
      { user_id: user.id, game_id: game.id, score }
    ]);

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  // Award user XP, calculate level progression, and evaluate achievements
  const newlyUnlocked: Array<{ title: string; xp: number; icon: string }> = [];
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp, level')
      .eq('id', user.id)
      .single();

    let newLevel = 1;
    if (profile) {
      const addedXp = Math.max(25, Math.min(500, Math.floor(score / 100)));
      const newXp = (profile.xp || 0) + addedXp;
      newLevel = Math.floor(newXp / 500) + 1;
      await supabase
        .from('profiles')
        .update({ xp: newXp, level: newLevel, updated_at: new Date().toISOString() })
        .eq('id', user.id);
    }

    // Evaluate Achievements
    try {
      const { data: earnedData } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);
      
      const earnedSet = new Set((earnedData || []).map((e: any) => e.achievement_id));

      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*');

      if (allAchievements && allAchievements.length > 0) {
        // Count distinct games played
        const { data: userScores } = await supabase
          .from('scores')
          .select('game_id')
          .eq('user_id', user.id);
        const distinctGamesCount = new Set((userScores || []).map((s: any) => s.game_id)).size;

        for (const ach of allAchievements) {
          if (earnedSet.has(ach.id)) continue;

          let isEarned = false;
          if (ach.condition_type === 'single_score' && score >= ach.condition_value) isEarned = true;
          else if (ach.condition_type === 'level' && newLevel >= ach.condition_value) isEarned = true;
          else if (ach.condition_type === 'games_played' && distinctGamesCount >= ach.condition_value) isEarned = true;

          if (isEarned) {
            await supabase.from('user_achievements').insert([
              { user_id: user.id, achievement_id: ach.id }
            ]);
            newlyUnlocked.push({
              title: ach.title,
              xp: ach.xp_reward || 100,
              icon: ach.icon || '🏆'
            });
          }
        }
      }
    } catch (achErr) {
      console.warn('Achievement evaluation fallback:', achErr);
    }
  } catch (e) {
    console.error('Error awarding XP:', e);
  }

  // Revalidate so the updated score appears in Recent Games and Leaderboards instantly
  revalidatePath('/profile');
  revalidatePath('/profile/[username]', 'page');
  revalidatePath('/leaderboard');
  revalidatePath('/achievements');

  return { success: true, newAchievements: newlyUnlocked };
}

export async function saveGameState(gameSlug: string, data: object) {
  const supabase = createClient();
  
  // 1. Enforce max size (100KB)
  const dataString = JSON.stringify(data);
  const sizeInBytes = new Blob([dataString]).size;
  if (sizeInBytes > 102400) {
    return { success: false, error: 'Save data exceeds 100KB limit' };
  }

  // 2. Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'User not logged in' };

  // 3. Upsert save data
  const { error } = await supabase
    .from('game_saves')
    .upsert(
      { user_id: user.id, game_id: gameSlug, save_data: data, updated_at: new Date().toISOString() },
      { onConflict: 'user_id, game_id' }
    );

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function loadGameState(gameSlug: string) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'User not logged in' };

  const { data: save, error } = await supabase
    .from('game_saves')
    .select('save_data')
    .eq('user_id', user.id)
    .eq('game_id', gameSlug)
    .single();

  if (error) {
    // PGRST116 means no rows returned, which is fine (no save yet)
    if (error.code === 'PGRST116') {
      return { success: true, data: null };
    }
    return { success: false, error: error.message };
  }

  return { success: true, data: save?.save_data };
}
