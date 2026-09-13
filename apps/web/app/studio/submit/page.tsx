'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { submitPlugin } from '../actions';
import { 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink, 
  Play, 
  Monitor, 
  Smartphone, 
  ShieldCheck, 
  Eye, 
  Sliders, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

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

const AVAILABLE_CONTROLS = ['Keyboard', 'Mouse', 'Touch / Mobile', 'Gamepad'];

export default function SubmitGamePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Arcade',
    image_url: '',
    source_url: '',
    aspectRatio: '16:9' as '16:9' | '4:3' | '9:16' | 'auto',
    orientation: 'landscape' as 'landscape' | 'portrait',
    authorName: '',
    tagsString: '',
    controls: ['Keyboard', 'Mouse'] as string[]
  });
  
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [sdkDetected, setSdkDetected] = useState(false);
  const [previewReloadKey, setPreviewReloadKey] = useState(0);

  // Listen for iframe SDK events during live preview
  useEffect(() => {
    const handleSdkEvent = (event: MessageEvent) => {
      if (event.data?.source === 'SPIELCADE_SDK') {
        if (event.data.type === 'GAME_READY' || event.data.type === 'SUBMIT_SCORE') {
          setSdkDetected(true);
        }
      }
    };

    window.addEventListener('message', handleSdkEvent);
    return () => window.removeEventListener('message', handleSdkEvent);
  }, []);

  const handleControlToggle = (ctrl: string) => {
    setForm(prev => ({
      ...prev,
      controls: prev.controls.includes(ctrl)
        ? prev.controls.filter(c => c !== ctrl)
        : [...prev.controls, ctrl]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const tags = form.tagsString
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const res = await submitPlugin({
      title: form.title,
      description: form.description,
      category: form.category,
      image_url: form.image_url,
      source_url: form.source_url,
      aspectRatio: form.aspectRatio,
      orientation: form.orientation,
      controls: form.controls,
      tags,
      authorName: form.authorName
    });
    
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
        <CheckCircle className="text-green-500 mb-4 animate-bounce" size={48} />
        <h2 className="text-2xl font-bold font-outfit text-gray-900 dark:text-white mb-2">Game Submitted Successfully!</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Your game is now in the priority QA queue for admin review. You can track status or make adjustments directly from your Developer Dashboard.
        </p>
      </div>
    );
  }

  const isHttps = form.source_url.startsWith('https://');

  return (
    <div className="bg-white dark:bg-[#111228] rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl overflow-hidden">
      
      {/* Header & Tabs */}
      <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-outfit text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles size={20} className="text-indigo-500" />
            Submit a Game Plugin
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Host your HTML5 or WebGL game on your own server or CDN and publish it to Spielcade.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-gray-200/70 dark:bg-black/40 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'form' 
                ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Sliders size={13} /> Game Config
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            disabled={!form.source_url}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40 ${
              activeTab === 'preview' 
                ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Eye size={13} /> Live Preview {form.source_url && '✓'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
        
        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl">
          <ExternalLink className="text-indigo-500 mt-0.5 shrink-0" size={20} />
          <div>
            <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm">Pre-flight SDK Integration Checklist</h4>
            <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
              Ensure your game includes <code className="bg-indigo-100 dark:bg-black/30 px-1 py-0.5 rounded">https://spielcade.com/spielcade-sdk.js</code> and triggers <code className="bg-indigo-100 dark:bg-black/30 px-1 py-0.5 rounded">Spielcade.gameReady()</code> upon asset load. You can test your iframe in the <Link href="/studio/docs" className="underline font-bold">SDK Sandbox</Link> anytime.
            </p>
          </div>
        </div>

        {activeTab === 'form' ? (
          <>
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>Game Title *</label>
                <input 
                  required 
                  type="text" 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                  className={inputCls} 
                  placeholder="e.g. Neon Horizon Racing" 
                />
              </div>
              <div>
                <label className={labelCls}>Category *</label>
                <select 
                  value={form.category} 
                  onChange={e => setForm({...form, category: e.target.value})} 
                  className={inputCls}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Description & Gameplay Instructions *</label>
              <textarea 
                required 
                rows={3} 
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})} 
                className={`${inputCls} resize-none`} 
                placeholder="Describe your game lore, objectives, and how to play..." 
              />
            </div>

            {/* URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>Thumbnail Image URL *</label>
                <input 
                  required 
                  type="url" 
                  value={form.image_url} 
                  onChange={e => setForm({...form, image_url: e.target.value})} 
                  className={inputCls} 
                  placeholder="https://yourserver.com/thumbnail.png" 
                />
                <p className="text-xs text-gray-400 mt-1.5">Recommended resolution: 800x450px (16:9)</p>
              </div>
              <div>
                <label className={labelCls}>Game Source URL (HTTPS iframe) *</label>
                <input 
                  required 
                  type="url" 
                  value={form.source_url} 
                  onChange={e => setForm({...form, source_url: e.target.value})} 
                  className={inputCls} 
                  placeholder="https://yourserver.com/game/index.html" 
                />
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  {form.source_url && !isHttps ? (
                    <span className="text-amber-500 font-semibold">⚠️ Must be HTTPS for secure browser embedding</span>
                  ) : (
                    <span>Direct URL to your playable HTML5 entry point.</span>
                  )}
                </p>
              </div>
            </div>

            {/* Display & Screen Tuning */}
            <div className="p-4 bg-gray-50/70 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Display & Device Configuration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Aspect Ratio */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                    Native Aspect Ratio
                  </label>
                  <select
                    value={form.aspectRatio}
                    onChange={e => setForm({...form, aspectRatio: e.target.value as any})}
                    className={inputCls}
                  >
                    <option value="16:9">16:9 (Standard Widescreen)</option>
                    <option value="4:3">4:3 (Retro / Arcade)</option>
                    <option value="9:16">9:16 (Vertical Mobile)</option>
                    <option value="auto">Auto (Adaptive)</option>
                  </select>
                </div>

                {/* Orientation */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                    Default Orientation
                  </label>
                  <select
                    value={form.orientation}
                    onChange={e => setForm({...form, orientation: e.target.value as any})}
                    className={inputCls}
                  >
                    <option value="landscape">Landscape (Horizontal)</option>
                    <option value="portrait">Portrait (Vertical)</option>
                  </select>
                </div>

                {/* Studio / Author Credits */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                    Studio / Author Credit Name
                  </label>
                  <input
                    type="text"
                    value={form.authorName}
                    onChange={e => setForm({...form, authorName: e.target.value})}
                    placeholder="e.g. PixelApex Studios"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Supported Controls */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  Supported Input Devices
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_CONTROLS.map(ctrl => {
                    const isSelected = form.controls.includes(ctrl);
                    return (
                      <button
                        key={ctrl}
                        type="button"
                        onClick={() => handleControlToggle(ctrl)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white dark:bg-[#111228] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-indigo-400'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {ctrl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Discovery Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.tagsString}
                  onChange={e => setForm({...form, tagsString: e.target.value})}
                  placeholder="e.g. 2D, Pixel Art, Retro, Fast-Paced, Runner"
                  className={inputCls}
                />
              </div>

            </div>
          </>
        ) : (
          /* Live Preview Tab */
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between bg-gray-50 dark:bg-black/20 p-3 rounded-xl border border-gray-200 dark:border-white/5">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${sdkDetected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {sdkDetected ? 'SDK Detected (Ready)' : 'Awaiting SDK Events...'}
                </span>
                <span className="text-xs text-gray-400">| Target Aspect Ratio: {form.aspectRatio}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewReloadKey(k => k + 1)}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <RefreshCw size={12} /> Reload Frame
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl flex items-center justify-center border border-slate-800">
              <div className={`w-full ${
                form.aspectRatio === '16:9' 
                  ? 'aspect-video max-w-3xl' 
                  : form.aspectRatio === '4:3' 
                    ? 'aspect-[4/3] max-w-2xl' 
                    : form.aspectRatio === '9:16' 
                      ? 'aspect-[9/16] max-w-sm' 
                      : 'aspect-video max-w-3xl'
              } rounded-lg overflow-hidden border border-slate-800 shadow-2xl bg-black`}>
                <iframe
                  key={previewReloadKey}
                  title="Live Preview"
                  src={form.source_url}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; gamepad"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center">
              If the frame displays a blank screen or connection refused, verify that your server allows embedding via <code>X-Frame-Options</code> or <code>Content-Security-Policy: frame-ancestors</code>.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold">
            <AlertTriangle size={16} />
            {errorMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'form' ? 'preview' : 'form')}
            disabled={!form.source_url}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-40"
          >
            {activeTab === 'form' ? <Eye size={14} /> : <Sliders size={14} />}
            {activeTab === 'form' ? 'Test in Live Preview' : 'Back to Configuration'}
          </button>

          <button 
            type="submit" 
            disabled={status === 'submitting' || !form.title || !form.source_url}
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
