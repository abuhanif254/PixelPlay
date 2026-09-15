'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Swords, 
  Share2, 
  Copy, 
  Check, 
  Trophy, 
  Flame, 
  ArrowLeft, 
  Sparkles, 
  Users, 
  RotateCcw,
  Volume2
} from 'lucide-react';
import { createRoomChannel, RoomReaction, MULTIPLAYER_SUPPORTED_GAMES } from '@/lib/room-engine';
import { arcadeAudio } from '@/lib/arcade-audio';

export default function ActiveDuelRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = (params?.code as string || 'ROOM').toUpperCase();
  const initialGameSlug = searchParams.get('game') || 'neon-snake';
  const isHost = searchParams.get('host') === 'true';

  // Room State
  const [gameSlug, setGameSlug] = useState(initialGameSlug);
  const [myScore, setMyScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [rivalConnected, setRivalConnected] = useState(false);
  const [rivalName, setRivalName] = useState('Challenger');
  const [isCopied, setIsCopied] = useState(false);
  const [reactions, setReactions] = useState<RoomReaction[]>([]);
  const [hasFinished, setHasFinished] = useState(false);

  const roomChannelRef = useRef<any>(null);
  const myPlayerId = useRef<string>(`player-${Math.random().toString(36).substring(2, 8)}`);

  // Connect to broadcast channel
  useEffect(() => {
    const channel = createRoomChannel(
      code,
      (stateUpdate) => {
        if (stateUpdate.gameSlug) setGameSlug(stateUpdate.gameSlug);
      },
      (scoreData) => {
        if (scoreData.playerId !== myPlayerId.current) {
          setRivalScore(scoreData.score);
          setRivalConnected(true);
        }
      },
      (reaction) => {
        if (reaction.playerId !== myPlayerId.current) {
          arcadeAudio.playBlip();
        }
        setReactions((prev) => [...prev.slice(-6), reaction]);
      }
    );

    roomChannelRef.current = channel;

    // Broadcast presence
    channel.broadcastScore(myPlayerId.current, 0);

    return () => {
      channel.leave();
    };
  }, [code]);

  // Listen for score events from local game
  useEffect(() => {
    const handleScoreEvent = (e: any) => {
      const score = e.detail?.score || e.data?.score;
      if (typeof score === 'number') {
        setMyScore(score);
        roomChannelRef.current?.broadcastScore(myPlayerId.current, score);

        // Overtake audio
        if (score > rivalScore && rivalScore > 0) {
          arcadeAudio.playVictory();
        }
      }
    };

    window.addEventListener('spielcade:score-submitted', handleScoreEvent as EventListener);
    window.addEventListener('message', (e) => {
      if (e.data?.type === 'SPIELCADE_SCORE' || e.data?.action === 'SUBMIT_SCORE') {
        const score = e.data.score || e.data.payload?.score;
        if (typeof score === 'number') {
          setMyScore(score);
          roomChannelRef.current?.broadcastScore(myPlayerId.current, score);
        }
      }
    });

    return () => {
      window.removeEventListener('spielcade:score-submitted', handleScoreEvent as EventListener);
    };
  }, [rivalScore]);

  // Copy or share room invite link
  const handleCopyLink = async () => {
    arcadeAudio.playSelect();
    const url = window.location.href.split('?')[0];

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Duel Me on Spielcade! [Room ${code}]`,
          text: `Join my live arcade duel room: ${code}! Let's see who gets the higher score! ⚔️`,
          url,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {}
  };

  // Send emoji reaction
  const handleSendReaction = (emoji: string) => {
    arcadeAudio.playBlip();
    const reaction: RoomReaction = {
      id: Math.random().toString(),
      playerId: myPlayerId.current,
      emoji,
      timestamp: Date.now(),
    };
    roomChannelRef.current?.broadcastReaction(reaction);
    setReactions((prev) => [...prev.slice(-6), reaction]);
  };

  // Calculate Tug of War Ratio
  const totalPoints = Math.max(1, myScore + rivalScore);
  const myRatio = Math.min(95, Math.max(5, Math.round((myScore / totalPoints) * 100)));

  // Resolve Game Details
  const activeGameMeta = MULTIPLAYER_SUPPORTED_GAMES.find((g) => g.slug === gameSlug) || MULTIPLAYER_SUPPORTED_GAMES[0];

  return (
    <div className="min-h-screen bg-[#070818] text-white pt-20 pb-20 px-3 sm:px-6 relative overflow-hidden">
      {/* Floating Reaction Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {reactions.map((r) => (
          <div
            key={r.id}
            className="absolute text-5xl animate-in fade-in slide-in-from-bottom-10 duration-700 pointer-events-none"
            style={{
              left: `${20 + (Math.random() * 60)}%`,
              bottom: '15%',
              animation: 'bounce 1s infinite alternate',
            }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto space-y-4 relative z-10">
        {/* Top Room Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-black/60 border border-white/10 rounded-2xl p-3 sm:px-5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Link
              href="/party"
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-rose-400 uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30">
                ROOM: {code}
              </span>
              <span className="text-xs text-gray-300 font-bold hidden sm:inline">
                {activeGameMeta.icon} {activeGameMeta.title}
              </span>
            </div>
          </div>

          {/* Share / Invite Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl bg-gradient-to-r from-rose-500/20 to-purple-500/20 border border-rose-500/40 text-rose-300 hover:text-white transition-all shadow-sm active:scale-95"
            >
              {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{isCopied ? 'Link Copied!' : 'Invite Rival'}</span>
            </button>
          </div>
        </div>

        {/* Live Tug-of-War Scoreboard Meter */}
        <div className="bg-gradient-to-r from-indigo-950/60 via-black/80 to-rose-950/60 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm font-black">
            {/* Player 1 (You) */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500/30 border border-indigo-400 flex items-center justify-center font-bold text-indigo-300">
                YOU
              </div>
              <div>
                <div className="text-[11px] text-indigo-400 uppercase">You (Player 1)</div>
                <div className="text-xl sm:text-2xl font-mono text-white font-black">
                  {myScore.toLocaleString()} <span className="text-xs text-gray-400">PTS</span>
                </div>
              </div>
            </div>

            {/* Center VS Indicator */}
            <div className="text-center">
              <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-600/30">
                VS
              </span>
            </div>

            {/* Rival (Player 2) */}
            <div className="flex items-center gap-2 text-right">
              <div>
                <div className="text-[11px] text-rose-400 uppercase">
                  {rivalConnected ? rivalName : 'Waiting for Rival...'}
                </div>
                <div className="text-xl sm:text-2xl font-mono text-white font-black">
                  {rivalScore.toLocaleString()} <span className="text-xs text-gray-400">PTS</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-rose-500/30 border border-rose-400 flex items-center justify-center font-bold text-rose-300">
                2
              </div>
            </div>
          </div>

          {/* Tug of War Dynamic Progress Gauge */}
          <div className="relative w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/10">
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-300"
              style={{ width: `${myRatio}%` }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-rose-500 to-rose-400 transition-all duration-300"
              style={{ width: `${100 - myRatio}%` }}
            />
          </div>
        </div>

        {/* Game Stage Viewport */}
        <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-black aspect-[16/9] max-h-[70vh] shadow-2xl">
          <iframe
            src={`/embed/${gameSlug}`}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; gamepad"
            title={activeGameMeta.title}
          />
        </div>

        {/* Live Emoji Reaction Stream Bar */}
        <div className="flex items-center justify-center gap-2 py-2">
          {['🔥', '💀', '😱', '👑', '🎯', '🚀'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSendReaction(emoji)}
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xl transition-transform hover:scale-125 active:scale-95 cursor-pointer"
              title={`Send ${emoji} reaction`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
