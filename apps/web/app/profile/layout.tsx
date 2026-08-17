export const runtime = 'edge';
import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileSidebar from '@/components/profile/ProfileSidebar';

export const metadata: Metadata = {
  title: 'My Profile | Spielcade',
  description: 'Your player profile, stats, achievements and activity.',
};

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user || null;
  
  if (!user) redirect('/login');

  // Fetch basic profile data for the Sidebar
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url, xp, level, streak')
    .eq('id', user.id)
    .single();

  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const xpForCurrentLevel = (level - 1) * 1000;
  const xpForNextLevel = level * 1000;
  const xpProgress = Math.min(100, Math.round(((xp - xpForCurrentLevel) / 1000) * 100));

  const profileData = {
    username: profile?.username || user.email?.split('@')[0] || 'Player',
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'player'}&backgroundColor=b6e3f4`,
    xp,
    level,
    xpProgress,
    xpForNextLevel,
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0B1A] text-gray-900 dark:text-white pt-24 pb-20 relative">
      {/* Ambient glows */}
      <div className="absolute top-[10%] left-[5%] w-[40vw] h-[40vw] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[0%] w-[35vw] h-[35vw] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 xl:px-8 max-w-[1600px] flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* Left Sidebar (Sticky and persistent across tabs) */}
        <div className="hidden lg:block relative">
          <div className="sticky top-24">
            <ProfileSidebar profile={profileData} />
          </div>
        </div>

        {/* Dynamic Page Content */}
        <div className="flex-1 flex flex-col gap-6 w-full overflow-hidden">
          {children}
        </div>
        
      </div>
    </div>
  );
}
