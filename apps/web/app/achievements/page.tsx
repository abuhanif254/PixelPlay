import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Trophy, 
  Award, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  ChevronRight, 
  Zap, 
  Flame, 
  ShieldCheck, 
  Crown, 
  Star,
  Gamepad2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';
export const revalidate = 300; // 5-minute ISR cache

export const metadata: Metadata = {
  title: 'Global Achievements & Trophy Hall | Spielcade',
  description: 'Explore all platform badges, secret trophies, and gamer mastery levels on Spielcade. Compete on the Achievement Hunter Leaderboard!',
  alternates: {
    canonical: 'https://spielcade.com/achievements',
  },
  openGraph: {
    title: 'Global Achievements & Trophy Hall | Spielcade',
    description: 'Explore all platform badges, secret trophies, and gamer mastery levels on Spielcade.',
    url: 'https://spielcade.com/achievements',
    siteName: 'Spielcade',
    type: 'website',
  },
};

const DEFAULT_ACHIEVEMENTS = [
  {
    id: 'first-blood',
    title: 'First Blood',
    description: 'Play your very first game on Spielcade',
    icon: '🎮',
    gradient: 'from-emerald-500 to-teal-600',
    tier: 'novice',
    condition_value: 1,
    xp_reward: 50,
    rarity: '86.4%',
  },
  {
    id: 'century-club',
    title: 'Century Club',
    description: 'Score 100 points or more in any single game session',
    icon: '⚡',
    gradient: 'from-blue-500 to-indigo-600',
    tier: 'novice',
    condition_value: 100,
    xp_reward: 100,
    rarity: '64.2%',
  },
  {
    id: 'game-explorer',
    title: 'Game Explorer',
    description: 'Play 5 different games across the Spielcade catalog',
    icon: '🗺️',
    gradient: 'from-sky-500 to-cyan-600',
    tier: 'novice',
    condition_value: 5,
    xp_reward: 150,
    rarity: '48.9%',
  },
  {
    id: 'critic-choice',
    title: "Critic's Eye",
    description: 'Write your first community review helping fellow players',
    icon: '✍️',
    gradient: 'from-fuchsia-500 to-pink-600',
    tier: 'novice',
    condition_value: 1,
    xp_reward: 100,
    rarity: '32.1%',
  },
  {
    id: 'high-roller',
    title: 'High Roller',
    description: 'Reach a score of 1,000 points in any game',
    icon: '🎲',
    gradient: 'from-amber-500 to-yellow-600',
    tier: 'adept',
    condition_value: 1000,
    xp_reward: 250,
    rarity: '27.5%',
  },
  {
    id: 'level-up',
    title: 'Rising Star',
    description: 'Reach Player Level 5 through continuous gaming and high scores',
    icon: '⭐',
    gradient: 'from-purple-500 to-indigo-600',
    tier: 'adept',
    condition_value: 5,
    xp_reward: 300,
    rarity: '21.0%',
  },
  {
    id: 'streak-starter',
    title: 'Streak Starter',
    description: 'Maintain a consecutive 3-day daily gaming streak',
    icon: '🔥',
    gradient: 'from-orange-500 to-red-600',
    tier: 'adept',
    condition_value: 3,
    xp_reward: 200,
    rarity: '18.4%',
  },
  {
    id: 'friendly-rival',
    title: 'Rivalry Ignited',
    description: 'Send a high-score challenge link to a friend or rival',
    icon: '⚔️',
    gradient: 'from-indigo-600 via-purple-600 to-pink-500',
    tier: 'adept',
    condition_value: 1,
    xp_reward: 150,
    rarity: '15.2%',
  },
  {
    id: 'arcade-legend',
    title: 'Arcade Legend',
    description: 'Score an epic 10,000 points in any arcade title',
    icon: '🏆',
    gradient: 'from-amber-400 to-rose-600',
    tier: 'master',
    condition_value: 10000,
    xp_reward: 500,
    rarity: '8.3%',
  },
  {
    id: 'library-master',
    title: 'Library Master',
    description: 'Play 20 unique games across multiple genres',
    icon: '📚',
    gradient: 'from-violet-500 to-purple-700',
    tier: 'master',
    condition_value: 20,
    xp_reward: 400,
    rarity: '6.7%',
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable Gamer',
    description: 'Keep an active 7-day daily streak without missing a day',
    icon: '🚀',
    gradient: 'from-rose-500 to-pink-600',
    tier: 'master',
    condition_value: 7,
    xp_reward: 500,
    rarity: '4.1%',
  },
  {
    id: 'elite-veteran',
    title: 'Elite Veteran',
    description: 'Reach Player Level 10 and join the top 1% of Spielcade gamers',
    icon: '👑',
    gradient: 'from-yellow-400 via-amber-500 to-orange-600',
    tier: 'grandmaster',
    condition_value: 10,
    xp_reward: 750,
    rarity: '1.8%',
  }
];

export default async function AchievementsHubPage({
  searchParams,
}: {
  searchParams?: { tier?: string };
}) {
  const supabase = createClient();
  const selectedTier = searchParams?.tier || 'all';

  // Check if visitor is authenticated
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  let earnedIds = new Set<string>();
  if (user) {
    const { data: earnedRows } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id);
    (earnedRows || []).forEach((r: any) => earnedIds.add(r.achievement_id));
  }

  // Fetch all achievements from database or use pre-seeded list
  const { data: dbAchievements } = await supabase
    .from('achievements')
    .select('*')
    .order('xp_reward', { ascending: true });

  const achievementsList = (dbAchievements && dbAchievements.length > 0)
    ? dbAchievements.map((dbA: any) => {
        const seed = DEFAULT_ACHIEVEMENTS.find(s => s.id === dbA.id);
        return {
          ...dbA,
          rarity: seed?.rarity || '12.5%',
        };
      })
    : DEFAULT_ACHIEVEMENTS;

  // Filter by tier if requested
  const filteredAchievements = selectedTier === 'all'
    ? achievementsList
    : achievementsList.filter(a => a.tier === selectedTier);

  // Fetch Top 5 Achievement Hunters
  const { data: topProfiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, xp, level')
    .order('xp', { ascending: false })
    .limit(5);

  const TIERS = [
    { id: 'all', label: 'All Trophies' },
    { id: 'novice', label: 'Novice (Bronze)' },
    { id: 'adept', label: 'Adept (Silver)' },
    { id: 'master', label: 'Master (Gold)' },
    { id: 'grandmaster', label: 'Grandmaster (Mythic)' },
  ];

  const totalXpPool = achievementsList.reduce((acc, a) => acc + (a.xp_reward || 0), 0);

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Spielcade Gamer Achievements & Badges",
    "description": "Public trophy showcase and badge mastery progression on Spielcade.",
    "numberOfItems": achievementsList.length,
    "itemListElement": achievementsList.map((ach, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": ach.title,
      "description": ach.description,
    }))
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060714] text-gray-900 dark:text-white py-8 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-[#6366F1] transition-colors">Home</Link>
          <ChevronRight size={13} />
          <span className="text-gray-900 dark:text-white">Achievements</span>
        </div>

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1B4B] via-[#0F1026] to-[#0A0B1A] border border-indigo-500/20 p-8 sm:p-12 shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-4 backdrop-blur-md">
              <Trophy size={14} className="text-yellow-400" />
              <span>Spielcade Gamer Progression Hall</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-outfit text-white tracking-tight leading-tight">
              Trophy Room & Global Achievements
            </h1>

            <p className="text-sm sm:text-base text-gray-300 mt-3 leading-relaxed">
              Unlock exclusive badges, earn gamer XP, and climb the global Hall of Fame by mastering free browser games. Every score, streak, and review counts toward your Gamer Level!
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-8 pt-8 border-t border-white/10">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-white font-outfit">{achievementsList.length}</span>
                <span className="block text-xs font-semibold text-gray-400 mt-0.5">Badges Available</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-outfit">+{totalXpPool.toLocaleString()}</span>
                <span className="block text-xs font-semibold text-gray-400 mt-0.5">Total XP Bounty</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-outfit">Level 10</span>
                <span className="block text-xs font-semibold text-gray-400 mt-0.5">Max Mastery Cap</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout (Grid + Hall of Fame Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left / Center: Achievements Gallery (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {TIERS.map(tier => {
                const isActive = selectedTier === tier.id;
                return (
                  <Link
                    key={tier.id}
                    href={tier.id === 'all' ? '/achievements' : `/achievements?tier=${tier.id}`}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/25 scale-100'
                        : 'bg-white dark:bg-[#111228] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/5'
                    }`}
                  >
                    {tier.label}
                  </Link>
                );
              })}
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredAchievements.map(ach => {
                const isEarned = earnedIds.has(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`relative bg-white dark:bg-[#111228] border rounded-2xl p-5 shadow-sm transition-all duration-300 flex flex-col justify-between group hover:shadow-xl ${
                      isEarned
                        ? 'border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/10'
                        : 'border-gray-200 dark:border-white/5 hover:border-indigo-500/30'
                    }`}
                  >
                    {/* Top Row: Icon + XP Badge */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${ach.gradient} flex items-center justify-center text-2xl shadow-lg shrink-0 group-hover:scale-105 transition-transform`}>
                        {ach.icon}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          +{ach.xp_reward} XP
                        </span>

                        {isEarned ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={11} /> Unlocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                            <Lock size={10} /> Incomplete
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle: Title & Description */}
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
                          {ach.title}
                        </h3>
                        <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                          {ach.tier}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                        {ach.description}
                      </p>
                    </div>

                    {/* Bottom: Rarity Meter */}
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                      <span>Global Rarity:</span>
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {ach.rarity} of players
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Play CTA Bar */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <h4 className="text-lg font-bold font-outfit">Ready to unlock your next badge?</h4>
                <p className="text-xs text-white/80 mt-0.5">Jump into hundreds of instant browser games with zero downloads.</p>
              </div>
              <Link
                href="/games"
                className="px-5 py-2.5 bg-white text-indigo-600 hover:bg-gray-100 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all self-start sm:self-auto shrink-0"
              >
                Browse Games →
              </Link>
            </div>

          </div>

          {/* Right: Hall of Fame Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Top Hunters Card */}
            <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Crown size={20} className="text-amber-400" />
                <h3 className="text-lg font-bold font-outfit text-gray-900 dark:text-white">
                  Top Achievement Hunters
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                Gamers with the highest platform XP and total trophies unlocked.
              </p>

              <div className="space-y-3">
                {(topProfiles || []).map((prof: any, idx: number) => {
                  const rankColors = [
                    'bg-amber-400 text-black',
                    'bg-gray-300 text-black',
                    'bg-amber-700 text-white',
                  ];
                  const badgeStyle = rankColors[idx] || 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300';

                  return (
                    <Link
                      key={prof.id}
                      href={`/profile/${prof.username || prof.id}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${badgeStyle}`}>
                          {idx + 1}
                        </span>

                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {prof.username ? prof.username.substring(0, 2).toUpperCase() : 'GM'}
                        </div>

                        <div>
                          <span className="text-xs font-bold text-gray-900 dark:text-white block truncate max-w-[120px]">
                            {prof.username || 'Gamer'}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Level {prof.level || 1}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-amber-500">
                          {(prof.xp || 0).toLocaleString()} XP
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5">
                <Link
                  href="/leaderboard"
                  className="w-full py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trophy size={13} /> View Full Leaderboard
                </Link>
              </div>
            </div>

            {/* How It Works Box */}
            <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="text-sm font-bold font-outfit text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles size={16} className="text-[#6366F1]" /> How Achievements Work
              </h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">1.</span>
                  <span><strong>Play & Score:</strong> Meet single-session high score targets and milestones.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 font-bold">2.</span>
                  <span><strong>Build Streaks:</strong> Come back daily to rack up multiplier XP and unlock streak badges.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 font-bold">3.</span>
                  <span><strong>Review & Challenge:</strong> Write reviews and send friend challenges to earn social badges.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
