export const runtime = 'edge';
import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Gamepad2, Search } from 'lucide-react';

export const metadata = {
  title: 'Game History | My Profile | PixelPlay',
  description: 'A detailed log of all your game sessions.',
};

export const revalidate = 0;

export default async function GameHistoryPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch up to 100 most recent scores for the history log
  const { data: scores } = await supabase
    .from('scores')
    .select('id, score, created_at, games(title, slug, image_url, category)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  const typedScores = (scores || []) as any[];

  return (
    <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm min-h-[500px] flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
            <Gamepad2 size={20} className="fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Game History</h1>
            <p className="text-sm text-gray-500">Your most recent 100 game sessions</p>
          </div>
        </div>
      </div>

      {/* Table */}
      {typedScores.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20 text-center gap-2">
          <Search size={48} className="text-gray-300 dark:text-gray-700 mb-2" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No history found</h3>
          <p className="text-sm text-gray-500 max-w-sm mb-4">You haven't played any games yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="pb-3 px-4 font-bold">Date & Time</th>
                <th className="pb-3 px-4 font-bold">Game</th>
                <th className="pb-3 px-4 font-bold">Category</th>
                <th className="pb-3 px-4 text-right font-bold">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {typedScores.map((s) => {
                const date = new Date(s.created_at);
                const isToday = date.toDateString() === new Date().toDateString();
                const displayDate = isToday ? 'Today' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                const displayTime = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

                return (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{displayDate}</p>
                      <p className="text-xs text-gray-500">{displayTime}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-black/20 shrink-0">
                          {s.games?.image_url && (
                            <img src={s.games.image_url} alt={s.games.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          )}
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px]">
                          {s.games?.title || 'Unknown Game'}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {s.games?.category || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <p className="text-sm font-black text-[#6366F1]">
                        {s.score?.toLocaleString() || 0}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
