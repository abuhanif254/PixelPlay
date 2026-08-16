'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitPlugin } from '../actions';
import { Send, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = ['Arcade', 'Puzzle', 'Action', 'Strategy', 'Racing', 'Sports', 'Adventure', 'Simulation', 'Board'];

export default function SubmitGamePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Arcade',
    image_url: '',
    source_url: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const res = await submitPlugin(form);
    
    if (res.success) {
      setStatus('success');
      setTimeout(() => {
        router.push('/studio');
      }, 2000);
    } else {
      setStatus('error');
      setErrorMsg(res.error || 'Failed to submit plugin.');
    }
  };

  const inputCls = "w-full bg-gray-50 dark:bg-[#0A0B1A] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#6366F1] transition-colors";
  const labelCls = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider";

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#111228] rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl text-center">
        <CheckCircle className="text-green-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold font-outfit text-gray-900 dark:text-white mb-2">Game Submitted Successfully!</h2>
        <p className="text-gray-500 dark:text-gray-400">Your plugin is now in the queue for Admin review. Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#111228] rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
        <h2 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">Submit a Game Plugin</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Host your HTML5 game externally and plug it into our platform.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
        
        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
          <ExternalLink className="text-blue-500 mt-0.5 shrink-0" size={20} />
          <div>
            <h4 className="font-bold text-blue-800 dark:text-blue-400 text-sm">Have you included the SDK?</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Your game must include our <Link href="/studio/docs" className="underline font-bold">spielcade-sdk.js</Link> file to communicate scores back to the platform. 
              Make sure your game is hosted on a secure (HTTPS) server that allows iFrame embedding.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelCls}>Game Title *</label>
            <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inputCls} placeholder="e.g. Super Space Shooter" />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={inputCls}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Description *</label>
          <textarea required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className={`${inputCls} resize-none`} placeholder="Describe your game and how to play it..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelCls}>Thumbnail Image URL *</label>
            <input required type="url" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className={inputCls} placeholder="https://yourserver.com/thumbnail.png" />
            <p className="text-xs text-gray-400 mt-2">Recommended size: 800x450px (16:9)</p>
          </div>
          <div>
            <label className={labelCls}>Game Source URL (iFrame link) *</label>
            <input required type="url" value={form.source_url} onChange={e => setForm({...form, source_url: e.target.value})} className={inputCls} placeholder="https://yourserver.com/game/index.html" />
            <p className="text-xs text-gray-400 mt-2">The direct link to your HTML5 game index.</p>
          </div>
        </div>

        {status === 'error' && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold">
            <AlertTriangle size={16} />
            {errorMsg}
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex justify-end">
          <button 
            type="submit" 
            disabled={status === 'submitting'}
            className="flex items-center gap-2 px-8 py-3 bg-[#6366F1] text-white rounded-xl font-bold hover:bg-[#4F46E5] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50"
          >
            {status === 'submitting' ? 'Submitting...' : (
              <>
                <Send size={18} />
                Submit for Review
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
