import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SettingsTabs from '@/components/settings/SettingsTabs';
import { Settings, Shield, UserX, Key, Mail } from 'lucide-react';

export const metadata = {
  title: 'Account Settings | Spielcade',
  description: 'Manage your Spielcade account settings.',
};

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05050F] pt-24 pb-20 transition-colors">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center shadow-lg">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white font-outfit tracking-tight">Account Settings</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your security and account preferences</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-[#0A0A1B] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
          <SettingsTabs userEmail={user.email || ''} />
        </div>
        
      </div>
    </div>
  );
}
