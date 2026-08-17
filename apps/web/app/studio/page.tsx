export const runtime = 'edge';
import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PlusCircle, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function StudioDashboardPage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user || null;

  if (!user) {
    redirect('/auth/login');
  }

  const { data: games } = await supabase
    .from('games')
    .select('*')
    .eq('developer_id', user.id)
    .order('created_at', { ascending: false });

  const myGames = games || [];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#111228] p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Total Games</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white font-outfit">{myGames.length}</p>
        </div>
        <div className="bg-white dark:bg-[#111228] p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Total Plays</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white font-outfit">
            {myGames.reduce((sum, g) => sum + (g.total_plays || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-[#111228] p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Avg Rating</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white font-outfit">
            {myGames.length > 0 ? (myGames.reduce((sum, g) => sum + (g.rating || 5.0), 0) / myGames.length).toFixed(1) : '0.0'}
          </p>
        </div>
      </div>

      {/* Games List */}
      <div className="bg-white dark:bg-[#111228] rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">My Games</h2>
          <Link href="/studio/submit" className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white rounded-xl text-sm font-bold hover:bg-[#4F46E5] transition-colors">
            <PlusCircle size={16} /> Submit New
          </Link>
        </div>

        {myGames.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
              <PlusCircle className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Games Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't submitted any games to the platform.</p>
            <Link href="/studio/submit" className="px-6 py-2.5 bg-[#6366F1] text-white rounded-xl font-bold hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all">
              Submit Your First Game
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-black/20 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Game</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Plays</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {myGames.map((game) => (
                  <tr key={game.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-[#0A0B1A] overflow-hidden shrink-0">
                          <img src={game.image_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${game.slug}`} alt={game.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{game.title}</p>
                          <p className="text-xs text-gray-500 font-mono">{game.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {game.status === 'active' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-500"><CheckCircle size={12}/> Active</span>}
                      {game.status === 'pending' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500"><Clock size={12}/> Pending Review</span>}
                      {game.status === 'rejected' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-500"><AlertTriangle size={12}/> Rejected</span>}
                      {game.status === 'draft' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400">Draft</span>}
                      {game.status === 'maintenance' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-500">Maintenance</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-medium">{(game.total_plays || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-bold">{game.rating || 5.0}</td>
                    <td className="px-6 py-4 text-right">
                      {game.status === 'active' ? (
                        <Link href={`/games/${game.slug}`} className="text-sm font-bold text-[#6366F1] hover:underline">View Page</Link>
                      ) : (
                        <span className="text-sm font-medium text-gray-400">Unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
