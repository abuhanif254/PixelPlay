'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getLevelInfo, LevelInfo, XP_REWARDS } from '@/lib/progression';
import { arcadeAudio } from '@/lib/arcade-audio';
import { createClient } from '@/lib/supabase/client';

const STORAGE_KEY_XP = 'spielcade_player_xp';

export function usePlayerProgression() {
  const [totalXp, setTotalXp] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  // Compute live level info from total XP
  const levelInfo: LevelInfo = useMemo(() => getLevelInfo(totalXp), [totalXp]);

  // Load initial XP from localStorage and Supabase
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let initialXp = 0;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_XP);
      if (stored !== null) {
        initialXp = parseInt(stored, 10) || 0;
      }
    } catch {}

    setTotalXp(initialXp);
    setIsLoaded(true);

    // Sync with Supabase profile if logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('profiles')
          .select('experience_points, level')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data && typeof data.experience_points === 'number') {
              const cloudXp = Math.max(initialXp, data.experience_points);
              setTotalXp(cloudXp);
              try {
                localStorage.setItem(STORAGE_KEY_XP, String(cloudXp));
              } catch {}
            }
          });
      }
    });
  }, [supabase]);

  // Award XP with level-up detection and audio fanfare
  const awardXp = useCallback(
    async (amount: number, reason: string = 'Game Play') => {
      if (amount <= 0) return;

      setTotalXp((prevXp) => {
        const nextXp = prevXp + amount;
        try {
          localStorage.setItem(STORAGE_KEY_XP, String(nextXp));
        } catch {}

        const prevLevel = getLevelInfo(prevXp).level;
        const nextInfo = getLevelInfo(nextXp);

        // Play coin sound for XP gain
        arcadeAudio.playCoin();

        // Dispatch global XP gained event
        window.dispatchEvent(
          new CustomEvent('spielcade:xp-gained', {
            detail: { amount, reason, totalXp: nextXp },
          })
        );

        // Check for Level Up!
        if (nextInfo.level > prevLevel) {
          arcadeAudio.playLevelUp();
          window.dispatchEvent(
            new CustomEvent('spielcade:level-up', {
              detail: {
                oldLevel: prevLevel,
                newLevel: nextInfo.level,
                levelInfo: nextInfo,
                reason,
              },
            })
          );
        }

        // Background sync to Supabase if authenticated
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            supabase
              .from('profiles')
              .update({
                experience_points: nextXp,
                level: nextInfo.level,
              })
              .eq('id', user.id)
              .then(() => {});
          }
        });

        return nextXp;
      });
    },
    [supabase]
  );

  // Listen for global external award-xp events
  useEffect(() => {
    const handleGlobalAward = (e: any) => {
      if (e.detail?.amount) {
        awardXp(e.detail.amount, e.detail.reason || 'Bonus');
      }
    };
    window.addEventListener('spielcade:award-xp', handleGlobalAward as EventListener);
    return () => window.removeEventListener('spielcade:award-xp', handleGlobalAward as EventListener);
  }, [awardXp]);

  return {
    levelInfo,
    awardXp,
    isLoaded,
    XP_REWARDS,
  };
}
