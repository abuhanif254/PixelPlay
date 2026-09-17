'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleFollow(targetUserId: string, targetUsername: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }
  if (user.id === targetUserId) {
    return { success: false, error: 'Cannot follow yourself' };
  }

  // Check if currently following
  const { data: existingFollow } = await supabase
    .from('user_follows')
    .select('*')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle();

  if (existingFollow) {
    // Unfollow
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId);
      
    if (error) return { success: false, error: error.message };
  } else {
    // Follow
    const { error } = await supabase
      .from('user_follows')
      .insert({
        follower_id: user.id,
        following_id: targetUserId
      });
      
    if (error) return { success: false, error: error.message };

    // Note: Follow notification is automatically dispatched by the trg_on_user_follow database trigger
  }

  revalidatePath(`/profile/${targetUsername}`);
  return { success: true, isFollowing: !existingFollow };
}
