'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Tv,
  Volume2,
  Sparkles,
  X,
  Play,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { easterEggEngine } from '@/lib/easter-eggs';
import { arcadeAudio } from '@/lib/arcade-audio';

export default function SecretVaultModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [unlockCode, setUnlockCode] = useState<string>('konami');
  const [crtEnabled, setCrtEnabled] = useState(false);

  useEffect(() => {
    setCrtEnabled(easterEggEngine.isCrtEnabled());

    const handleUnlock = (e: any) => {
      const code = e.detail?.code || 'konami';
      setUnlockCode(code);
      setIsOpen(true);
      arcadeAudio.playVictory();
    };

    window.addEventListener('spielcade:secret-vault-unlocked', handleUnlock);
    return () => {
      window.removeEventListener('spielcade:secret-vault-unlocked', handleUnlock);
    };
  }, []);

  const handleToggleCrt = () => {
    arcadeAudio.playCoin();
    const active = easterEggEngine.toggleCrtFilter();
    setCrtEnabled(active);
  };

  const handleTestSound = (sound: 'coin' | 'select' | 'start' | 'victory' | 'gameover') => {
    switch (sound) {
      case 'coin': arcadeAudio.playCoin(); break;
      case 'select': arcadeAudio.playSelect(); break;
      case 'start': arcadeAudio.playStart(); break;
      case 'victory': arcadeAudio.playVictory(); break;
      case 'gameover': arcadeAudio.playGameOver(); break;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Terminal Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl bg-[#080d08] border-2 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.3)] p-6 text-emerald-400 font-mono z-10 overflow-hidden"
        >
          {/* Scanline CRT overlay within modal */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none opacity-40 bg-[length:100%_4px]" />

          {/* Terminal Title Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30 text-xs">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-emerald-400 animate-pulse" />
              <span className="font-black tracking-widest uppercase">
                SPIELCADE://VAULT_ROOT [ACCESS_GRANTED]
              </span>
            </div>

            <button
              onClick={() => {
                arcadeAudio.playBlip();
                setIsOpen(false);
              }}
              className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Terminal Output */}
          <div className="my-4 space-y-2 text-xs leading-relaxed bg-black/60 p-3.5 rounded-2xl border border-emerald-500/20">
            <p className="text-emerald-500 font-bold">&gt; DECRYPTING CHEAT CODE: &quot;{unlockCode.toUpperCase()}&quot;...</p>
            <p className="text-emerald-300">&gt; VERIFICATION SUCCESS: Secret Vault Unlocked!</p>
            <p className="text-amber-400 flex items-center gap-1">
              <Sparkles size={13} />
              <span>+250 XP Awarded • Achievement Unlocked: [Master Hacker]</span>
            </p>
          </div>

          {/* Vault Secret Tools */}
          <div className="space-y-4 pt-1">
            {/* Tool 1: CRT Retro Shader */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Tv size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white font-sans">Retro 1990s CRT Shader</p>
                  <p className="text-[10px] text-emerald-400/80">
                    Apply arcade phosphor scanlines and vignette across the entire site
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleCrt}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all shadow-sm ${
                  crtEnabled
                    ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.7)]'
                    : 'bg-white/10 text-emerald-300 hover:bg-white/20'
                }`}
              >
                {crtEnabled ? 'ACTIVE' : 'ENABLE'}
              </button>
            </div>

            {/* Tool 2: Web Audio 8-Bit Synthesizer Soundboard */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white font-sans">
                <Volume2 size={16} className="text-emerald-400" />
                <span>Zero-Bandwidth 8-Bit Chiptune Synth</span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {(['coin', 'select', 'start', 'victory', 'gameover'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleTestSound(s)}
                    className="px-2 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/30 border border-emerald-500/30 text-[10px] uppercase font-bold text-emerald-300 hover:text-white transition-colors text-center active:scale-95"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Tool 3: Secret Arcade Games */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white font-sans">Original Flagship Arcade</p>
                <p className="text-[10px] text-emerald-400/80">Launch original pure-vector neon games</p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/games/snake"
                  onClick={() => arcadeAudio.playStart()}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[11px] flex items-center gap-1 transition-all active:scale-95"
                >
                  <Play size={11} fill="currentColor" />
                  <span>Snake</span>
                </a>
                <a
                  href="/games/2048"
                  onClick={() => arcadeAudio.playStart()}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[11px] flex items-center gap-1 transition-all active:scale-95"
                >
                  <Play size={11} fill="currentColor" />
                  <span>2048</span>
                </a>
              </div>
            </div>
          </div>

          {/* Footer exit command */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                arcadeAudio.playBlip();
                setIsOpen(false);
              }}
              className="text-[11px] text-emerald-500/70 hover:text-emerald-300 underline underline-offset-4 transition-colors font-mono"
            >
              [PRESS ESC OR CLICK HERE TO RETURN TO ARCADE]
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
