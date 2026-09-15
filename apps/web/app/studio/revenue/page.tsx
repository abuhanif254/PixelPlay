import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TrendingUp, DollarSign, Activity, CalendarDays, Gamepad2, ArrowUpRight } from 'lucide-react';
import RevenueChart from './RevenueChart';
import PayoutSettingsModal from '@/components/developer/PayoutSettingsModal';
import Link from 'next/link';

export const runtime = 'edge';
export const revalidate = 0;

export default async function RevenueDashboard() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user || null;

  if (!user) {
    redirect('/login?next=/studio/revenue');
  }

  // Fetch actual data from developer_revenue table
  const { data: revenueRecords } = await supabase
    .from('developer_revenue')
    .select('*')
    .eq('developer_id', user.id)
    .order('date', { ascending: true });

  // Fetch developer's active games
  const { data: devGames } = await supabase
    .from('games')
    .select('id, title, slug, image_url, category, total_plays')
    .eq('developer_id', user.id)
    .eq('status', 'active');

  const gamesList = devGames || [];

  // Genuine records from developer_revenue table
  const displayRecords = (revenueRecords && revenueRecords.length > 0) ? revenueRecords : [];

  const totalImpressions = displayRecords.reduce((sum, r) => sum + (Number(r.impressions) || 0), 0);
  const totalDevEarnings = displayRecords.reduce((sum, r) => sum + (Number(r.developer_share) || 0), 0);
  const currentMonthEarnings = displayRecords.slice(-30).reduce((sum, r) => sum + (Number(r.developer_share) || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Banner */}
      {(!revenueRecords || revenueRecords.length === 0) && (
        <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-800 dark:text-indigo-300 rounded-xl text-xs flex items-center justify-between">
          <div>
            <strong>70% Net Ad Revenue Share Active:</strong> Your revenue will accrue automatically as players view banners, interstitials, and rewarded ads during gameplay.
          </div>
          <PayoutSettingsModal currentBalance={currentMonthEarnings} />
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#111228] p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <DollarSign size={64} />
          </div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <TrendingUp size={15} className="text-emerald-500" />
            Lifetime 70% Share
          </p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white font-outfit">
            ${totalDevEarnings.toFixed(2)}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-bold flex items-center gap-1">
            <span>+70% net publisher rev-share</span>
          </p>
        </div>

        <div className="bg-white dark:bg-[#111228] p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <CalendarDays size={64} />
          </div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            30-Day Earnings
          </p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white font-outfit">
            ${currentMonthEarnings.toFixed(2)}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {currentMonthEarnings >= 50 ? 'Eligible for payout' : 'Pending $50.00 min threshold'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111228] p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Activity size={64} />
          </div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Total Ad Impressions
          </p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white font-outfit">
            {totalImpressions.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Across your {gamesList.length} published {gamesList.length === 1 ? 'game' : 'games'}
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-[#111228] rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl p-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">Revenue History (30 Days)</h2>
            <p className="text-xs text-gray-500 mt-0.5">Your 70% share of generated ad impressions and in-game rewards.</p>
          </div>
          <PayoutSettingsModal currentBalance={currentMonthEarnings} />
        </div>
        
        {displayRecords.length > 0 ? (
          <div className="h-[300px] w-full">
            <RevenueChart data={displayRecords} />
          </div>
        ) : (
          <div className="h-[200px] w-full flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-white/10 rounded-xl bg-gray-50/50 dark:bg-black/20 p-6 text-center">
            <DollarSign className="w-8 h-8 text-indigo-400 mb-2 opacity-60" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Awaiting First Monetization Event</h3>
            <p className="text-xs text-gray-500 max-w-md mt-1">
              As players launch and play your games, in-game ad impressions and rewarded video engagements will automatically log here daily with your guaranteed 70% net publisher share.
            </p>
          </div>
        )}
      </div>

      {/* Per-Game Revenue Attribution */}
      {gamesList.length > 0 && (
        <div className="bg-white dark:bg-[#111228] rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">
                Game Revenue Attribution
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Estimated revenue breakdown per published title.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-black/20 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Total Plays</th>
                  <th className="px-6 py-4">Est. Impressions</th>
                  <th className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-extrabold text-right">Your 70% Cut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {gamesList.map((g, idx) => {
                  const plays = Number(g.total_plays) || 0;
                  const estImpressions = Math.floor(plays * 2.4);
                  const estCut = plays > 0 ? (estImpressions / 1000) * 1.20 * 0.7 : 0;

                  return (
                    <tr key={g.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-[#0A0B1A] shrink-0 border border-gray-200 dark:border-white/5">
                            <img 
                              src={g.image_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${g.slug}`} 
                              alt={g.title} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div>
                            <Link href={`/games/${g.slug}`} target="_blank" className="font-bold text-sm text-gray-900 dark:text-white hover:text-indigo-500 transition-colors flex items-center gap-1">
                              {g.title} <ArrowUpRight size={12} className="opacity-50" />
                            </Link>
                            <span className="text-xs text-gray-400">{g.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-600 dark:text-gray-300">
                        {plays.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {estImpressions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 text-right">
                        ${estCut.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Daily Ledger */}
      <div className="bg-white dark:bg-[#111228] rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-white/5">
          <h2 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">Daily Ledger</h2>
          <p className="text-xs text-gray-500 mt-0.5">Aggregated daily ad performance logs.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-black/20 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Impressions</th>
                <th className="px-6 py-4">Gross Ad Rev</th>
                <th className="px-6 py-4">Platform (30%)</th>
                <th className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-extrabold">Your Cut (70%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {[...displayRecords].reverse().map((r, i) => (
                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-xs text-gray-900 dark:text-white font-mono">{r.date}</td>
                  <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-400">{r.impressions.toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">${r.gross_revenue.toFixed(2)}</td>
                  <td className="px-6 py-4 text-xs text-gray-400">${r.platform_share.toFixed(2)}</td>
                  <td className="px-6 py-4 text-xs text-emerald-600 dark:text-emerald-400 font-bold">${r.developer_share.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
