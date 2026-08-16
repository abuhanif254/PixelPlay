'use client';
import React, { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { toggleLike } from '@/app/blog/actions';
import { useRouter } from 'next/navigation';

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

export default function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLike = () => {
    // Optimistic UI update
    setLiked(!liked);
    setCount(prev => liked ? prev - 1 : prev + 1);

    startTransition(async () => {
      const res = await toggleLike(postId);
      if (!res.success) {
        // Revert on failure
        setLiked(liked);
        setCount(count);
        // Maybe show toast error here in a real app
      } else {
        router.refresh();
      }
    });
  };

  return (
    <button 
      onClick={handleLike}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-all shadow-sm ${
        liked 
        ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-500' 
        : 'bg-white dark:bg-[#111228] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-red-200 dark:hover:border-red-500/30 hover:text-red-500 dark:hover:text-red-400'
      }`}
    >
      <Heart size={16} className={liked ? 'fill-current' : ''} />
      <span>{count} {count === 1 ? 'Like' : 'Likes'}</span>
    </button>
  );
}
