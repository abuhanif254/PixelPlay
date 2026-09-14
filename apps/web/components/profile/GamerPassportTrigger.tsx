'use client';

import React, { useState } from 'react';
import { Sparkles, CreditCard } from 'lucide-react';
import GamerPassportModal from './GamerPassportModal';
import { arcadeAudio } from '@/lib/arcade-audio';

interface GamerPassportTriggerProps {
  username: string;
  displayName: string;
  avatarUrl: string;
  level: number;
  xp: number;
  streak: number;
  uniqueGames: number;
  achievementsCount: number;
}

export default function GamerPassportTrigger({
  username,
  displayName,
  avatarUrl,
  level,
  xp,
  streak,
  uniqueGames,
  achievementsCount,
}: GamerPassportTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    arcadeAudio.playSelect();
    setIsOpen(true);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        type="button"
        className="group relative inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-400 shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
        title="View and download verified Arcadia Gamer Passport"
      >
        <Sparkles size={13} className="text-indigo-400 group-hover:text-yellow-300 group-hover:rotate-12 transition-transform" />
        <span>Gamer Passport</span>
      </button>

      <GamerPassportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        username={username}
        displayName={displayName}
        avatarUrl={avatarUrl}
        level={level}
        xp={xp}
        streak={streak}
        uniqueGames={uniqueGames}
        achievementsCount={achievementsCount}
      />
    </>
  );
}
