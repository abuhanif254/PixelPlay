'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitScore(gameSlug: string, score: number) {
  const supabase = createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'User not logged in' };

  // 1. Validate score type, finiteness, and bounds (0 to 10,000,000)
  if (typeof score !== 'number' || !Number.isFinite(score)) {
    return { success: false, error: 'Invalid score: must be a valid number' };
  }

  const cleanScore = Math.floor(score);
  if (cleanScore < 0 || cleanScore > 10_000_000) {
    return { success: false, error: 'Invalid score: must be between 0 and 10,000,000' };
  }

  // 2. Get game ID from slug and ensure active status
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('id, total_plays, status')
    .eq('slug', gameSlug)
    .maybeSingle();

  if (gameError || !game) {
    return { success: false, error: 'Game not found in database' };
  }

  if (game.status !== 'active') {
    return { success: false, error: 'Scores can only be submitted for active games' };
  }

  // 3. Anti-cheat rate limit cooldown (3-second debounce per user/game)
  const { data: recentScore } = await supabase
    .from('scores')
    .select('created_at')
    .eq('user_id', user.id)
    .eq('game_id', game.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recentScore?.created_at) {
    const elapsedMs = Date.now() - new Date(recentScore.created_at).getTime();
    if (elapsedMs < 3000) {
      return { 
        success: false, 
        error: 'Rate limit: please wait a moment before submitting another score' 
      };
    }
  }

  // 4. Insert validated score
  const { error: insertError } = await supabase
    .from('scores')
    .insert([
      { user_id: user.id, game_id: game.id, score: cleanScore }
    ]);

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  // Award user XP, calculate level progression, and evaluate achievements
  const newlyUnlocked: Array<{ title: string; xp: number; icon: string }> = [];
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp, level, streak')
      .eq('id', user.id)
      .maybeSingle();

    let newLevel = 1;
    if (profile) {
      const addedXp = Math.max(25, Math.min(500, Math.floor(cleanScore / 100)));
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
        // Count distinct games played and sum total score
        const { data: userScores } = await supabase
          .from('scores')
          .select('game_id, score')
          .eq('user_id', user.id);
        const distinctGamesCount = new Set((userScores || []).map((s: any) => s.game_id)).size;
        const totalUserScore = (userScores || []).reduce((acc: number, curr: any) => acc + (Number(curr.score) || 0), 0);

        for (const ach of allAchievements) {
          if (earnedSet.has(ach.id)) continue;

          let isEarned = false;
          if (ach.condition_type === 'single_score' && cleanScore >= ach.condition_value) isEarned = true;
          else if (ach.condition_type === 'level' && newLevel >= ach.condition_value) isEarned = true;
          else if (ach.condition_type === 'games_played' && distinctGamesCount >= ach.condition_value) isEarned = true;
          else if (ach.condition_type === 'streak' && (profile?.streak ?? 0) >= ach.condition_value) isEarned = true;
          else if (ach.condition_type === 'total_score' && totalUserScore >= ach.condition_value) isEarned = true;

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
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: save?.save_data };
}
