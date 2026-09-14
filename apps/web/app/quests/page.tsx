'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Sparkles, 
  Flame, 
  Star, 
  CheckCircle2, 
  Lock, 
  Gift, 
  Zap, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { getDailyQuests, DailyQuest, SEASON_1_PASS } from '@/lib/quests';
import { arcadeAudio } from '@/lib/arcade-audio';

export default function QuestsPage() {
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [battleStars, setBattleStars] = useState(6);

  useEffect(() => {
    const daily = getDailyQuests();

    // Check localStorage for claimed states
    try {
      const storedClaimed = localStorage.getItem('spielcade_claimed_quests');
      if (storedClaimed) {
        const claimedIds = new Set(JSON.parse(storedClaimed));
        daily.forEach((q) => {
          if (claimedIds.has(q.id)) q.isClaimed = true;
        });
      }

      const storedStars = localStorage.getItem('spielcade_battle_stars');
      if (storedStars) setBattleStars(parseInt(storedStars, 10) || 6);
    } catch {}

    setQuests(daily);
  }, []);

  const handleClaim = (quest: DailyQuest) => {
    if (quest.isClaimed) return;

    arcadeAudio.playLevelUp();

    // Award XP globally
    window.dispatchEvent(
      new CustomEvent('spielcade:award-xp', {
        detail: { amount: quest.xpReward, reason: `Quest: ${quest.title}` },
      })
    );

    const nextStars = battleStars + quest.starReward;
    setBattleStars(nextStars);

    try {
      localStorage.setItem('spielcade_battle_stars', String(nextStars));
      const storedClaimed = localStorage.getItem('spielcade_claimed_quests');
      const set = new Set(storedClaimed ? JSON.parse(storedClaimed) : []);
      set.add(quest.id);
      localStorage.setItem('spielcade_claimed_quests', JSON.stringify(Array.from(set)));
    } catch {}

    setQuests((prev) =>
      prev.map((q) => (q.id === quest.id ? { ...q, isClaimed: true } : q))
    );
  };

  return (
    <div className="min-h-screen bg-[#070818] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Radiant Background Accents */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-2/3 right-1/4 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Sparkles size={12} />
                Season 1: Cyber Odyssey
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight font-outfit text-white">
              Daily Bounties & Battle Pass
            </h1>
            <p className="text-gray-400 text-sm sm:text-base mt-2">
              Complete daily bounties to earn bonus XP and Battle Stars to unlock exclusive seasonal cosmetics.
            </p>
          </div>

          {/* Battle Stars Counter */}
          <div className="bg-black/60 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3 shrink-0 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/25">
              <Star size={24} className="fill-current" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase">Your Battle Stars</div>
              <div className="text-2xl font-black text-amber-400 font-mono">
                {battleStars} <span className="text-xs text-gray-400">STARS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Daily Bounties Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Flame className="text-amber-500" />
              <span>Today's Daily Bounties</span>
            </h2>
            <span className="text-xs font-mono text-gray-400">Resets Daily at 00:00 UTC</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quests.map((quest) => (
              <div
                key={quest.id}
                className="bg-black/40 border border-white/10 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-xl shadow-xl space-y-4 hover:border-amber-500/30 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{quest.icon}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold">
                        +{quest.xpReward} XP
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono font-bold flex items-center gap-0.5">
                        <Star size={10} className="fill-current" /> +{quest.starReward}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-base">{quest.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{quest.description}</p>
                </div>

                <button
                  onClick={() => handleClaim(quest)}
                  disabled={quest.isClaimed}
                  className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    quest.isClaimed
                      ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/25 active:scale-95 cursor-pointer'
                  }`}
                >
                  {quest.isClaimed ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>Claimed</span>
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      <span>Claim Rewards</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Season 1 Battle Pass Track */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Trophy className="text-purple-400" />
              <span>Season 1 Battle Pass Milestones</span>
            </h2>
            <span className="text-xs text-gray-400">Tier Unlocks</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SEASON_1_PASS.map((pass) => {
              const isUnlocked = battleStars >= pass.requiredStars;

              return (
                <div
                  key={pass.tier}
                  className={`rounded-2xl border p-4 flex flex-col justify-between backdrop-blur-xl transition-all ${
                    isUnlocked
                      ? 'bg-gradient-to-b from-purple-950/40 to-black/60 border-purple-500/40 shadow-lg shadow-purple-500/10'
                      : 'bg-black/40 border-white/5 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-black text-purple-400">
                      TIER {pass.tier}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400 flex items-center gap-0.5">
                      <Star size={11} className="text-amber-400 fill-current" /> {pass.requiredStars}
                    </span>
                  </div>

                  <div className="py-2">
                    <div className="text-sm font-bold text-white">{pass.rewardTitle}</div>
                    <div className="text-[11px] text-gray-400 capitalize mt-0.5">
                      {pass.rewardType.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    {isUnlocked ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={13} /> Unlocked
                      </span>
                    ) : (
                      <span className="text-gray-500 font-medium flex items-center gap-1">
                        <Lock size={13} /> Locked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
