'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Edit3, 
  Trash2, 
  AlertCircle, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  X, 
  Send,
  Sliders,
  Sparkles
} from 'lucide-react';
import { updateDeveloperGame, deleteDeveloperGame } from '@/app/studio/actions';

interface GameRowProps {
  game: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    category: string | null;
    image_url: string | null;
    source_url: string | null;
    status: string;
    total_plays: number | null;
    rating: number | null;
    metadata: any;
  };
}

const CATEGORIES = [
  'Arcade', 
  'Puzzle', 
  'Action', 
  'Strategy', 
  'Racing', 
  'Sports', 
  'Adventure', 
  'Simulation', 
  'Board'
];

export default function StudioGameRowActions({ game }: GameRowProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const meta = game.metadata || {};
  const rejectionReason = meta.rejection_reason || 'Game did not meet quality or embedding standards.';

  const [editForm, setEditForm] = useState({
    title: game.title || '',
    description: game.description || '',
    category: game.category || 'Arcade',
    image_url: game.image_url || '',
    source_url: game.source_url || '',
    aspectRatio: (meta.aspectRatio || '16:9') as '16:9' | '4:3' | '9:16' | 'auto',
    orientation: (meta.orientation || 'landscape') as 'landscape' | 'portrait',
    authorName: meta.developer || '',
    tagsString: Array.isArray(meta.tags) ? meta.tags.join(', ') : '',
    controls: Array.isArray(meta.controls) ? meta.controls : ['Keyboard', 'Mouse']
  });

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    const tags = editForm.tagsString
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const res = await updateDeveloperGame(game.id, {
      title: editForm.title,
      description: editForm.description,
      category: editForm.category,
      image_url: editForm.image_url,
      source_url: editForm.source_url,
      aspectRatio: editForm.aspectRatio,
      orientation: editForm.orientation,
      authorName: editForm.authorName,
      tags,
      controls: editForm.controls
    });

    if (res.success) {
      setIsEditOpen(false);
    } else {
      setErrorMsg(res.error || 'Failed to update game.');
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${game.title}"? This cannot be undone.`)) return;
    setIsDeleting(true);
    const res = await deleteDeveloperGame(game.id);
    if (!res.success) {
      alert(res.error);
    }
    setIsDeleting(false);
  };

  const inputCls = "w-full bg-gray-50 dark:bg-[#0A0B1A] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors";
  const labelCls = "block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider";

  return (
    <div className="flex items-center justify-end gap-2">
      
      {/* Active Game */}
      {game.status === 'active' && (
        <Link
          href={`/games/${game.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors"
        >
          <ExternalLink size={13} /> View Live
        </Link>
      )}

      {/* Pending Game */}
      {game.status === 'pending' && (
        <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10">
          <Clock size={13} /> In Review (~24h)
        </span>
      )}

      {/* Rejected Game */}
      {game.status === 'rejected' && (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsReasonOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 rounded-lg transition-colors"
          >
            <AlertCircle size={13} /> Feedback
          </button>
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Edit3 size={13} /> Fix & Resubmit
          </button>
        </div>
      )}

      {/* Draft Game */}
      {game.status === 'draft' && (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <Edit3 size={13} /> Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
            title="Delete Draft"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Feedback Modal */}
      {isReasonOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-red-500 font-bold">
                <AlertCircle size={18} />
                <h3 className="text-base font-outfit text-gray-900 dark:text-white">Reviewer Feedback</h3>
              </div>
              <button 
                onClick={() => setIsReasonOpen(false)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-mono">
              Submission: {game.title}
            </p>

            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-xs text-red-800 dark:text-red-300 mb-5 leading-relaxed">
              {rejectionReason}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsReasonOpen(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsReasonOpen(false);
                  setIsEditOpen(true);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
              >
                <Edit3 size={13} /> Edit Game & Resubmit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit & Resubmit Drawer / Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-2xl p-6 max-w-2xl w-full shadow-2xl my-8 animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold font-outfit text-gray-900 dark:text-white flex items-center gap-2">
                  <Sliders size={18} className="text-indigo-500" />
                  Edit & Resubmit: {game.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Update your game build, URLs, or aspect ratio. Resubmitting will queue it for immediate review.
                </p>
              </div>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Game Title *</label>
                  <input
                    required
                    type="text"
                    value={editForm.title}
                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Category *</label>
                  <select
                    value={editForm.category}
                    onChange={e => setEditForm({...editForm, category: e.target.value})}
                    className={inputCls}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Description *</label>
                <textarea
                  required
                  rows={3}
                  value={editForm.description}
                  onChange={e => setEditForm({...editForm, description: e.target.value})}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Thumbnail Image URL *</label>
                  <input
                    required
                    type="url"
                    value={editForm.image_url}
                    onChange={e => setEditForm({...editForm, image_url: e.target.value})}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Game Source URL (HTTPS iframe) *</label>
                  <input
                    required
                    type="url"
                    value={editForm.source_url}
                    onChange={e => setEditForm({...editForm, source_url: e.target.value})}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Aspect Ratio</label>
                  <select
                    value={editForm.aspectRatio}
                    onChange={e => setEditForm({...editForm, aspectRatio: e.target.value as any})}
                    className={inputCls}
                  >
                    <option value="16:9">16:9 (Standard Widescreen)</option>
                    <option value="4:3">4:3 (Retro / Arcade)</option>
                    <option value="9:16">9:16 (Vertical Mobile)</option>
                    <option value="auto">Auto (Adaptive)</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Orientation</label>
                  <select
                    value={editForm.orientation}
                    onChange={e => setEditForm({...editForm, orientation: e.target.value as any})}
                    className={inputCls}
                  >
                    <option value="landscape">Landscape</option>
                    <option value="portrait">Portrait</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editForm.tagsString}
                  onChange={e => setEditForm({...editForm, tagsString: e.target.value})}
                  placeholder="e.g. 2D, Pixel Art, Retro"
                  className={inputCls}
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400 font-bold">
                  {errorMsg}
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  <Send size={13} /> {isSaving ? 'Resubmitting...' : 'Save & Submit for Review'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
