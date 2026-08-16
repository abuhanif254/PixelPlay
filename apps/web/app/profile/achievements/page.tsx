export const runtime = 'edge';
import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Trophy, Lock, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Achievements | My Profile | Spielcade',
  description: 'View your unlocked and locked achievements.',
};

export const revalidate = 0;

export default async function AchievementsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch user profile stats for progress calculation
  const { data: profile } = await supabase
    .from('profiles')
    .select('level, streak')
    .eq('id', user.id)
    .single();

  // Fetch scores for progress calculation
  const { data: scores } = await supabase
    .from('scores')
    .select('score, game_id')
    .eq('user_id', user.id);

  const typedScores = (scores || []) as any[];
  const totalScoreVal = typedScores.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const gamesPlayedVal = new Set(typedScores.map(s => s.game_id)).size;

  // Fetch achievements
  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*')
    .order('condition_value', { ascending: true });

  const { data: earnedRows } = await supabase
    .from('user_achievements')
    .select('achievement_id, earned_at')
    .eq('user_id', user.id);

  const earnedIds = new Set((earnedRows || []).map((r: any) => r.achievement_id));
  const earnedDates: Record<string, string> = {};
  (earnedRows || []).forEach((r: any) => { earnedDates[r.achievement_id] = r.earned_at; });

  const achievementsData = (allAchievements || []).map((a: any) => {
    let currentVal = 0;
    if (a.condition_type === 'total_score') currentVal = totalScoreVal;
    if (a.condition_type === 'games_played') currentVal = gamesPlayedVal;
    if (a.condition_type === 'streak') currentVal = profile?.streak || 0;
    if (a.condition_type === 'level') currentVal = profile?.level || 1;

    const pct = Math.min(100, Math.round((currentVal / a.condition_value) * 100));

    return {
      ...a,
      earned: earnedIds.has(a.id),
      earned_at: earnedDates[a.id] || null,
      currentVal,
      progressPct: pct,
    };
  });

  const unlocked = achievementsData.filter(a => a.earned);
  const locked = achievementsData.filter(a => !a.earned);

  const renderAchievementCard = (a: any) => (
    <div key={a.id} className={`bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-5 flex flex-col shadow-sm transition-all relative overflow-hidden group ${a.earned ? 'hover:-translate-y-1 hover:shadow-lg' : 'opacity-80 hover:opacity-100 grayscale hover:grayscale-0'}`}>
      {a.earned && (
        <div className="absolute top-4 right-4 text-green-500">
          <CheckCircle2 size={20} />
        </div>
      )}
      {!a.earned && (
        <div className="absolute top-4 right-4 text-gray-400">
          <Lock size={16} />
        </div>
      )}
      
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-2xl shadow-lg mb-4 shrink-0`}>
        {a.icon}
      </div>
      
      <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">{a.title}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex-1">{a.description}</p>
      
      <div className="w-full">
        <div className="flex justify-between text-[10px] text-gray-500 font-bold mb-1.5 uppercase tracking-wider">
          <span>{a.currentVal > a.condition_value ? a.condition_value : a.currentVal} / {a.condition_value}</span>
          <span>{a.progressPct}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 dark:bg-[#0A0B1A] rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${a.earned ? `bg-gradient-to-r ${a.gradient}` : 'bg-gray-300 dark:bg-gray-600'}`} 
            style={{ width: `${a.progressPct}%` }} 
          />
        </div>
        <div className="mt-2 text-right text-[10px] text-[#6366F1] font-bold">
          +{a.xp_reward} XP
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 min-h-[500px]">
      
      {/* Header */}
      <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0">
          <Trophy size={24} className="fill-current" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Achievements</h1>
          <p className="text-sm text-gray-500">Track your milestones and earn XP</p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-2xl font-black text-gray-900 dark:text-white">{unlocked.length} <span className="text-lg text-gray-400 font-medium">/ {achievementsData.length}</span></div>
          <p className="text-xs text-gray-500">Unlocked</p>
        </div>
      </div>

      {unlocked.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">Unlocked Achievements</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {unlocked.map(renderAchievementCard)}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 px-2 mt-4">Locked Achievements</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {locked.map(renderAchievementCard)}
          </div>
        </div>
      )}

    </div>
  );
}
