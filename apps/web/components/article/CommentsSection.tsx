'use client';
import React, { useState } from 'react';
import { addComment } from '@/app/blog/actions';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CommentsSectionProps {
  postId: string;
  comments: any[];
}

export default function CommentsSection({ postId, comments }: CommentsSectionProps) {
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    setError('');

    startTransition(async () => {
      const res = await addComment(postId, comment);
      if (res.success) {
        setComment('');
        router.refresh(); // Refresh the page data to fetch new comments
      } else {
        setError(res.error || 'Failed to post comment.');
      }
    });
  };

  return (
    <div className="flex flex-col mt-4">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">Comments ({comments.length})</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
          <select className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#6366F1] cursor-pointer shadow-sm dark:shadow-none">
            <option>Oldest</option>
            <option>Newest</option>
          </select>
        </div>
      </div>

      {/* Add Comment Input */}
      <div className="flex gap-4 mb-10">
        <div className="w-10 h-10 rounded-full bg-[#6366F1] flex items-center justify-center shrink-0 overflow-hidden">
          {/* User Icon Placeholder - In a real app we'd show the logged in user's avatar */}
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Add a comment..." 
            className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm px-0 py-2 focus:outline-none focus:border-[#6366F1] transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isPending}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          {comment && (
            <div className="flex justify-end mt-2 gap-2">
              <button 
                className="px-4 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
                onClick={() => { setComment(''); setError(''); }}
                disabled={isPending}
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isPending}
                className="px-4 py-1.5 bg-[#6366F1] hover:bg-[#5457DF] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {isPending ? 'Posting...' : 'Comment'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments List */}
      <div className="flex flex-col gap-6">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 dark:border-white/5">
              {c.author?.avatar_url ? (
                <img src={c.author.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-600 dark:text-white font-bold text-sm">
                  {c.author?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-gray-900 dark:text-white font-bold text-sm">{c.author?.username || 'Unknown User'}</span>
                <span className="text-gray-500 text-xs">{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
                {c.content}
              </p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
            No comments yet. Be the first to start the conversation!
          </div>
        )}
      </div>

    </div>
  );
}
