'use client';
import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Filter, MoreVertical, Edit2, Trash2,
  EyeOff, Eye, RefreshCw, X, Star, ChevronLeft, ChevronRight,
  AlertTriangle, Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { syncGames, updateGame, updateGameStatus, deleteGame, addGameManually } from './actions';

type Game = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  status: 'active' | 'draft' | 'maintenance';
  total_plays: number;
  rating: number;
  image_url: string;
  source_url?: string;
  created_at: string;
};

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  active:      { label: 'Active',       cls: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-500 border border-green-200 dark:border-green-500/20' },
  pending:     { label: 'Pending',      cls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-500 border border-blue-200 dark:border-blue-500/20' },
  draft:       { label: 'Draft',        cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-500/20' },
  maintenance: { label: 'Maintenance',  cls: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-500 border border-red-200 dark:border-red-500/20' },
  rejected:    { label: 'Rejected',     cls: 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20' },
};

const CATEGORIES = ['Arcade', 'Puzzle', 'Action', 'Strategy', 'Racing', 'Sports', 'Adventure', 'Simulation', 'Board'];
const PAGE_SIZE = 10;

// ─── Slide-Over Edit Panel ──────────────────────────────────────────────────────
function EditGamePanel({
  game,
  onClose,
  onSave,
}: {
  game: Game | null;
  onClose: () => void;
  onSave: (g: Game) => void;
}) {
  const [form, setForm] = useState(
    game ?? { id: '', title: '', slug: '', description: '', category: 'Arcade', status: 'draft' as const, image_url: '', source_url: '', total_plays: 0, rating: 5.0, created_at: '' }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await updateGame(form.id, {
      title: form.title,
      description: form.description,
      category: form.category,
      image_url: form.image_url,
      source_url: form.source_url,
      status: form.status,
    });
    if (res.success) {
      onSave(form);
    } else {
      setError((res as any).error || 'Failed to save');
    }
    setSaving(false);
  };

  const field = (label: string, node: React.ReactNode) => (
    <div>
      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">{label}</label>
      {node}
    </div>
  );

  const inputCls = 'w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#6366F1] transition-colors';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex"
    >
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-md bg-white dark:bg-[#111228] border-l border-gray-200 dark:border-white/10 flex flex-col shadow-2xl overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Game</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 flex flex-col gap-4 flex-1">
          {/* Preview image */}
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/5">
            <img
              src={form.image_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${form.slug}`}
              alt={form.title}
              className="w-full h-full object-cover"
            />
          </div>

          {field('Title', <input required type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputCls} />)}
          {field('Description', <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={`${inputCls} resize-none`} />)}
          {field('Image URL', <input type="url" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className={inputCls} placeholder="https://..." />)}
          {field('Source URL (Plugin Game)', <input type="url" value={form.source_url || ''} onChange={e => setForm(f => ({ ...f, source_url: e.target.value }))} className={inputCls} placeholder="https://... (Leave empty for internal games)" />)}
          {field('Category', (
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          ))}
          {field('Status', (
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))} className={inputCls}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="maintenance">Maintenance</option>
            </select>
          ))}

          {error && <p className="text-sm text-red-500 bg-red-500/10 rounded-xl px-3 py-2">{error}</p>}

          <div className="flex gap-3 mt-auto pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-white/5 text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 rounded-xl bg-[#6366F1] text-white font-bold text-sm hover:bg-[#4F46E5] transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.aside>
    </motion.div>
  );
}

// ─── Add Game Modal ─────────────────────────────────────────────────────────────
function AddGameModal({ onClose, onAdd }: { onClose: () => void; onAdd: (g: Game) => void }) {
  const [form, setForm] = useState({ title: '', slug: '', description: '', category: 'Arcade', image_url: '', source_url: '', status: 'draft' as const });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const res = await addGameManually({ ...form, slug });
    if (res.success) {
      onAdd({ ...form, slug, id: '', total_plays: 0, rating: 5.0, created_at: new Date().toISOString() });
      onClose();
    } else {
      setError((res as any).error || 'Failed to add game');
    }
    setSaving(false);
  };

  const inputCls = 'w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#6366F1] transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-[#111228] w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Game Manually</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Title *</label>
            <input required type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputCls} placeholder="My Awesome Game" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Slug (auto-generated if empty)</label>
            <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className={inputCls} placeholder="my-awesome-game" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Description</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={`${inputCls} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))} className={inputCls}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Image URL</label>
            <input type="url" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className={inputCls} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Source URL (Plugin Game)</label>
            <input type="url" value={form.source_url} onChange={e => setForm(f => ({ ...f, source_url: e.target.value }))} className={inputCls} placeholder="https://... (Leave empty for internal games)" />
          </div>
          {error && <p className="text-sm text-red-500 bg-red-500/10 rounded-xl px-3 py-2">{error}</p>}
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 font-bold text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 rounded-xl bg-[#6366F1] text-white font-bold text-sm hover:bg-[#4F46E5] transition-colors disabled:opacity-50">
              {saving ? 'Adding...' : 'Add Game'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Delete Confirmation Dialog ─────────────────────────────────────────────────
function DeleteConfirm({ game, onClose, onConfirm }: { game: Game; onClose: () => void; onConfirm: () => void }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => { setLoading(true); await onConfirm(); setLoading(false); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#111228] rounded-2xl p-6 max-w-sm w-full border border-gray-200 dark:border-white/10 shadow-2xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Game?</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Are you sure you want to delete <span className="font-bold text-gray-900 dark:text-white">{game.title}</span>? This will also delete all associated scores. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 font-bold text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={handle} disabled={loading} className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50">
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main GamesTable Component ──────────────────────────────────────────────────
export default function GamesTable({ initialGames, totalCount }: { initialGames: Game[]; totalCount: number }) {
  const [games, setGames] = useState(initialGames);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'draft' | 'maintenance' | 'rejected'>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editGame, setEditGame] = useState<Game | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Game | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = games;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(g => g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q) || g.slug.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      result = result.filter(g => g.status === statusFilter);
    }
    return result;
  }, [games, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSync = async () => {
    setIsSyncing(true);
    const res = await syncGames();
    if (res.success) window.location.reload();
    else alert((res as any).error);
    setIsSyncing(false);
  };

  const handleStatusCycle = async (game: Game) => {
    const cycle: Record<string, 'active' | 'draft' | 'maintenance'> = {
      active: 'draft', draft: 'active', maintenance: 'active'
    };
    const next = cycle[game.status];
    setGames(gs => gs.map(g => g.id === game.id ? { ...g, status: next } : g));
    setActiveMenu(null);
    await updateGameStatus(game.id, next);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteGame(deleteTarget.id);
    setGames(gs => gs.filter(g => g.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleEditSave = (updated: Game) => {
    setGames(gs => gs.map(g => g.id === updated.id ? updated : g));
    setEditGame(null);
  };

  const handleAdd = (newGame: Game) => {
    setGames(gs => [newGame, ...gs]);
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900 dark:text-white tracking-tight mb-1">Games Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{games.length} games registered · {games.filter(g => g.status === 'active').length} active</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/5 rounded-xl text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <Plus size={16} /> Add Manually
          </button>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white rounded-xl text-sm font-bold hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing...' : 'Sync Registry'}
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="flex-1 flex items-center bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl px-4 py-3 shadow-sm focus-within:border-[#6366F1]/50 transition-colors">
          <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title, category, slug..."
            className="bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none w-full"
          />
          {search && <button onClick={() => setSearch('')} className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={14} /></button>}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(v => !v)}
            className={`flex items-center gap-2 px-4 py-3 bg-white dark:bg-[#111228]/80 border rounded-2xl text-sm font-semibold transition-colors ${statusFilter !== 'all' ? 'border-[#6366F1] text-[#6366F1]' : 'border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
          >
            <Filter size={16} />
            {statusFilter !== 'all' ? STATUS_LABELS[statusFilter].label : 'Filter'}
          </button>
          <AnimatePresence>
            {showFilterMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                className="absolute right-0 top-14 w-44 bg-white dark:bg-[#1A1C3D] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-20"
              >
                {(['all', 'pending', 'active', 'draft', 'maintenance', 'rejected'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setShowFilterMenu(false); setPage(1); }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${statusFilter === s ? 'bg-[#6366F1]/10 text-[#6366F1]' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                  >
                    {s === 'all' ? 'All Games' : STATUS_LABELS[s].label}
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
                {['Game', 'Category', 'Status', 'Plays', 'Rating', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {paged.map(game => (
                <tr key={game.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-[#0A0B1A] overflow-hidden shrink-0 border border-gray-200 dark:border-white/5">
                        <img src={game.image_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${game.slug}`} alt={game.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{game.title}</p>
                        <p className="text-xs text-gray-400 font-mono">{game.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{game.category}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_LABELS[game.status]?.cls}`}>
                      {STATUS_LABELS[game.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-medium">{game.total_plays.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white">
                      <Star size={13} className="text-yellow-500 fill-yellow-500" />
                      {game.rating.toFixed(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === game.id ? null : game.id)}
                      className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                    <AnimatePresence>
                      {activeMenu === game.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-12 top-10 w-52 bg-white dark:bg-[#1A1C3D] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-20 text-left"
                        >
                          <button
                            onClick={() => { setEditGame(game); setActiveMenu(null); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                          >
                            <Edit2 size={15} /> Edit Game
                          </button>
                          {game.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => { setActiveMenu(null); updateGameStatus(game.id, 'active'); setGames(gs => gs.map(g => g.id === game.id ? { ...g, status: 'active' as const } : g)); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors"
                              >
                                <Eye size={15} /> Approve Game
                              </button>
                              <button
                                onClick={() => { setActiveMenu(null); updateGameStatus(game.id, 'rejected'); setGames(gs => gs.map(g => g.id === game.id ? { ...g, status: 'rejected' as const } : g)); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
                              >
                                <EyeOff size={15} /> Reject Game
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleStatusCycle(game)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                              >
                                {game.status === 'active' ? <EyeOff size={15} /> : <Eye size={15} />}
                                {game.status === 'active' ? 'Set as Draft' : 'Set as Active'}
                              </button>
                              <button
                                onClick={() => { setActiveMenu(null); updateGameStatus(game.id, 'maintenance'); setGames(gs => gs.map(g => g.id === game.id ? { ...g, status: 'maintenance' as const } : g)); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                              >
                                <Wrench size={15} /> Set Maintenance
                              </button>
                            </>
                          )}
                          <div className="h-px bg-gray-100 dark:bg-white/5 w-full my-1" />
                          <button
                            onClick={() => { setDeleteTarget(game); setActiveMenu(null); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={15} /> Delete Game
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {search || statusFilter !== 'all' ? 'No games match your filters.' : 'No games found. Click "Sync Registry" to import from plugin registry, or "Add Manually".'}
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
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

      {/* Modals */}
      <AnimatePresence>
        {editGame && <EditGamePanel game={editGame} onClose={() => setEditGame(null)} onSave={handleEditSave} />}
        {showAddModal && <AddGameModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />}
        {deleteTarget && <DeleteConfirm game={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}
      </AnimatePresence>
    </div>
  );
}
