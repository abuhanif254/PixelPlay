'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Swords, Users, Sparkles, Play, ArrowRight, ShieldCheck, Flame, Zap } from 'lucide-react';
import { generateRoomCode, MULTIPLAYER_SUPPORTED_GAMES } from '@/lib/room-engine';
import { arcadeAudio } from '@/lib/arcade-audio';

export default function PartyLobbyPage() {
  const router = useRouter();
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [selectedGame, setSelectedGame] = useState(MULTIPLAYER_SUPPORTED_GAMES[0]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = (game = selectedGame) => {
    arcadeAudio.playStart();
    setIsCreating(true);
    const code = generateRoomCode();
    router.push(`/party/${code}?game=${game.slug}&host=true`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = roomCodeInput.trim().toUpperCase();
    if (cleanCode.length >= 4) {
      arcadeAudio.playSelect();
      router.push(`/party/${cleanCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#070818] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Radiant Glowing Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/15 via-rose-600/10 to-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-12">
        {/* Header Hero */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-500/20 to-purple-500/20 border border-rose-500/30 text-rose-300 text-xs font-black uppercase tracking-wider">
            <Sparkles size={13} className="text-rose-400" />
            <span>Real-Time Head-to-Head Multiplayer</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight font-outfit text-white">
            Arcade <span className="bg-gradient-to-r from-rose-500 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Party Duels</span>
          </h1>

          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Create a private party room, invite a friend with 1-click, and compete simultaneously in synchronized head-to-head arcade battles.
          </p>
        </div>

        {/* Action Grid: Create vs Join */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Room Card */}
          <div className="bg-gradient-to-b from-purple-950/40 to-slate-950/70 border border-purple-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/25">
                  <Swords size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Create Duel Room</h2>
                  <p className="text-xs text-gray-400">Host a private match and invite anyone</p>
                </div>
              </div>

              {/* Game Selector Chips */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wide">
                  Select Game Title
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MULTIPLAYER_SUPPORTED_GAMES.map((game) => {
                    const isSelected = selectedGame.slug === game.slug;
                    return (
                      <button
                        key={game.slug}
                        type="button"
                        onClick={() => {
                          arcadeAudio.playSelect();
                          setSelectedGame(game);
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                          isSelected
                            ? 'bg-rose-500/20 border-rose-500 text-white shadow-md'
                            : 'bg-black/30 border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <span className="text-lg">{game.icon}</span>
                        <span className="truncate">{game.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleCreateRoom()}
              disabled={isCreating}
              className="mt-6 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black text-sm tracking-wide shadow-xl shadow-rose-600/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap size={16} />
              <span>{isCreating ? 'Generating Room...' : 'Launch Duel Room'}</span>
            </button>
          </div>

          {/* Join Room Card */}
          <div className="bg-gradient-to-b from-indigo-950/40 to-slate-950/70 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <Users size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Join with Room Code</h2>
                  <p className="text-xs text-gray-400">Enter a 4-letter friend invitation code</p>
                </div>
              </div>

              <form onSubmit={handleJoinRoom} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wide">
                    Room Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. 9X4K"
                    className="w-full px-4 py-3.5 rounded-2xl bg-black/50 border border-white/10 text-white text-center font-mono font-black text-2xl tracking-widest focus:outline-none focus:border-indigo-500 transition-colors uppercase placeholder:text-gray-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={roomCodeInput.trim().length < 4}
                  className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm tracking-wide shadow-xl shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowRight size={16} />
                  <span>Enter Duel Match</span>
                </button>
              </form>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-gray-400">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Zero server installations • Instant peer connectivity</span>
            </div>
          </div>
        </div>

        {/* Instant Launch Featured Titles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Flame size={18} className="text-rose-500" />
              <span>Featured Multiplayer Titles</span>
            </h3>
            <span className="text-xs text-gray-400">1-Click Instant Room Creation</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {MULTIPLAYER_SUPPORTED_GAMES.map((game) => (
              <div
                key={game.slug}
                onClick={() => handleCreateRoom(game)}
                role="button"
                tabIndex={0}
                className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-rose-500/50 p-4 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-1"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{game.icon}</span>
                <span className="text-xs font-black text-white truncate w-full">{game.title}</span>
                <span className="text-[10px] text-gray-400 mt-0.5">{game.category}</span>
                <span className="mt-3 text-[10px] font-extrabold text-rose-400 flex items-center gap-1 group-hover:underline">
                  <Play size={10} className="fill-current" /> Duel Now
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
