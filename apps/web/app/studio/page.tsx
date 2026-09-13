export const runtime = 'edge';
import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Gamepad2, 
  TrendingUp, 
  Code2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import StudioGameRowActions from '@/components/developer/StudioGameRowActions';

export const revalidate = 0;

export default async function StudioDashboardPage() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user || null;

  if (!user) {
    redirect('/login?next=/studio');
  }

  const { data: games } = await supabase
    .from('games')
    .select('*')
    .eq('developer_id', user.id)
    .order('created_at', { ascending: false });

  const myGames = games || [];
  const activeCount = myGames.filter(g => g.status === 'active').length;
  const pendingCount = myGames.filter(g => g.status === 'pending').length;
  const totalPlays = myGames.reduce((sum, g) => sum + (g.total_plays || 0), 0);
  const avgRating = myGames.length > 0 
    ? (myGames.reduce((sum, g) => sum + (g.rating || 5.0), 0) / myGames.length).toFixed(1) 
    : '0.0';

  return (
    <div className="flex flex-col gap-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111228] p-5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Total Games
          </p>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white font-outfit">
              {myGames.length}
            </p>
            <span className="text-xs font-bold text-emerald-500">
              {activeCount} active
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111228] p-5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Total Plays
          </p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white font-outfit">
            {totalPlays.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-[#111228] p-5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Avg Rating
          </p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white font-outfit">
            ★ {avgRating}
          </p>
        </div>

        <div className="bg-white dark:bg-[#111228] p-5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Review Queue
          </p>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white font-outfit">
              {pendingCount}
            </p>
            {pendingCount > 0 ? (
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                <Clock size={12} /> in review
              </span>
            ) : (
              <span className="text-xs text-gray-400">up to date</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Launch Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link 
          href="/studio/docs"
          className="group p-5 bg-gradient-to-r from-indigo-900/30 to-purple-900/20 border border-indigo-500/20 rounded-2xl shadow-lg flex items-center justify-between hover:border-indigo-500/40 transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Code2 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-400 transition-colors">
                Interactive SDK Sandbox
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Test your iframe, inspect postMessage events, and copy engine templates.
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-gray-400 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link 
          href="/studio/revenue"
          className="group p-5 bg-gradient-to-r from-emerald-900/30 to-teal-900/20 border border-emerald-500/20 rounded-2xl shadow-lg flex items-center justify-between hover:border-emerald-500/40 transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-400 transition-colors">
                70% Revenue Share Dashboard
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Track ad impressions, monthly earnings, and payout threshold status.
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-gray-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Games List */}
      <div className="bg-white dark:bg-[#111228] rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">
              My Submissions
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Manage your game portfolio, inspect review statuses, and edit builds.
            </p>
          </div>
          <Link 
            href="/studio/submit" 
            className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 transition-all"
          >
            <PlusCircle size={15} /> Submit New Game
          </Link>
        </div>

        {myGames.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
              <Gamepad2 className="text-gray-400" size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Games Submitted Yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              Plug your HTML5 game into Spielcade to reach thousands of daily players and monetize with 70% net rev-share.
            </p>
            <Link 
              href="/studio/submit" 
              className="px-6 py-2.5 bg-[#6366F1] text-white rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex items-center gap-2"
            >
              <PlusCircle size={16} /> Submit Your First Game
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-black/20 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Game Title & Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Aspect</th>
                  <th className="px-6 py-4">Total Plays</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {myGames.map((game) => {
                  const meta = game.metadata || {};
                  const aspectRatio = meta.aspectRatio || '16:9';

                  return (
                    <tr key={game.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-[#0A0B1A] overflow-hidden shrink-0 border border-gray-200 dark:border-white/5">
                            <img 
                              src={game.image_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${game.slug}`} 
                              alt={game.title} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white">{game.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                                {game.category || 'Arcade'}
                              </span>
                              <span className="text-gray-300 dark:text-gray-600">•</span>
                              <span className="text-[11px] text-gray-400 font-mono">
                                /{game.slug}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {game.status === 'active' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <CheckCircle2 size={12}/> Live
                          </span>
                        )}
                        {game.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                            <Clock size={12}/> Pending QA
                          </span>
                        )}
                        {game.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400">
                            <AlertTriangle size={12}/> Rejected
                          </span>
                        )}
                        {game.status === 'draft' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400">
                            Draft
                          </span>
                        )}
                        {game.status === 'maintenance' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400">
                            Maintenance
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-gray-500">
                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                          {aspectRatio}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-medium">
                        {(game.total_plays || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-bold">
                        ★ {game.rating || 5.0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <StudioGameRowActions game={game} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
