import React from 'react';
import Link from 'next/link';

export default function AuthorCard() {
  return (
    <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-xl mb-6">
      <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white mb-6">About the Author</h3>
      
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-[#6366F1] flex items-center justify-center shrink-0">
          {/* Controller icon */}
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.9 8.9c-.3-1.6-1.5-2.9-3.2-3.1-2.2-.2-4.4-.3-6.7-.3s-4.5.1-6.7.3C3.6 6 2.4 7.3 2.1 8.9c-.2 1.3-.4 2.6-.4 4.1 0 1.5.2 2.8.4 4.1.3 1.6 1.5 2.9 3.2 3.1 1 .1 1.9.1 2.9.2l1.3-2.1H14.5l1.3 2.1c1-.1 1.9-.1 2.9-.2 1.7-.2 2.9-1.5 3.2-3.1.2-1.3.4-2.6.4-4.1 0-1.5-.2-2.8-.4-4.1zM8 14H6v-2H4v-2h2V8h2v2h2v2H8v2zm7-2c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm2-3c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm2 3c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-900 dark:text-white font-bold text-lg">PlayHub Team</span>
            <span className="text-blue-500 text-sm">✔</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            We're a team of passionate gamers and writers who love sharing tips, guides, and the latest gaming news.
          </p>
        </div>
      </div>
      
      <Link href="#" className="flex items-center justify-center w-full py-3 bg-gray-50 dark:bg-[#111228] hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-bold rounded-xl transition-all shadow-sm dark:shadow-none">
        View All Posts
      </Link>
    </div>
  );
}
