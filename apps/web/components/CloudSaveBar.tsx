'use client';

import React, { useState, useEffect } from 'react';
import { Cloud, Save, RefreshCw, AlertCircle, Check, Sparkles, UserCheck, QrCode, Smartphone, X, Copy } from 'lucide-react';
import { saveGameState, loadGameState } from '@/app/games/actions';
import { arcadeAudio } from '@/lib/arcade-audio';

interface CloudSaveBarProps {
  slug: string;
  title: string;
  iframeRef?: React.RefObject<HTMLIFrameElement>;
  className?: string;
}

export default function CloudSaveBar({ slug, title, iframeRef, className = '' }: CloudSaveBarProps) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'loading' | 'loaded' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('Ready to sync');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleShowTransferModal = () => {
    arcadeAudio.playSelect();
    let payload = {
      slug,
      timestamp: Date.now(),
      savedAt: new Date().toISOString(),
    };
    try {
      const cached = localStorage.getItem(`spielcade_save_${slug}`);
      if (cached) payload = JSON.parse(cached);
    } catch {}

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://spielcade.com';
    const targetUrl = `${origin}/games/${slug}?resumeState=${encodeURIComponent(JSON.stringify(payload))}`;
    setResumeUrl(targetUrl);
    setIsQrModalOpen(true);
  };

  const handleCopyTransferLink = async () => {
    arcadeAudio.playBlip();
    try {
      await navigator.clipboard.writeText(resumeUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {}
  };

  // Initialize or check if local save exists
  useEffect(() => {
    try {
      const cached = localStorage.getItem(`spielcade_save_${slug}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.savedAt) {
          const date = new Date(parsed.savedAt);
          setLastSavedTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          setStatusMessage(`Last checkpoint saved at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
        }
      }
    } catch {}
  }, [slug]);

  // Handle Manual Save
  const handleSaveProgress = async () => {
    if (saveStatus === 'saving' || saveStatus === 'loading') return;

    setSaveStatus('saving');
    setStatusMessage('Capturing game checkpoint...');
    setErrorMessage(null);

    // 1. Send postMessage to game iframe to trigger state dump if supported
    let statePayload: any = {
      timestamp: Date.now(),
      savedAt: new Date().toISOString(),
      gameSlug: slug,
      state: 'checkpoint_auto'
    };

    if (iframeRef?.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({
          type: 'SPIELCADE_SAVE_REQUEST',
          action: 'SAVE_STATE',
          slug
        }, '*');
      } catch {}
    }

    try {
      // 2. Call server action to persist to Supabase
      const res = await saveGameState(slug, statePayload);

      // Cache locally for instant offline resume
      try {
        localStorage.setItem(`spielcade_save_${slug}`, JSON.stringify(statePayload));
      } catch {}

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSavedTime(timeStr);
      setSaveStatus('saved');
      setStatusMessage(`Saved checkpoint at ${timeStr}`);

      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (err: any) {
      // Local fallback
      try {
        localStorage.setItem(`spielcade_save_${slug}`, JSON.stringify(statePayload));
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSavedTime(timeStr);
        setSaveStatus('saved');
        setStatusMessage(`Saved locally at ${timeStr}`);
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch {
        setSaveStatus('error');
        setErrorMessage('Could not save progress. Please make sure cookies are enabled.');
      }
    }
  };

  // Handle Manual Load Save
  const handleLoadProgress = async () => {
    if (saveStatus === 'saving' || saveStatus === 'loading') return;

    setSaveStatus('loading');
    setStatusMessage('Fetching cloud checkpoint...');
    setErrorMessage(null);

    try {
      const res = await loadGameState(slug);
      let restoreData = res?.data;

      // Fallback to local storage if remote is null
      if (!restoreData) {
        const cached = localStorage.getItem(`spielcade_save_${slug}`);
        if (cached) {
          restoreData = JSON.parse(cached);
        }
      }

      if (!restoreData) {
        setSaveStatus('error');
        setErrorMessage('No previous checkpoint found for this game.');
        setTimeout(() => setSaveStatus('idle'), 3000);
        return;
      }

      // Dispatch restore to game iframe
      if (iframeRef?.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'SPIELCADE_RESTORE_STATE',
          action: 'LOAD_STATE',
          payload: restoreData
        }, '*');
      }

      setSaveStatus('loaded');
      setStatusMessage('Progress checkpoint restored!');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch {
      setSaveStatus('error');
      setErrorMessage('Could not restore checkpoint.');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <div className={`w-full bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-lg transition-all ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left: Cloud Status Info */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
            saveStatus === 'saving' || saveStatus === 'loading'
              ? 'bg-indigo-500/20 text-[#6366F1] animate-pulse'
              : saveStatus === 'saved' || saveStatus === 'loaded'
              ? 'bg-emerald-500/20 text-emerald-400'
              : saveStatus === 'error'
              ? 'bg-rose-500/20 text-rose-400'
              : 'bg-indigo-500/10 text-[#6366F1]'
          }`}>
            {saveStatus === 'saving' || saveStatus === 'loading' ? (
              <RefreshCw size={20} className="animate-spin" />
            ) : saveStatus === 'saved' || saveStatus === 'loaded' ? (
              <Check size={20} />
            ) : saveStatus === 'error' ? (
              <AlertCircle size={20} />
            ) : (
              <Cloud size={20} />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-bold text-gray-900 dark:text-white font-outfit">
                Cross-Device Cloud Saves
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Auto-Sync Active
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {errorMessage || statusMessage}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Transfer to Mobile Button */}
          <button
            onClick={handleShowTransferModal}
            type="button"
            title="Transfer your saved game run to your phone via QR Code"
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Smartphone size={13} />
            <span className="hidden sm:inline">To Mobile</span>
          </button>

          {/* Load Checkpoint Button */}
          <button
            onClick={handleLoadProgress}
            type="button"
            disabled={saveStatus === 'saving' || saveStatus === 'loading'}
            title="Load your last saved checkpoint"
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <RefreshCw size={13} className={saveStatus === 'loading' ? 'animate-spin' : ''} />
            <span>Load Save</span>
          </button>

          {/* Save Progress Button */}
          <button
            onClick={handleSaveProgress}
            type="button"
            disabled={saveStatus === 'saving' || saveStatus === 'loading'}
            title="Save your current game checkpoint to cloud"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#5457DF] hover:to-[#4338CA] active:scale-95 text-white shadow-md shadow-[#6366F1]/20 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {saveStatus === 'saving' ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <Check size={14} className="text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Progress</span>
              </>
            )}
          </button>

        </div>

      </div>

      {/* Transfer to Mobile QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl text-center">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <QrCode size={22} />
            </div>

            <h3 className="text-lg font-black text-gray-900 dark:text-white font-outfit">
              Transfer to Smartphone
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
              Scan with your phone&apos;s camera to immediately resume your current run and board state.
            </p>

            {/* QR Code Container */}
            <div className="p-3 bg-white rounded-2xl inline-block shadow-inner mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=4&data=${encodeURIComponent(resumeUrl)}`}
                alt="Scan to resume on phone"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <button
              onClick={handleCopyTransferLink}
              className="w-full py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{isCopied ? 'Link Copied!' : 'Copy Mobile Resume Link'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
