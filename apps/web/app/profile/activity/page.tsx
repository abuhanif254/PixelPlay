export const runtime = 'edge';
import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Activity, Gamepad2, Trophy, Clock } from 'lucide-react';

export const metadata = {
  title: 'Activity Feed | My Profile | Spielcade',
  description: 'Your complete timeline of scores and achievements.',
};

export const revalidate = 0;

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export default async function ActivityFeedPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch scores
  const { data: scores } = await supabase
    .from('scores')
    .select('id, score, created_at, games(title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  // Fetch user achievements
  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select('id, earned_at, achievements(title, icon, xp_reward)')
    .eq('user_id', user.id)
    .order('earned_at', { ascending: false })
    .limit(50);

  type FeedItem = {
    id: string;
    type: 'score' | 'achievement';
    title: string;
    subtitle: string;
    timestamp: Date;
    timeAgoStr: string;
    icon: typeof Gamepad2 | null;
    emoji: string;
    iconColor: string;
    iconBg: string;
  };

  const scoreItems: FeedItem[] = (scores || []).map((s: any) => {
    const d = new Date(s.created_at);
    const gameTitle = Array.isArray(s.games) ? s.games[0]?.title : s.games?.title;
    return {
      id: `score-${s.id}`,
      type: 'score',
      title: gameTitle || 'Unknown Game',
      subtitle: `Scored ${s.score.toLocaleString()} points`,
      timestamp: d,
      timeAgoStr: timeAgo(d),
      icon: Gamepad2,
      emoji: '',
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/20',
    };
  });

  const achievementItems: FeedItem[] = (userAchievements || []).map(a => {
    const d = new Date(a.earned_at);
    const ach = Array.isArray(a.achievements) ? a.achievements[0] : a.achievements;
    return {
      id: `ach-${a.id}`,
      type: 'achievement',
      title: `Unlocked: ${ach?.title}`,
      subtitle: `Earned ${ach?.xp_reward || 0} XP`,
      timestamp: d,
      timeAgoStr: timeAgo(d),
      icon: null,
      emoji: ach?.icon || '🏆',
      iconColor: 'text-yellow-500',
      iconBg: 'bg-yellow-500/20',
    };
  });

  const allItems = [...scoreItems, ...achievementItems]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm min-h-[500px] flex flex-col">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-200 dark:border-white/5">
        <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-500 flex items-center justify-center shrink-0">
          <Activity size={20} className="fill-current" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Activity Feed</h1>
          <p className="text-sm text-gray-500">Your chronological timeline of events</p>
        </div>
      </div>

      {/* Timeline */}
      {allItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20 text-center gap-2">
          <Clock size={48} className="text-gray-300 dark:text-gray-700 mb-2" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No activity yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mb-4">Start playing games and earning achievements to build your timeline.</p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 py-4">
          {/* Vertical Line */}
          <div className="absolute top-0 bottom-0 left-[27px] sm:left-[35px] w-px bg-gray-200 dark:bg-white/10" />

          <div className="flex flex-col gap-8">
            {allItems.map((item, i) => (
              <div key={item.id} className="relative flex gap-4 sm:gap-6 group">
                
                {/* Node icon */}
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-white dark:border-[#111228] shadow-sm ${item.iconBg} group-hover:scale-110 transition-transform`}>
                  {item.icon ? (
                    <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                  ) : (
                    <span className="text-base">{item.emoji}</span>
                  )}
                </div>

                {/* Content Card */}
                <div className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-4 shadow-sm group-hover:shadow-md group-hover:bg-gray-100 dark:group-hover:bg-white/10 transition-all mt-[-4px]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</h4>
                    <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">{item.timeAgoStr}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.subtitle}
                  </p>
                  
                  {/* Subtle Date string at bottom for exact context */}
                  <p className="text-[10px] text-gray-400 mt-2">
                    {item.timestamp.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {item.timestamp.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
