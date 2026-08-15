'use client';
import React, { useState, useMemo } from 'react';
import { Search, Filter, X, ChevronLeft, ChevronRight, Shield, User, ExternalLink, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { updateUserRole } from './actions';

type UserProfile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  role: 'user' | 'admin';
  xp: number;
  level: number;
  score_count: number;
  created_at: string;
};

const PAGE_SIZE = 20;

function RoleBadge({ role }: { role: 'user' | 'admin' }) {
  return role === 'admin' ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
      <Shield size={10} /> Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400 border border-gray-200 dark:border-white/10">
      <User size={10} /> User
    </span>
  );
}

function LevelBar({ xp, level }: { xp: number; level: number }) {
  const xpForNextLevel = level * 1000;
  const progress = Math.min(100, (xp % 1000) / 10);
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 shrink-0">
        <Star size={11} className="text-yellow-500 fill-yellow-500" />
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Lv.{level}</span>
      </div>
      <div className="w-20 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#6366F1] to-purple-500 rounded-full" style={{ width: `${progress}%` }} />
      </div>
      <span className="text-[10px] text-gray-400">{xp.toLocaleString()} XP</span>
    </div>
  );
}

export default function UsersTable({ initialUsers }: { initialUsers: UserProfile[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [page, setPage] = useState(1);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u => u.username.toLowerCase().includes(q) || u.full_name.toLowerCase().includes(q));
    }
    if (roleFilter !== 'all') result = result.filter(u => u.role === roleFilter);
    return result;
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleRoleToggle = async (user: UserProfile) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    setTogglingId(user.id);
    const res = await updateUserRole(user.id, newRole);
    if (res.success) {
      setUsers(us => us.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    } else {
      alert((res as any).error || 'Failed to update role');
    }
    setTogglingId(null);
  };

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    newThisWeek: users.filter(u => new Date(u.created_at) > new Date(Date.now() - 7 * 86400000)).length,
  }), [users]);

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900 dark:text-white tracking-tight mb-1">User Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {stats.total} total users · {stats.admins} admins · {stats.newThisWeek} new this week
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: stats.total, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Admins', value: stats.admins, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'New This Week', value: stats.newThisWeek, color: 'text-green-500', bg: 'bg-green-500/10' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#111228]/80 border border-gray-200 dark:border-white/5 rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black ${s.bg} ${s.color}`}>
              {s.value}
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="flex-1 flex items-center bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl px-4 py-3 shadow-sm focus-within:border-[#6366F1]/50 transition-colors">
          <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by username or name..."
            className="bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none w-full"
          />
          {search && <button onClick={() => setSearch('')} className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={14} /></button>}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(v => !v)}
            className={`flex items-center gap-2 px-4 py-3 bg-white dark:bg-[#111228]/80 border rounded-2xl text-sm font-semibold transition-colors ${roleFilter !== 'all' ? 'border-[#6366F1] text-[#6366F1]' : 'border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
          >
            <Filter size={16} />
            {roleFilter === 'all' ? 'Filter' : roleFilter === 'admin' ? 'Admins' : 'Users'}
          </button>
          <AnimatePresence>
            {showFilterMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                className="absolute right-0 top-14 w-40 bg-white dark:bg-[#1A1C3D] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-20"
              >
                {(['all', 'user', 'admin'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => { setRoleFilter(r); setShowFilterMenu(false); setPage(1); }}
                    className={`w-full flex items-center px-4 py-2.5 text-sm font-medium transition-colors ${roleFilter === r ? 'bg-[#6366F1]/10 text-[#6366F1]' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                  >
                    {r === 'all' ? 'All Users' : r === 'admin' ? 'Admins Only' : 'Users Only'}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
                {['User', 'Role', 'Level & XP', 'Scores', 'Joined', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {paged.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-[#0A0B1A]">
                        <img
                          src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">@{user.username}</p>
                        {user.full_name && <p className="text-xs text-gray-400">{user.full_name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                  <td className="px-6 py-4"><LevelBar xp={user.xp} level={user.level} /></td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{user.score_count.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/profile/${user.username}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        title="View Profile"
                      >
                        <ExternalLink size={15} />
                      </Link>
                      <button
                        onClick={() => handleRoleToggle(user)}
                        disabled={togglingId === user.id}
                        title={user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-500/20'
                            : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                        }`}
                      >
                        {togglingId === user.id ? (
                          <span className="animate-pulse">…</span>
                        ) : (
                          <>
                            {user.role === 'admin' ? <><User size={12} /> Demote</> : <><Shield size={12} /> Promote</>}
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {search || roleFilter !== 'all' ? 'No users match your filters.' : 'No users found.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-white/5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${p === page ? 'bg-[#6366F1] text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
