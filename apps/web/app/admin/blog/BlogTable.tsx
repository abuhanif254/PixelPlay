'use client';
import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Filter, MoreVertical, Edit2, Trash2,
  Eye, EyeOff, FileText, X, AlertTriangle, ChevronLeft, ChevronRight, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createBlogPost, updateBlogPost, deleteBlogPost, togglePublishStatus } from './actions';

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  tags: string[];
  status: 'published' | 'draft';
  views: number;
  read_time: number;
  author: string;
  author_id: string;
  author_avatar: string;
  created_at: string;
  updated_at: string;
};

const PAGE_SIZE = 10;

const inputCls = 'w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#6366F1] transition-colors';

// ─── Post Form Modal ────────────────────────────────────────────────────────────
function PostFormModal({
  post,
  onClose,
  onSave,
}: {
  post: Post | null;
  onClose: () => void;
  onSave: (p: Post) => void;
}) {
  const isEditing = !!post;
  const [form, setForm] = useState(post ?? {
    id: '', title: '', slug: '', content: '', excerpt: '', cover_image: '',
    tags: [] as string[], status: 'draft' as const, views: 0, read_time: 5,
    author: '', author_id: '', author_avatar: '', created_at: '', updated_at: ''
  });
  const [tagInput, setTagInput] = useState((post?.tags ?? []).join(', '));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
    const data = { title: form.title, content: form.content, excerpt: form.excerpt, cover_image: form.cover_image, tags, status: form.status };

    let res;
    if (isEditing) {
      res = await updateBlogPost(form.id, data);
    } else {
      res = await createBlogPost(data);
    }

    if (res.success) {
      onSave({ ...form, tags, updated_at: new Date().toISOString() });
      onClose();
    } else {
      setError((res as any).error || 'Failed to save');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-[#111228] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/5 shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Edit Article' : 'Write New Article'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><X size={18} /></button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
          {/* Status toggle at top */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/5">
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Publish immediately?</span>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, status: f.status === 'published' ? 'draft' : 'published' }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.status === 'published' ? 'bg-[#6366F1]' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${form.status === 'published' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`text-xs font-bold ${form.status === 'published' ? 'text-[#6366F1]' : 'text-gray-400'}`}>
              {form.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Title *</label>
            <input required type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputCls} placeholder="Enter article title" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Excerpt (shown in previews)</label>
            <textarea rows={2} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} className={`${inputCls} resize-none`} placeholder="A short summary of the article..." />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Cover Image URL</label>
            <input type="url" value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} className={inputCls} placeholder="https://example.com/cover.jpg" />
            {form.cover_image && (
              <div className="mt-2 w-full h-32 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
                <img src={form.cover_image} alt="Cover preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Tags (comma-separated)</label>
            <div className="relative">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} className={`${inputCls} pl-8`} placeholder="gaming, strategy, guide" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Content (Markdown) *</label>
            <textarea
              required
              rows={12}
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              className={`${inputCls} resize-none font-mono text-xs`}
              placeholder={`# Main Heading\n\nWrite your content here in Markdown format...\n\n## Subheading\n\nParagraph text...`}
            />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-500/10 rounded-xl px-3 py-2">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 font-bold text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 rounded-xl bg-[#6366F1] text-white font-bold text-sm hover:bg-[#4F46E5] transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : (form.status === 'published' ? 'Publish Article' : 'Save as Draft')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Delete Confirmation ────────────────────────────────────────────────────────
function DeleteConfirm({ post, onClose, onConfirm }: { post: Post; onClose: () => void; onConfirm: () => void }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#111228] rounded-2xl p-6 max-w-sm w-full border border-gray-200 dark:border-white/10 shadow-2xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Article?</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Permanently delete <span className="font-bold text-gray-900 dark:text-white">"{post.title}"</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 font-bold text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
          <button
            onClick={async () => { setLoading(true); await onConfirm(); setLoading(false); }}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main BlogTable Component ───────────────────────────────────────────────────
export default function BlogTable({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = posts;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter);
    return result;
  }, [posts, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleToggle = async (post: Post) => {
    const optimisticStatus = post.status === 'published' ? 'draft' : 'published';
    setPosts(ps => ps.map(p => p.id === post.id ? { ...p, status: optimisticStatus } : p));
    setActiveMenu(null);
    await togglePublishStatus(post.id, post.status);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteBlogPost(deleteTarget.id);
    setPosts(ps => ps.filter(p => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleSave = (updated: Post) => {
    if (posts.find(p => p.id === updated.id)) {
      setPosts(ps => ps.map(p => p.id === updated.id ? updated : p));
    } else {
      setPosts(ps => [updated, ...ps]);
    }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900 dark:text-white tracking-tight mb-1">Blog Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {posts.length} articles · {posts.filter(p => p.status === 'published').length} published
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#10B981] text-white rounded-xl text-sm font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
          >
            <Plus size={16} /> New Article
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="flex-1 flex items-center bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl px-4 py-3 shadow-sm focus-within:border-[#10B981]/50 transition-colors">
          <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title or author..."
            className="bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none w-full"
          />
          {search && <button onClick={() => setSearch('')} className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={14} /></button>}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(v => !v)}
            className={`flex items-center gap-2 px-4 py-3 bg-white dark:bg-[#111228]/80 border rounded-2xl text-sm font-semibold transition-colors ${statusFilter !== 'all' ? 'border-[#10B981] text-[#10B981]' : 'border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
          >
            <Filter size={16} />
            {statusFilter === 'all' ? 'Filter' : statusFilter === 'published' ? 'Published' : 'Drafts'}
          </button>
          <AnimatePresence>
            {showFilterMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                className="absolute right-0 top-14 w-40 bg-white dark:bg-[#1A1C3D] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-20"
              >
                {(['all', 'published', 'draft'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setShowFilterMenu(false); setPage(1); }}
                    className={`w-full flex items-center px-4 py-2.5 text-sm font-medium transition-colors ${statusFilter === s ? 'bg-[#10B981]/10 text-[#10B981]' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                  >
                    {s === 'all' ? 'All Posts' : s === 'published' ? 'Published' : 'Drafts'}
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
                {['Article', 'Author', 'Tags', 'Date', 'Status', 'Views', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${i === 6 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {paged.map(post => (
                <tr key={post.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {post.cover_image ? (
                        <div className="w-12 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-200 dark:border-white/5">
                          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-10 rounded-lg bg-gray-100 dark:bg-[#0A0B1A] flex items-center justify-center shrink-0 border border-gray-200 dark:border-white/5 text-gray-400">
                          <FileText size={18} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white max-w-[220px] truncate">{post.title}</p>
                        {post.excerpt && <p className="text-xs text-gray-400 max-w-[220px] truncate">{post.excerpt}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{post.author}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(post.tags ?? []).slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-full text-[10px] font-medium">{tag}</span>
                      ))}
                      {(post.tags ?? []).length > 2 && <span className="text-[10px] text-gray-400">+{post.tags.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{new Date(post.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${post.status === 'published'
                      ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-500 border border-green-200 dark:border-green-500/20'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-500/20'
                    }`}>
                      {post.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-medium">{(post.views ?? 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === post.id ? null : post.id)}
                      className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                    <AnimatePresence>
                      {activeMenu === post.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-12 top-10 w-52 bg-white dark:bg-[#1A1C3D] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-20 text-left"
                        >
                          <button
                            onClick={() => { setEditPost(post); setActiveMenu(null); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                          >
                            <Edit2 size={15} /> Edit Article
                          </button>
                          <button
                            onClick={() => handleToggle(post)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                          >
                            {post.status === 'published' ? <EyeOff size={15} /> : <Eye size={15} />}
                            {post.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                          <div className="h-px bg-gray-100 dark:bg-white/5 w-full my-1" />
                          <button
                            onClick={() => { setDeleteTarget(post); setActiveMenu(null); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={15} /> Delete Article
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {search || statusFilter !== 'all' ? 'No articles match your filters.' : 'No articles yet. Write your first article!'}
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
        {(showNewModal || editPost) && (
          <PostFormModal
            post={editPost}
            onClose={() => { setShowNewModal(false); setEditPost(null); }}
            onSave={handleSave}
          />
        )}
        {deleteTarget && <DeleteConfirm post={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}
      </AnimatePresence>
    </div>
  );
}
