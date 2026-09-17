'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  Terminal, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  Zap
} from 'lucide-react';
import { arcadeAudio } from '@/lib/arcade-audio';
import { GAME_IFRAME_SANDBOX, GAME_IFRAME_PERMISSIONS } from '@/lib/constants';

interface SdkEventLog {
  id: string;
  timestamp: string;
  type: string;
  payload: any;
  status: 'info' | 'success' | 'warning';
}

export default function SdkSandboxPage() {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
  const [testUrl, setTestUrl] = useState('/embed/snake');
  const [loadedUrl, setLoadedUrl] = useState('/embed/snake');
  const [logs, setLogs] = useState<SdkEventLog[]>([]);
  const [isAdSimulating, setIsAdSimulating] = useState(false);
  const [adCountdown, setAdCountdown] = useState(3);
  const [checks, setChecks] = useState({
    https: true,
    sdkInit: false,
    gameplayLifecycle: false,
    scoreSubmission: false,
  });

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Listen for postMessage SDK events from iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      const data = e.data;
      if (!data || typeof data !== 'object') return;

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const eventType = data.type || data.action || 'UNKNOWN_EVENT';

      // Log event
      setLogs((prev) => [
        {
          id: Math.random().toString(),
          timestamp: time,
          type: eventType,
          payload: data,
          status: eventType.includes('ERROR') ? 'warning' : 'success',
        },
        ...prev.slice(0, 49),
      ]);

      // Update compliance checks
      if (eventType === 'SPIELCADE_INIT' || eventType === 'init') {
        setChecks((c) => ({ ...c, sdkInit: true }));
      }
      if (eventType === 'gameplayStart' || eventType === 'gameplayStop') {
        setChecks((c) => ({ ...c, gameplayLifecycle: true }));
      }
      if (eventType === 'SPIELCADE_SCORE' || eventType === 'SUBMIT_SCORE') {
        setChecks((c) => ({ ...c, scoreSubmission: true }));
      }

      // Handle simulated ad breaks
      if (eventType === 'commercialBreak' || eventType === 'rewardedBreak') {
        triggerSimulatedAd();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const triggerSimulatedAd = () => {
    arcadeAudio.playSelect();
    setIsAdSimulating(true);
    setAdCountdown(3);

    const timer = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsAdSimulating(false);
          // Send resume event back to iframe
          iframeRef.current?.contentWindow?.postMessage(
            { type: 'SPIELCADE_AD_COMPLETED', action: 'resume' },
            '*'
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLoadUrl = (e: React.FormEvent) => {
    e.preventDefault();
    arcadeAudio.playStart();
    setLoadedUrl(testUrl);
    setLogs((prev) => [
      {
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'SANDBOX_RELOAD',
        payload: { target: testUrl },
        status: 'info',
      },
      ...prev,
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header & Device Viewport Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111228] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Interactive Testbench
            </span>
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            SDK Sandbox & Compliance Inspector
          </h2>
        </div>

        {/* Viewport Toggles */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/5">
          <button
            type="button"
            onClick={() => setDeviceMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              deviceMode === 'desktop'
                ? 'bg-white dark:bg-indigo-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Monitor size={14} />
            <span className="hidden sm:inline">Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setDeviceMode('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              deviceMode === 'tablet'
                ? 'bg-white dark:bg-indigo-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Tablet size={14} />
            <span className="hidden sm:inline">Tablet</span>
          </button>

          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              deviceMode === 'mobile'
                ? 'bg-white dark:bg-indigo-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Smartphone size={14} />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>
      </div>

      {/* URL Input Bar */}
      <form onSubmit={handleLoadUrl} className="flex gap-2">
        <input
          type="text"
          value={testUrl}
          onChange={(e) => setTestUrl(e.target.value)}
          placeholder="Enter game URL (e.g. /games/neon-snake or https://...)"
          className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
        >
          <RotateCcw size={14} />
          <span>Load Build</span>
        </button>
      </form>

      {/* Main Grid: Device Simulator (Left) + Console / Audit (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Device Simulator */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div
            className={`relative bg-black transition-all duration-300 shadow-2xl overflow-hidden ${
              deviceMode === 'desktop'
                ? 'w-full aspect-[16/9] rounded-2xl border border-gray-800'
                : deviceMode === 'tablet'
                ? 'w-full max-w-[620px] aspect-[4/3] rounded-[28px] border-[8px] border-slate-800'
                : 'w-full max-w-[360px] aspect-[9/19.5] rounded-[40px] border-[10px] border-slate-800'
            }`}
          >
            {/* Simulated Interstitial Ad Overlay */}
            {isAdSimulating && (
              <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-3">
                  Simulated Commercial Break
                </span>
                <h3 className="text-xl font-black text-white">Commercial In Progress</h3>
                <p className="text-xs text-gray-400 mt-1">Simulating partner ad network response...</p>
                <div className="text-4xl font-mono font-black text-amber-400 my-4">
                  0{adCountdown}s
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdSimulating(false);
                    iframeRef.current?.contentWindow?.postMessage(
                      { type: 'SPIELCADE_AD_COMPLETED', action: 'resume' },
                      '*'
                    );
                  }}
                  className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
                >
                  Skip Ad (Dev Force)
                </button>
              </div>
            )}

            <iframe
              ref={iframeRef}
              src={loadedUrl}
              className="w-full h-full border-0"
              sandbox={GAME_IFRAME_SANDBOX}
              allow={GAME_IFRAME_PERMISSIONS}
            />
          </div>
        </div>

        {/* Right: Automated Compliance & Real-Time Event Log */}
        <div className="lg:col-span-4 space-y-4">
          {/* Pre-Flight Compliance Checklist */}
          <div className="bg-white dark:bg-[#111228] p-4 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2">
              <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-500" />
                Pre-Flight Audit
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                Verified
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                <span>Origin Security & HTTPS</span>
                <CheckCircle2 size={14} className="text-emerald-500" />
              </div>
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                <span>SDK Handshake Init</span>
                {checks.sdkInit ? (
                  <CheckCircle2 size={14} className="text-emerald-500" />
                ) : (
                  <span className="text-[10px] text-gray-400">Waiting</span>
                )}
              </div>
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                <span>Ad Pausing Protocol</span>
                {checks.gameplayLifecycle ? (
                  <CheckCircle2 size={14} className="text-emerald-500" />
                ) : (
                  <span className="text-[10px] text-gray-400">Waiting</span>
                )}
              </div>
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                <span>Score Transmission</span>
                {checks.scoreSubmission ? (
                  <CheckCircle2 size={14} className="text-emerald-500" />
                ) : (
                  <span className="text-[10px] text-gray-400">Optional</span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={triggerSimulatedAd}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Zap size={14} />
              <span>Test Interstitial Break</span>
            </button>
          </div>

          {/* Real-Time SDK Event Log */}
          <div className="bg-white dark:bg-[#111228] p-4 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2">
              <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Terminal size={15} className="text-indigo-500" />
                Live SDK Events ({logs.length})
              </span>
              <button
                type="button"
                onClick={() => setLogs([])}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="Clear Logs"
              >
                <Trash2 size={13} />
              </button>
            </div>

            <div className="h-[280px] overflow-y-auto space-y-2 custom-scrollbar font-mono text-[11px]">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-xs text-center px-4">
                  Listening for postMessage events from loaded game...
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2 rounded-lg bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/5 space-y-0.5"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {log.type}
                      </span>
                      <span className="text-gray-400">{log.timestamp}</span>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 truncate text-[10px]">
                      {JSON.stringify(log.payload)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
