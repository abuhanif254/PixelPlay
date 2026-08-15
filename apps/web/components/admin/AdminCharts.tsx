'use client';
import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { createClient } from '@/lib/supabase/client';

type TrafficPoint = { date: string; views: number; plays: number; name: string };
type RevenuePoint = { name: string; revenue: number };

function LoadingChart() {
  return (
    <div className="h-[280px] flex flex-col items-center justify-center gap-3">
      <div className="w-full h-full bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-[280px] flex flex-col items-center justify-center gap-2 text-center">
      <p className="text-3xl">📊</p>
      <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{message}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500">Data will appear as users visit the platform</p>
    </div>
  );
}

const DAYS_OPTIONS = [
  { label: 'Last 7 Days', value: 7 },
  { label: 'Last 30 Days', value: 30 },
];

export function TrafficChart() {
  const [data, setData] = useState<TrafficPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    setLoading(true);
    const supabase = createClient();
    const fetchData = async () => {
      try {
        const { data: raw } = await supabase.rpc('get_traffic_data', { days_back: days });
        if (raw && Array.isArray(raw)) {
          const formatted: TrafficPoint[] = raw.map((d: any) => ({
            date: d.date,
            views: d.views || 0,
            plays: d.plays || 0,
            name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          }));
          setData(formatted);
        }
      } catch {
        // silent — chart will show empty state
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [mounted, days]);

  if (!mounted) return <LoadingChart />;
  if (loading) return <LoadingChart />;

  const hasData = data.some(d => d.views > 0 || d.plays > 0);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#6366F1]" />
            <span className="text-gray-500 dark:text-gray-400">Page Views</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#10B981]" />
            <span className="text-gray-500 dark:text-gray-400">Game Plays</span>
          </div>
        </div>
        <select
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          className="bg-gray-50 dark:bg-[#0A0B1A] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none"
        >
          {DAYS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {!hasData ? (
        <EmptyChart message="No traffic data yet" />
      ) : (
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPlays" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff1a" />
              <XAxis
                dataKey="name"
                axisLine={false} tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                interval={days <= 7 ? 0 : Math.floor(days / 7)}
                dy={8}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111228', borderColor: '#ffffff1a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                itemStyle={{ fontWeight: 'bold' }}
                labelStyle={{ color: '#9CA3AF', marginBottom: 4 }}
              />
              <Area type="monotone" dataKey="views" name="Page Views" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorViews)" dot={false} />
              <Area type="monotone" dataKey="plays" name="Game Plays" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPlays)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function RevenueChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Revenue from Monetag has no public API — displaying estimated placeholder
  // based on typical CPM rates × page views
  const revenueData: RevenuePoint[] = [
    { name: 'Mon', revenue: 0 },
    { name: 'Tue', revenue: 0 },
    { name: 'Wed', revenue: 0 },
    { name: 'Thu', revenue: 0 },
    { name: 'Fri', revenue: 0 },
    { name: 'Sat', revenue: 0 },
    { name: 'Sun', revenue: 0 },
  ];

  if (!mounted) return <LoadingChart />;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-3 h-3 rounded-sm bg-yellow-500" />
          <span className="text-gray-500 dark:text-gray-400">Ad Revenue (USD)</span>
        </div>
        <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full font-bold">Estimated</span>
      </div>

      <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl text-center">
        <p className="text-2xl font-black text-yellow-500">$0.00</p>
        <p className="text-[10px] text-gray-400 mt-1">Connect Monetag API for live data</p>
      </div>

      <div className="h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff1a" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={v => `$${v}`} />
            <Tooltip
              cursor={{ fill: '#ffffff0a' }}
              contentStyle={{ backgroundColor: '#111228', borderColor: '#ffffff1a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              formatter={(v: any) => [`$${v}`, 'Revenue']}
            />
            <Bar dataKey="revenue" fill="#EAB308" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
