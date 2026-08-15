export const runtime = 'edge';
import React from 'react';
import { TrafficChart, RevenueChart } from '@/components/admin/AdminCharts';
import { Users, Gamepad2, Activity, FileText, Star, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin';
import Link from 'next/link';

export const revalidate = 0;

function ChangeIndicator({ current, previous, label }: { current: number; previous: number; label: string }) {
  if (previous === 0 && current === 0) return <span className="text-xs text-gray-400">No data yet</span>;
  if (previous === 0) return <span className="text-xs font-bold text-green-500 flex items-center gap-1"><TrendingUp size={12} /> New this week</span>;
  
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct > 0) return (
    <span className="text-xs font-bold text-green-500 flex items-center gap-1">
      <TrendingUp size={12} /> +{pct}% vs last week
    </span>
  );
  if (pct < 0) return (
    <span className="text-xs font-bold text-red-400 flex items-center gap-1">
      <TrendingDown size={12} /> {pct}% vs last week
    </span>
  );
  return <span className="text-xs font-bold text-gray-400 flex items-center gap-1"><Minus size={12} /> Same as last week</span>;
}

function NotificationIcon({ type }: { type: string }) {
  const map: Record<string, { icon: string; color: string }> = {
    new_user: { icon: '👤', color: 'bg-blue-500/10 text-blue-500' },
    new_score: { icon: '🏆', color: 'bg-yellow-500/10 text-yellow-500' },
    new_post: { icon: '📝', color: 'bg-green-500/10 text-green-500' },
    game_error: { icon: '⚠️', color: 'bg-red-500/10 text-red-500' },
    system: { icon: '⚙️', color: 'bg-gray-500/10 text-gray-500' },
  };
  const { icon, color } = map[type] || map.system;
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${color}`}>
      {icon}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = createClient();

  // Fetch aggregated stats via RPC
  const { data: stats } = await supabase.rpc('get_admin_stats');

  const s = stats as {
    total_users: number; users_this_week: number; users_prev_week: number;
    total_games: number; active_games: number;
    total_scores: number; scores_this_week: number; scores_prev_week: number;
    total_posts: number; published_posts: number; posts_this_week: number;
    unread_notifications: number;
  } | null;

  // Fetch real recent activity from admin_notifications
  const { data: notifications } = await supabase
    .from('admin_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8);

  // Fetch top games by total_plays
  const { data: topGames } = await supabase
    .from('games')
    .select('id, title, slug, category, total_plays, rating, image_url')
    .eq('status', 'active')
    .order('total_plays', { ascending: false })
    .limit(5);

  const kpis = [
    {
      title: 'Total Users',
      value: (s?.total_users ?? 0).toLocaleString(),
      change: { current: s?.users_this_week ?? 0, previous: s?.users_prev_week ?? 0 },
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      href: '/admin/users',
    },
    {
      title: 'Registered Games',
      value: (s?.total_games ?? 0).toLocaleString(),
      subtext: `${s?.active_games ?? 0} active`,
      icon: Gamepad2,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      href: '/admin/games',
    },
    {
      title: 'Total Scores',
      value: (s?.total_scores ?? 0).toLocaleString(),
      change: { current: s?.scores_this_week ?? 0, previous: s?.scores_prev_week ?? 0 },
      icon: Activity,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      href: '/admin/users',
    },
    {
      title: 'Blog Posts',
      value: (s?.total_posts ?? 0).toLocaleString(),
      subtext: `${s?.published_posts ?? 0} published`,
      icon: FileText,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      href: '/admin/blog',
    },
  ];

  return (
    <div className="flex flex-col gap-8">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-outfit text-gray-900 dark:text-white tracking-tight text-balance mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Monitor platform metrics, user activity, and content.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <Link key={idx} href={kpi.href} className="block">
            <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-5 flex flex-col relative overflow-hidden group shadow-sm hover:shadow-xl hover:border-[#6366F1]/30 transition-all h-full">
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${kpi.bg}`}>
                  <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">{kpi.title}</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</span>
                </div>
              </div>
              <div className="pl-16">
                {kpi.change ? (
                  <ChangeIndicator current={kpi.change.current} previous={kpi.change.previous} label={kpi.title} />
                ) : (
                  <span className="text-xs text-gray-400">{kpi.subtext}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Traffic Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Traffic &amp; Engagement</h3>
            <span className="text-xs text-indigo-500 font-bold bg-indigo-500/10 px-2 py-1 rounded-full">Live</span>
          </div>
          <TrafficChart />
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Estimated Revenue</h3>
            <span className="text-xs text-yellow-500 font-bold bg-yellow-500/10 px-2 py-1 rounded-full">Monetag</span>
          </div>
          <RevenueChart />
        </div>

      </div>

      {/* Bottom Row: Recent Activity & Top Games */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Recent Activity */}
        <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
            {s?.unread_notifications ? (
              <span className="text-xs font-bold text-white bg-[#6366F1] px-2 py-0.5 rounded-full">
                {s.unread_notifications} new
              </span>
            ) : null}
          </div>
          <div className="flex flex-col gap-3">
            {(notifications ?? []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No activity yet. Activity will appear here as users interact with the platform.</p>
            ) : (
              (notifications ?? []).map((notif) => (
                <div key={notif.id} className="flex items-start gap-3 border-b border-gray-100 dark:border-white/5 pb-3 last:border-0 last:pb-0">
                  <NotificationIcon type={notif.type} />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">{notif.title}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{notif.message}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">{timeAgo(notif.created_at)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Games */}
        <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Games</h3>
            <Link href="/admin/games" className="text-xs text-[#6366F1] font-bold hover:underline flex items-center gap-1">
              Manage <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {(topGames ?? []).length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-400 mb-3">No games yet. Register your first game!</p>
                <Link href="/admin/games" className="text-sm font-bold text-[#6366F1] hover:underline">
                  Go to Games →
                </Link>
              </div>
            ) : (
              (topGames ?? []).map((game, i) => (
                <div key={game.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-5 text-right">{i + 1}</span>
                  <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#0A0B1A] overflow-hidden shrink-0 border border-gray-200 dark:border-white/5">
                    <img
                      src={game.image_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${game.slug}`}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{game.title}</p>
                    <p className="text-xs text-gray-400">{game.category}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star size={11} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{game.rating?.toFixed(1) ?? '5.0'}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 min-w-[40px] text-right">
                    {(game.total_plays ?? 0).toLocaleString()} plays
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Add Game', icon: '🎮', href: '/admin/games', color: 'from-blue-500/10 to-blue-500/5 hover:from-blue-500/20 border-blue-500/20' },
          { label: 'Write Post', icon: '✍️', href: '/admin/blog', color: 'from-green-500/10 to-green-500/5 hover:from-green-500/20 border-green-500/20' },
          { label: 'Manage Users', icon: '👥', href: '/admin/users', color: 'from-purple-500/10 to-purple-500/5 hover:from-purple-500/20 border-purple-500/20' },
          { label: 'Settings', icon: '⚙️', href: '/admin/settings', color: 'from-orange-500/10 to-orange-500/5 hover:from-orange-500/20 border-orange-500/20' },
        ].map((action) => (
          <Link key={action.label} href={action.href}>
            <div className={`flex flex-col items-center justify-center p-6 bg-gradient-to-b ${action.color} border rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer`}>
              <span className="text-3xl mb-2">{action.icon}</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{action.label}</span>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
