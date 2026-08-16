export const runtime = 'edge';
import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Trophy, Gamepad2, Star, Flame, ArrowLeft, Edit3 } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { username } = params;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, bio, avatar_url, role')
    .eq('username', username)
    .single();

  if (!profile) {
    return {
      title: `User Not Found | Spielcade`,
      robots: { index: false, follow: false },
    };
  }

  const { count: publishedGamesCount } = await supabase
    .from('games')
    .select('id', { count: 'exact', head: true })
    .eq('developer_id', profile.id)
    .eq('status', 'active');

  const isIndexableDeveloper = (publishedGamesCount || 0) > 0;
  const shouldIndex = isIndexableDeveloper;
  
  const displayName = profile.full_name || profile.username;
  const canonicalUrl = `https://spielcade.com/profile/${profile.username}`;

  const pageTitle = isIndexableDeveloper
    ? `${displayName} (@${profile.username}) — Game Developer on Spielcade`
    : `${displayName} (@${profile.username}) | Spielcade`;

  let totalPlays = 0;
  if (isIndexableDeveloper) {
     const { data: devGames } = await supabase.from('games').select('total_plays').eq('developer_id', profile.id).eq('status', 'active');
     totalPlays = (devGames || []).reduce((acc: number, curr: any) => acc + (Number(curr.total_plays) || 0), 0);
  }

  const rawDescription = isIndexableDeveloper
    ? `${displayName} has published ${publishedGamesCount} games on Spielcade with ${totalPlays.toLocaleString()} total plays. ${profile.bio ?? ""}`.trim()
    : `View ${displayName}'s profile, achievements, and game stats on Spielcade.`;

  const pageDescription = rawDescription.length > 160
    ? rawDescription.slice(0, 157).trimEnd() + "..."
    : rawDescription;

  const ogImage = profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}&backgroundColor=b6e3f4`;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: shouldIndex,
      follow: true, 
      googleBot: {
        index: shouldIndex,
        follow: true,
      },
    },
    openGraph: shouldIndex ? {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName: 'Spielcade',
      type: 'profile',
      images: [
        {
          url: ogImage,
          width: 400,
          height: 400,
          alt: `${displayName}'s profile picture`,
        },
      ],
    } : undefined,
  };
}

function DeveloperJsonLd({ profile, totalPlays }: { profile: any, totalPlays: number }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    dateModified: new Date().toISOString(),
    mainEntity: {
      "@type": "Person",
      name: profile.full_name || profile.username,
      alternateName: profile.username,
      image: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}&backgroundColor=b6e3f4`,
      description: profile.bio,
      url: `https://spielcade.com/profile/${profile.username}`,
      memberOf: {
        "@type": "Organization",
        name: "Spielcade",
        url: "https://spielcade.com",
      },
      interactionStatistic: {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/PlayAction",
        userInteractionCount: totalPlays,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

import FollowButton from '@/components/profile/FollowButton';

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient();
  const { username } = params;

  // Get the profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, bio, avatar_url, banner_url, xp, level, streak, created_at')
    .eq('username', username)
    .single();

  if (!profile) notFound();

  // Check if viewing own profile
  const { data: { user } } = await supabase.auth.getUser();
  const isOwnProfile = user?.id === profile.id;
  const viewerId = user?.id;

  // Followers & Following Stats
  const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
    supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
  ]);

  let isFollowing = false;
  if (viewerId && !isOwnProfile) {
    const { data: followData } = await supabase
      .from('user_follows')
      .select('follower_id')
      .eq('follower_id', viewerId)
      .eq('following_id', profile.id)
      .single();
    if (followData) isFollowing = true;
  }

  // Scores
  const { data: scores } = await supabase
    .from('scores')
    .select('id, score, created_at, games(id, title, slug, image_url)')
    .eq('user_id', profile.id)
    .order('score', { ascending: false })
    .limit(5);

  const typedScores = (scores || []) as any[];
  const totalScore = typedScores.reduce((a: number, s: any) => a + (s.score || 0), 0);
  const uniqueGames = new Set(typedScores.map((s: any) => s.game_id)).size;

  // Achievements
  const { data: earnedRows } = await supabase
    .from('user_achievements')
    .select('achievements(id, title, icon, gradient)')
    .eq('user_id', profile.id)
    .limit(6);

  const earnedAchievements = (earnedRows || [])
    .map((r: any) => r.achievements)
    .filter(Boolean);

  const xp = profile.xp ?? 0;
  const level = profile.level ?? 1;
  const xpProgress = Math.min(100, Math.round(((xp % 1000) / 1000) * 100));
  const avatarUrl = profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}&backgroundColor=b6e3f4`;

  // Determine if indexable developer
  const { data: devGames } = await supabase.from('games').select('total_plays').eq('developer_id', profile.id).eq('status', 'active');
  const isIndexableDeveloper = devGames && devGames.length > 0;
  const totalDevPlays = (devGames || []).reduce((acc: number, curr: any) => acc + (Number(curr.total_plays) || 0), 0);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0B1A] text-gray-900 dark:text-white pt-20 pb-20">
      {isIndexableDeveloper && <DeveloperJsonLd profile={profile} totalPlays={totalDevPlays} />}
      {/* Back button */}
      <div className="container mx-auto px-4 max-w-4xl py-4">
        <Link href="/games" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Back to Games
        </Link>
      </div>

      <div className="container mx-auto px-4 max-w-4xl flex flex-col gap-6">

        {/* Profile Card */}
        <div className="bg-white dark:bg-[#111228]/80 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
          {/* Banner */}
          <div className={`w-full h-36 ${profile.banner_url ? '' : 'bg-gradient-to-r from-[#6366F1] via-purple-600 to-blue-600'}`}>
            {profile.banner_url && <img src={profile.banner_url} alt="" className="w-full h-full object-cover" />}
          </div>

          <div className="px-6 pb-6">
            <div className="flex items-end justify-between gap-4 -mt-10 mb-4">
              <div className="w-20 h-20 rounded-full border-4 border-white dark:border-[#111228] bg-gray-100 dark:bg-[#0A0B1A] overflow-hidden shadow-lg shrink-0">
                <img src={avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className="px-3 py-1 bg-[#6366F1]/20 text-[#6366F1] text-xs font-bold rounded-full">
                  Level {level}
                </span>
                
                {!isOwnProfile && viewerId && (
                  <FollowButton 
                    targetUserId={profile.id} 
                    targetUsername={profile.username} 
                    initialIsFollowing={isFollowing} 
                  />
                )}
                
                {isOwnProfile && (
                  <Link
                    href="/profile"
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#6366F1] text-white text-xs font-bold rounded-xl hover:bg-[#4F46E5] transition-colors"
                  >
                    <Edit3 size={12} /> Edit Profile
                  </Link>
                )}
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile.full_name || profile.username}
            </h1>
            <p className="text-sm text-gray-400 mb-2">@{profile.username}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mt-2 mb-3">
              <div className="flex gap-1.5 items-center hover:text-[#6366F1] transition-colors cursor-pointer">
                <span className="font-bold text-gray-900 dark:text-white">{followersCount || 0}</span> Followers
              </div>
              <div className="flex gap-1.5 items-center hover:text-[#6366F1] transition-colors cursor-pointer">
                <span className="font-bold text-gray-900 dark:text-white">{followingCount || 0}</span> Following
              </div>
            </div>

            {profile.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl">{profile.bio}</p>
            )}
            <p className="text-xs text-gray-400 mt-3">
              Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>

            {/* XP Bar */}
            <div className="mt-4 max-w-xs">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>XP Progress</span>
                <span className="font-semibold">{xp.toLocaleString()} / {(level * 1000).toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-[#0A0B1A] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#6366F1] to-purple-500 rounded-full" style={{ width: `${xpProgress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Gamepad2, label: 'Games Played', value: uniqueGames, color: 'text-[#6366F1]', bg: 'bg-[#6366F1]/10' },
            { icon: Star,     label: 'Total Score',  value: totalScore.toLocaleString(), color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { icon: Trophy,   label: 'Achievements', value: earnedAchievements.length,   color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
            { icon: Flame,    label: 'Day Streak',   value: profile.streak ?? 0,          color: 'text-orange-500', bg: 'bg-orange-500/10' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-[#111228]/80 border border-gray-200 dark:border-white/5 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-lg font-black text-gray-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Scores */}
          <div className="bg-white dark:bg-[#111228]/80 border border-gray-200 dark:border-white/5 rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Scores</h2>
            {typedScores.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No scores yet</p>
            ) : (
              <div className="flex flex-col divide-y divide-gray-100 dark:divide-white/5">
                {typedScores.map((s: any, i: number) => (
                  <div key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className={`text-sm font-black w-5 text-center ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-gray-400'}`}>
                      {i + 1}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#0A0B1A] overflow-hidden shrink-0">
                      <img src={s.games?.image_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${s.games?.slug}`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{s.games?.title || 'Unknown'}</p>
                    </div>
                    <span className="text-sm font-black text-[#6366F1]">{s.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="bg-white dark:bg-[#111228]/80 border border-gray-200 dark:border-white/5 rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Achievements</h2>
            {earnedAchievements.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No achievements yet</p>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {earnedAchievements.map((ach: any) => (
                  <div key={ach.id} className="flex flex-col items-center text-center" title={ach.title}>
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${ach.gradient} flex items-center justify-center mb-1.5 shadow-lg`}
                      style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                    >
                      <span className="text-2xl">{ach.icon}</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-900 dark:text-white leading-tight">{ach.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
