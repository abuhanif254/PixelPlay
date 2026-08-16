'use client';

import React, { useState } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { toggleFollow } from '@/app/profile/[username]/actions';

interface FollowButtonProps {
  targetUserId: string;
  targetUsername: string;
  initialIsFollowing: boolean;
}

export default function FollowButton({ targetUserId, targetUsername, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    // Optimistic UI
    setIsFollowing(!isFollowing);
    
    const res = await toggleFollow(targetUserId, targetUsername);
    if (!res.success) {
      // Revert on error
      setIsFollowing(isFollowing);
      alert(res.error);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
        isFollowing 
          ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400' 
          : 'bg-[#6366F1] text-white hover:bg-[#4F46E5]'
      }`}
    >
      {isFollowing ? (
        <>
          <UserCheck size={14} /> Following
        </>
      ) : (
        <>
          <UserPlus size={14} /> Follow
        </>
      )}
    </button>
  );
}
