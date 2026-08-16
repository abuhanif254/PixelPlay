'use client';
import React, { useState } from 'react';
import { Save, User, AlertTriangle, Trash2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateAdminProfile, clearGameScores } from './actions';

type AdminProfile = { id: string; email: string; username: string; full_name: string; avatar_url: string };
type Game = { id: string; title: string; slug: string; total_plays: number };

const inputCls = 'w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#6366F1] transition-colors';

function SuccessBanner({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl text-green-700 dark:text-green-400"
    >
      <CheckCircle size={18} />
      <span className="text-sm font-medium flex-1">{message}</span>
      <button onClick={onClose} className="text-green-500 hover:text-green-700 dark:hover:text-green-300 text-lg font-bold">×</button>
    </motion.div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-gray-100 dark:border-white/5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function SettingsForm({ adminProfile, games }: { adminProfile: AdminProfile; games: Game[] }) {
  const [profile, setProfile] = useState(adminProfile);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [clearTarget, setClearTarget] = useState<Game | null>(null);
  const [clearing, setClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState('');

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError('');
    const res = await updateAdminProfile({
      username: profile.username,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
    });
    if (res.success) {
      setProfileSuccess('Profile updated successfully!');
    } else {
      setProfileError((res as any).error || 'Failed to update profile');
    }
    setSavingProfile(false);
  };

  const handleClearScores = async () => {
    if (!clearTarget) return;
    setClearing(true);
    const res = await clearGameScores(clearTarget.id);
    if (res.success) {
      setClearSuccess(`All scores for "${clearTarget.title}" have been cleared.`);
      setClearTarget(null);
    }
    setClearing(false);
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold font-outfit text-gray-900 dark:text-white tracking-tight mb-1">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your admin profile and platform configuration.</p>
      </div>

      {/* Admin Profile Section */}
      <Section title="Admin Profile" description="Update your display name, username, and avatar shown across the platform.">
        <form onSubmit={handleProfileSave} className="flex flex-col gap-5">

          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-[#0A0B1A] shrink-0">
              <img
                src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Avatar URL</label>
              <input
                type="url"
                value={profile.avatar_url}
                onChange={e => setProfile(p => ({ ...p, avatar_url: e.target.value }))}
                className={inputCls}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Username</label>
              <input
                type="text"
                value={profile.username}
                onChange={e => setProfile(p => ({ ...p, username: e.target.value }))}
                className={inputCls}
                placeholder="admin_user"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                className={inputCls}
                placeholder="Your Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Email (read-only)</label>
            <input type="email" value={profile.email} readOnly className={`${inputCls} opacity-60 cursor-not-allowed`} />
          </div>

          <AnimatePresence>
            {profileSuccess && <SuccessBanner message={profileSuccess} onClose={() => setProfileSuccess('')} />}
          </AnimatePresence>
          {profileError && <p className="text-sm text-red-500 bg-red-500/10 rounded-xl px-3 py-2">{profileError}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#6366F1] text-white font-bold text-sm rounded-xl hover:bg-[#4F46E5] transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </Section>

      {/* Platform Info */}
      <Section title="Platform Info" description="Read-only overview of your deployment configuration.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Hosting', value: 'Cloudflare Pages' },
            { label: 'Backend', value: 'Supabase' },
            { label: 'Framework', value: 'Next.js 14 (App Router)' },
            { label: 'Plugin System', value: 'Spielcade Game Registry' },
          ].map(item => (
            <div key={item.label} className="flex flex-col p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/5">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Danger Zone */}
      <Section title="⚠️ Danger Zone" description="Irreversible actions. Proceed with caution.">
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {clearSuccess && <SuccessBanner message={clearSuccess} onClose={() => setClearSuccess('')} />}
          </AnimatePresence>

          <div className="p-4 border border-red-200 dark:border-red-500/20 rounded-xl bg-red-50/50 dark:bg-red-500/5">
            <h3 className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">Clear Game Scores</h3>
            <p className="text-xs text-red-600/70 dark:text-red-400/70 mb-3">Permanently delete all leaderboard scores for a specific game. This cannot be undone.</p>
            <div className="flex items-center gap-3">
              <select
                className="flex-1 bg-white dark:bg-black/20 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none"
                value={clearTarget?.id || ''}
                onChange={e => {
                  const game = games.find(g => g.id === e.target.value);
                  setClearTarget(game || null);
                }}
              >
                <option value="">Select a game...</option>
                {games.map(g => (
                  <option key={g.id} value={g.id}>{g.title} ({g.total_plays} plays)</option>
                ))}
              </select>
              <button
                onClick={() => clearTarget && handleClearScores()}
                disabled={!clearTarget || clearing}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-bold text-sm rounded-xl hover:bg-red-600 transition-colors disabled:opacity-40 whitespace-nowrap"
              >
                <Trash2 size={15} />
                {clearing ? 'Clearing...' : 'Clear Scores'}
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {clearTarget && clearing === false && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setClearTarget(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-[#111228] rounded-2xl p-6 max-w-sm w-full border border-gray-200 dark:border-white/10 shadow-2xl text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Clear All Scores?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                This will permanently delete all scores for <span className="font-bold text-gray-900 dark:text-white">"{clearTarget.title}"</span>. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setClearTarget(null)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 font-bold text-gray-600 dark:text-gray-400 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5">Cancel</button>
                <button
                  onClick={handleClearScores}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors"
                >
                  Yes, Clear
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
