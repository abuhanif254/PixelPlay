import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TrendingUp, DollarSign, Activity, CalendarDays } from 'lucide-react';
import RevenueChart from './RevenueChart';

export const runtime = 'edge';
export const revalidate = 0;

export default async function RevenueDashboard() {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user || null;

  if (!user) {
    redirect('/login');
  }

  // Fetch actual data from developer_revenue table
  const { data: revenueRecords } = await supabase
    .from('developer_revenue')
    .select('*')
    .eq('developer_id', user.id)
    .order('date', { ascending: true });

  // If no records, generate mock data for demonstration
  // In production, this would be updated via an external Ad Network cron job or webhook
  const displayRecords = (revenueRecords && revenueRecords.length > 0) ? revenueRecords : Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    
    // Simulate some random traffic that grows over time
    const baseImpressions = 5000 + (i * 200);
    const impressions = Math.floor(baseImpressions + (Math.random() * 2000 - 1000));
    const ecpm = 1.20; // $1.20 per 1000 impressions
    const gross_revenue = (impressions / 1000) * ecpm;
    
    return {
      date: d.toISOString().split('T')[0],
      impressions,
      gross_revenue,
      developer_share: gross_revenue * 0.7,
      platform_share: gross_revenue * 0.3,
    };
  });

  const totalImpressions = displayRecords.reduce((sum, r) => sum + r.impressions, 0);
  const totalDevEarnings = displayRecords.reduce((sum, r) => sum + r.developer_share, 0);
  const currentMonthEarnings = displayRecords.slice(-30).reduce((sum, r) => sum + r.developer_share, 0);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Warning Banner if mocking */}
      {(!revenueRecords || revenueRecords.length === 0) && (
        <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-300 rounded-xl text-sm">
          <strong>Demo Mode:</strong> No actual ad revenue recorded yet. The data below is simulated based on estimated future traffic.
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#111228] p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <DollarSign size={64} />
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-500" />
            Lifetime Earnings
          </p>
          <p className="text-4xl font-extrabold text-gray-900 dark:text-white font-outfit">
            ${totalDevEarnings.toFixed(2)}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-bold">
            +70% net revenue share
          </p>
        </div>

        <div className="bg-white dark:bg-[#111228] p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <CalendarDays size={64} />
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">30-Day Earnings</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white font-outfit">
            ${currentMonthEarnings.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Pending next payout cycle
          </p>
        </div>

        <div className="bg-white dark:bg-[#111228] p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Activity size={64} />
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Total Ad Impressions</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white font-outfit">
            {totalImpressions.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Across all your games
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-[#111228] rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">Revenue History (30 Days)</h2>
            <p className="text-sm text-gray-500">Your 70% share of generated ad revenue</p>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <RevenueChart data={displayRecords} />
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-white dark:bg-[#111228] rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-white/5">
          <h2 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">Detailed Ledger</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-black/20 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Impressions</th>
                <th className="px-6 py-4">Gross Rev</th>
                <th className="px-6 py-4">Spielcade (30%)</th>
                <th className="px-6 py-4 text-green-600 dark:text-green-400 font-extrabold">Your Cut (70%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {[...displayRecords].reverse().map((r, i) => (
                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{r.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{r.impressions.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">${r.gross_revenue.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">${r.platform_share.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-green-600 dark:text-green-400 font-bold">${r.developer_share.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
