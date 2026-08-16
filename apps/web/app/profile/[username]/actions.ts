'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendNotification } from '@/app/profile/actions';

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
    .single();

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

    // Get follower's username for notification
    const { data: followerProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    if (followerProfile) {
      await sendNotification(
        targetUserId,
        'new_follower',
        `@${followerProfile.username} started following you!`,
        `/profile/${followerProfile.username}`
      );
    }
  }

  revalidatePath(`/profile/${targetUsername}`);
  return { success: true, isFollowing: !existingFollow };
}
