'use client';
import React, { useState, useTransition } from 'react';
import { subscribeToNewsletter } from '@/app/newsletter/actions';

export default function NewsletterWidget() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ success?: boolean; error?: string | null } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    startTransition(async () => {
      const fd = new FormData();
      fd.append('email', email);
      const res = await subscribeToNewsletter(null, fd);
      setStatus(res);
      if (res.success) {
        setEmail('');
      }
    });
  };

  return (
    <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-xl mb-6 relative overflow-hidden">
      <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white mb-3">Newsletter</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
        Get the latest gaming news, guides, and exclusive updates straight to your inbox.
      </p>
      
      {status?.success ? (
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm font-medium text-center">
          🎉 Thanks for subscribing! Check your inbox soon.
        </div>
      ) : (
        <form className="flex flex-col gap-3" onSubmit={handleSubscribe}>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email..." 
            className="w-full bg-gray-50 dark:bg-[#0A0B1A] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#6366F1] transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm dark:shadow-none"
            required
            disabled={isPending}
          />
          {status?.error && (
            <p className="text-xs text-red-500 font-medium">{status.error}</p>
          )}
          <button 
            type="submit"
            disabled={isPending}
            className="w-full bg-[#6366F1] hover:bg-[#5457DF] text-white text-sm font-bold rounded-xl py-3 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-600 text-center mt-4">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
