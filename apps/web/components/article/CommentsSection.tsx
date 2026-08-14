'use client';
import React, { useState } from 'react';

export default function CommentsSection() {
  const [comment, setComment] = useState('');

  return (
    <div className="flex flex-col mt-4">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">Comments (12)</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
          <select className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#6366F1] cursor-pointer shadow-sm dark:shadow-none">
            <option>Newest</option>
            <option>Oldest</option>
            <option>Top Comments</option>
          </select>
        </div>
      </div>

      {/* Add Comment Input */}
      <div className="flex gap-4 mb-10">
        <div className="w-10 h-10 rounded-full bg-[#6366F1] flex items-center justify-center shrink-0">
          {/* User Icon Placeholder */}
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Add a comment..." 
            className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm px-0 py-2 focus:outline-none focus:border-[#6366F1] transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {comment && (
            <div className="flex justify-end mt-2 gap-2">
              <button 
                className="px-4 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                onClick={() => setComment('')}
              >
                Cancel
              </button>
              <button className="px-4 py-1.5 bg-[#6366F1] hover:bg-[#5457DF] text-white text-sm font-bold rounded-lg transition-colors">
                Comment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments List (Mocked single comment for now) */}
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center shrink-0">
          <span className="text-gray-600 dark:text-white font-bold text-sm">G</span>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-gray-900 dark:text-white font-bold text-sm">GamerX</span>
            <span className="text-gray-500 text-xs">May 13, 2024</span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
            Great list! Definitely agree with Zelda being at the top. Can't wait to see what other games make the list for the next update.
          </p>
          <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
            <button className="hover:text-gray-900 dark:hover:text-white transition-colors">Reply</button>
            <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
              12
            </div>
            <button className="hover:text-gray-900 dark:hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
