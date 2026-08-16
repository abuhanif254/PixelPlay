'use client';
import React, { useState } from 'react';
import { Edit3, Gamepad2, Star, Trophy, Flame, X, Camera, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateProfile } from '../../app/profile/actions';

type ProfileData = {
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  banner_url: string;
  xp: number;
  level: number;
  streak: number;
};

type HeroProps = {
  profile: ProfileData;
  gamesPlayed: number;
  gamesThisWeek: number;
  gamesPrevWeek: number;
  totalScore: number;
  totalScoreThisWeek: number;
  totalScorePrevWeek: number;
  highestScore: number;
  earnedCount: number;
  totalAchievements: number;
};

function Delta({ current, previous, suffix = '' }: { current: number; previous: number; suffix?: string }) {
  if (previous === 0 && current === 0) return <span className="text-gray-400 text-xs">No activity</span>;
  if (previous === 0) return <span className="text-green-500 text-xs font-bold">New this week!</span>;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return <span className="text-gray-400 text-xs">Same as last week</span>;
  return (
    <span className={`text-xs font-bold ${pct > 0 ? 'text-green-500' : 'text-red-400'}`}>
      {pct > 0 ? '▲' : '▼'} {Math.abs(pct)}% {suffix}
    </span>
  );
}

const inputCls = 'w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#6366F1] transition-colors';

import { createClient } from '@/lib/supabase/client';

export default function ProfileHero({
  profile, gamesPlayed, gamesThisWeek, gamesPrevWeek,
  totalScore, totalScoreThisWeek, totalScorePrevWeek,
  highestScore, earnedCount, totalAchievements,
}: HeroProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    username: profile.username || '',
    full_name: profile.full_name || '',
    bio: profile.bio || '',
    avatar_url: profile.avatar_url || '',
    banner_url: profile.banner_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const supabase = createClient();
  const achievementPct = totalAchievements > 0 ? Math.round((earnedCount / totalAchievements) * 100) : 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 200KB limit check (204800 bytes)
    if (file.size > 204800) {
      setError(`The selected ${type} is too large. Max size is 200KB.`);
      e.target.value = ''; // reset input
      return;
    }
    setError('');
    
    if (type === 'avatar') {
      setAvatarFile(file);
      // Create local preview URL
      setForm(f => ({ ...f, avatar_url: URL.createObjectURL(file) }));
    } else {
      setBannerFile(file);
      // Create local preview URL
      setForm(f => ({ ...f, banner_url: URL.createObjectURL(file) }));
    }
  };

  const uploadFile = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.username}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let finalAvatarUrl = form.avatar_url;
      let finalBannerUrl = form.banner_url;

      if (avatarFile) {
        finalAvatarUrl = await uploadFile(avatarFile, 'avatars');
      }
      if (bannerFile) {
        finalBannerUrl = await uploadFile(bannerFile, 'banners');
      }

      const payload = {
        ...form,
        avatar_url: finalAvatarUrl,
        banner_url: finalBannerUrl,
      };

      const res = await updateProfile(payload);
      if (res.success) {
        setIsModalOpen(false);
        window.location.reload();
      } else {
        setError(res.error || 'Failed to save');
      }
    } catch (err: any) {
      setError(err.message || 'Error uploading file.');
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    {
      label: 'Games Played',
      value: gamesPlayed,
      icon: Gamepad2,
      iconColor: 'text-[#6366F1]',
      iconBg: 'bg-[#6366F1]/20',
      shadow: 'hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] dark:hover:border-[#6366F1]/30',
      extra: <Delta current={gamesThisWeek} previous={gamesPrevWeek} suffix="vs last week" />,
    },
    {
      label: 'Total Score',
      value: totalScore.toLocaleString(),
      icon: Star,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/20',
      shadow: 'hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] dark:hover:border-blue-500/30',
      extra: <Delta current={totalScoreThisWeek} previous={totalScorePrevWeek} suffix="vs last week" />,
    },
    {
      label: 'Achievements',
      value: `${earnedCount} / ${totalAchievements}`,
      icon: Trophy,
      iconColor: 'text-yellow-500',
      iconBg: 'bg-yellow-500/20',
      shadow: 'hover:shadow-[0_8px_30px_rgba(234,179,8,0.15)] dark:hover:border-yellow-500/30',
      extra: <span className="text-gray-400 text-xs">{achievementPct}% completed</span>,
    },
    {
      label: 'Daily Streak',
      value: `${profile.streak} ${profile.streak === 1 ? 'Day' : 'Days'}`,
      icon: Flame,
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-500/20',
      shadow: 'hover:shadow-[0_8px_30px_rgba(249,115,22,0.15)] dark:hover:border-orange-500/30',
      extra: profile.streak >= 7
        ? <span className="text-orange-500 text-xs font-bold">🔥 On fire!</span>
        : profile.streak >= 3
        ? <span className="text-orange-400 text-xs font-bold">Keep it up!</span>
        : <span className="text-gray-400 text-xs">Play daily to build streak</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* Banner + Header */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Banner */}
        <div className={`relative w-full h-32 md:h-40 ${profile.banner_url ? '' : 'bg-gradient-to-r from-[#6366F1] via-purple-600 to-blue-600'}`}>
          {profile.banner_url && (
            <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Profile row below banner */}
        <div className="relative z-10 bg-white dark:bg-[#111228]/80 border border-gray-200 dark:border-white/5 border-t-0 rounded-b-2xl px-6 pb-5">
          <div className="flex items-end justify-between gap-4 -mt-10 mb-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full border-4 border-white dark:border-[#111228] bg-gray-100 dark:bg-[#0A0B1A] overflow-hidden shrink-0 shadow-lg">
              <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
            </div>
            {/* Edit button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="mb-1 flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white text-sm font-bold rounded-xl hover:bg-[#4F46E5] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
            >
              <Edit3 size={14} /> Edit Profile
            </button>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {profile.full_name || profile.username}
            </h1>
            <p className="text-sm text-gray-400">@{profile.username}</p>
            {profile.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 max-w-lg">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`bg-white dark:bg-[#111228]/80 border border-gray-200 dark:border-white/5 rounded-2xl p-5 flex flex-col relative overflow-hidden shadow-sm transition-all ${stat.shadow}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-xl font-black text-gray-900 dark:text-white leading-tight">{stat.value}</p>
              </div>
            </div>
            {stat.extra}
          </motion.div>
        ))}
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#111228] w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6 flex flex-col gap-4 overflow-y-auto">
                {/* Avatar File Input */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-white/10 shrink-0">
                    <img src={form.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.username}`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Avatar Image (Max 200KB)</label>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/webp"
                        onChange={(e) => handleFileChange(e, 'avatar')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white cursor-pointer hover:border-[#6366F1] transition-colors">
                        <Camera size={16} />
                        <span>{avatarFile ? avatarFile.name : 'Choose file...'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banner File Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Banner Image (Max 200KB)</label>
                  <div className="relative mb-2">
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/webp"
                      onChange={(e) => handleFileChange(e, 'banner')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white cursor-pointer hover:border-[#6366F1] transition-colors">
                      <Camera size={16} />
                      <span>{bannerFile ? bannerFile.name : 'Choose file...'}</span>
                    </div>
                  </div>
                  {form.banner_url && (
                    <div className="mt-2 w-full h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
                      <img src={form.banner_url} alt="Banner" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Username *</label>
                    <input required type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Full Name</label>
                    <input type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Bio</label>
                  <textarea rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} className={`${inputCls} resize-none`} placeholder="Tell the world about yourself..." maxLength={200} />
                  <p className="text-[10px] text-gray-400 mt-1">{form.bio.length}/200</p>
                </div>

                {error && <p className="text-sm text-red-500 bg-red-500/10 rounded-xl px-3 py-2">{error}</p>}

                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 font-bold text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6366F1] text-white font-bold text-sm hover:bg-[#4F46E5] transition-colors disabled:opacity-50">
                    <Save size={15} /> {saving ? 'Uploading & Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
