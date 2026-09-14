'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  Minimize2,
  Maximize2,
  Sparkles,
  Music,
  Disc,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type RadioStation = 'synthwave' | 'chiptune' | 'lofi' | 'speedrun';

interface StationConfig {
  id: RadioStation;
  name: string;
  genre: string;
  bpm: number;
  color: string;
  notes: number[]; // Frequencies in Hz
  rootFreq: number;
}

const STATIONS: Record<RadioStation, StationConfig> = {
  synthwave: {
    id: 'synthwave',
    name: 'Neon Horizon',
    genre: 'Synthwave 80s',
    bpm: 108,
    color: 'from-pink-500 to-indigo-500',
    notes: [130.81, 146.83, 164.81, 196.0, 220.0, 261.63, 293.66, 329.63],
    rootFreq: 65.41, // C2
  },
  chiptune: {
    id: 'chiptune',
    name: 'Pixel Odyssey',
    genre: '8-Bit Chiptune',
    bpm: 130,
    color: 'from-cyan-400 to-emerald-500',
    notes: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25],
    rootFreq: 130.81, // C3
  },
  lofi: {
    id: 'lofi',
    name: 'Midnight Study',
    genre: 'Lo-Fi Chillout',
    bpm: 82,
    color: 'from-amber-400 to-purple-500',
    notes: [146.83, 174.61, 220.0, 261.63, 293.66, 349.23],
    rootFreq: 73.42, // D2
  },
  speedrun: {
    id: 'speedrun',
    name: 'Overdrive Rush',
    genre: 'Cyber Adrenaline',
    bpm: 144,
    color: 'from-orange-500 to-rose-600',
    notes: [110.0, 130.81, 146.83, 164.81, 196.0, 220.0, 261.63, 329.63],
    rootFreq: 55.0, // A1
  },
};

export default function ArcadeRadio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [station, setStation] = useState<RadioStation>('synthwave');
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDucked, setIsDucked] = useState(false);

  // Web Audio Nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const synthIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepRef = useRef(0);

  // Initialize stored preferences
  useEffect(() => {
    try {
      const savedStation = localStorage.getItem('spielcade_radio_station') as RadioStation;
      if (savedStation && STATIONS[savedStation]) setStation(savedStation);

      const savedVol = localStorage.getItem('spielcade_radio_volume');
      if (savedVol !== null) setVolume(Number(savedVol));

      const savedMute = localStorage.getItem('spielcade_radio_muted');
      if (savedMute !== null) setIsMuted(savedMute === 'true');
    } catch {}
  }, []);

  // Smart Audio Ducking: listen to active gameplay state
  useEffect(() => {
    const handleGameplay = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setIsDucked(Boolean(detail?.isPlaying));
    };

    window.addEventListener('spielcade:gameplay-state', handleGameplay);
    return () => window.removeEventListener('spielcade:gameplay-state', handleGameplay);
  }, []);

  // Update master gain with ducking
  useEffect(() => {
    if (!masterGainRef.current || !audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    const effectiveVol = isMuted ? 0 : isDucked ? (volume / 100) * 0.28 : volume / 100;
    masterGainRef.current.gain.cancelScheduledValues(now);
    masterGainRef.current.gain.setTargetAtTime(effectiveVol, now, 0.1);
  }, [volume, isMuted, isDucked]);

  // Audio synthesis loop
  const stopSynthesis = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
  };

  const startSynthesis = (targetStation: RadioStation) => {
    stopSynthesis();

    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      audioCtxRef.current = new AudioCtx();

      const master = audioCtxRef.current.createGain();
      master.connect(audioCtxRef.current.destination);
      masterGainRef.current = master;
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    const currentStation = STATIONS[targetStation];
    const stepIntervalMs = (60000 / currentStation.bpm) / 2; // 8th notes

    synthIntervalRef.current = setInterval(() => {
      if (!audioCtxRef.current || !masterGainRef.current) return;

      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const step = stepRef.current;
      stepRef.current = (step + 1) % 16;

      // 1. Bassline (plays on quarter beats 0, 4, 8, 12)
      if (step % 4 === 0) {
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = targetStation === 'chiptune' ? 'triangle' : 'sawtooth';
        bassOsc.frequency.setValueAtTime(currentStation.rootFreq, now);

        const bassFilter = ctx.createBiquadFilter();
        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(targetStation === 'lofi' ? 220 : 450, now);

        bassGain.gain.setValueAtTime(0.35, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(masterGainRef.current);

        bassOsc.start(now);
        bassOsc.stop(now + 0.4);
      }

      // 2. Melody Arpeggio
      const noteIndex = (step * 3) % currentStation.notes.length;
      const noteFreq = currentStation.notes[noteIndex];

      const leadOsc = ctx.createOscillator();
      const leadGain = ctx.createGain();
      leadOsc.type = targetStation === 'chiptune' ? 'square' : targetStation === 'lofi' ? 'sine' : 'sawtooth';
      leadOsc.frequency.setValueAtTime(noteFreq, now);

      const leadFilter = ctx.createBiquadFilter();
      leadFilter.type = 'lowpass';
      leadFilter.frequency.setValueAtTime(targetStation === 'lofi' ? 800 : 2400, now);

      leadGain.gain.setValueAtTime(0.18, now);
      leadGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      leadOsc.connect(leadFilter);
      leadFilter.connect(leadGain);
      leadGain.connect(masterGainRef.current);

      leadOsc.start(now);
      leadOsc.stop(now + 0.25);
    }, stepIntervalMs);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopSynthesis();
      setIsPlaying(false);
    } else {
      startSynthesis(station);
      setIsPlaying(true);
    }
  };

  const handleStationChange = (newStation: RadioStation) => {
    setStation(newStation);
    try {
      localStorage.setItem('spielcade_radio_station', newStation);
    } catch {}
    if (isPlaying) {
      startSynthesis(newStation);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (isMuted && newVol > 0) setIsMuted(false);
    try {
      localStorage.setItem('spielcade_radio_volume', String(newVol));
    } catch {}
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    try {
      localStorage.setItem('spielcade_radio_muted', String(nextMute));
    } catch {}
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSynthesis();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const activeConf = STATIONS[station];

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 z-40 select-none">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          /* Expanded Cyber Deck Player */
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-72 sm:w-80 bg-[#0E0F24]/95 border border-indigo-500/30 rounded-3xl p-4 shadow-2xl backdrop-blur-xl text-white"
          >
            {/* Header: Title & Minimize Button */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Radio size={14} className={isPlaying ? 'animate-pulse' : ''} />
                </div>
                <div>
                  <h4 className="text-xs font-black font-outfit uppercase tracking-wider text-white">
                    Arcade FM
                  </h4>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    {isDucked ? (
                      <span className="text-amber-400 font-bold">🎮 Auto-Ducked (Game Active)</span>
                    ) : (
                      <span>Procedural Audio Stream</span>
                    )}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsExpanded(false)}
                type="button"
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                title="Collapse Radio"
              >
                <Minimize2 size={14} />
              </button>
            </div>

            {/* Visualizer & Station Card */}
            <div className={`p-3 rounded-2xl bg-gradient-to-r ${activeConf.color} bg-opacity-20 border border-white/10 mb-3 flex items-center justify-between`}>
              <div className="flex items-center gap-2.5">
                <Disc
                  size={24}
                  className={`text-white ${isPlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '4s' }}
                />
                <div>
                  <span className="block text-xs font-black font-outfit text-white">
                    {activeConf.name}
                  </span>
                  <span className="text-[10px] text-white/80 font-medium">
                    {activeConf.genre} • {activeConf.bpm} BPM
                  </span>
                </div>
              </div>

              {/* Animated Audio Equalizer Bars */}
              <div className="flex items-end gap-1 h-5">
                {[40, 75, 100, 60, 85].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full bg-white transition-all duration-150 ${
                      isPlaying ? 'animate-bounce' : 'h-1'
                    }`}
                    style={{
                      height: isPlaying ? `${h}%` : '2px',
                      animationDelay: `${i * 120}ms`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Station Selector Chips */}
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {(Object.keys(STATIONS) as RadioStation[]).map((stKey) => {
                const s = STATIONS[stKey];
                const isActive = station === stKey;
                return (
                  <button
                    key={stKey}
                    onClick={() => handleStationChange(stKey)}
                    type="button"
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all text-left truncate flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                    <span className="truncate">{s.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Playback & Volume Control Bar */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
              <button
                onClick={togglePlayback}
                type="button"
                className="w-10 h-10 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-95 transition-all"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
              </button>

              <div className="flex-1 flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  type="button"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 rounded-lg cursor-pointer bg-white/20"
                />
              </div>
            </div>
          </motion.div>
        ) : (
          /* Collapsed Floating Micro Player */
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-[#0E0F24]/95 border border-indigo-500/30 shadow-2xl backdrop-blur-xl text-white cursor-pointer group hover:border-indigo-400 transition-all"
            onClick={() => setIsExpanded(true)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlayback();
              }}
              type="button"
              className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
              title={isPlaying ? 'Pause Radio' : 'Play Radio'}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
            </button>

            <div className="flex flex-col">
              <span className="text-[11px] font-bold font-outfit text-white leading-tight flex items-center gap-1.5">
                <Radio size={11} className={`text-indigo-400 ${isPlaying ? 'animate-pulse' : ''}`} />
                <span>{activeConf.name}</span>
              </span>
              <span className="text-[9px] text-gray-400 font-medium">
                {isPlaying ? (isDucked ? 'Ducked' : 'Playing') : 'Paused'}
              </span>
            </div>

            <Maximize2 size={11} className="text-gray-400 group-hover:text-white transition-colors ml-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
