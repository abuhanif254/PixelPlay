'use client';

import { useState, useEffect } from 'react';
import { updateStreak } from '@/app/profile/actions';

const STREAK_KEY = 'spielcade_streak_count';
const LAST_DATE_KEY = 'spielcade_last_active_date';

export function useDailyStreak() {
  const [streak, setStreak] = useState<number>(1);
  const [isNewStreakUnlocked, setIsNewStreakUnlocked] = useState<boolean>(false);
  const [streakXpBonus, setStreakXpBonus] = useState<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const lastDate = localStorage.getItem(LAST_DATE_KEY);
      const storedStreak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);

      if (!lastDate) {
        // First visit
        setStreak(1);
        localStorage.setItem(STREAK_KEY, '1');
        localStorage.setItem(LAST_DATE_KEY, today);
        setIsNewStreakUnlocked(true);
        setStreakXpBonus(50);
        updateStreak().catch(() => {});
      } else if (lastDate === today) {
        // Already active today
        setStreak(Math.max(1, storedStreak));
      } else {
        // Check if yesterday
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (lastDate === yesterday) {
          // Consecutive streak!
          const nextStreak = storedStreak + 1;
          setStreak(nextStreak);
          localStorage.setItem(STREAK_KEY, String(nextStreak));
          localStorage.setItem(LAST_DATE_KEY, today);
          setIsNewStreakUnlocked(true);
          setStreakXpBonus(Math.min(250, nextStreak * 25));
        } else {
          // Streak broken
          setStreak(1);
          localStorage.setItem(STREAK_KEY, '1');
          localStorage.setItem(LAST_DATE_KEY, today);
          setIsNewStreakUnlocked(true);
          setStreakXpBonus(50);
        }
        updateStreak().catch(() => {});
      }
    } catch (err) {
      console.warn('[DailyStreak] error accessing streak storage:', err);
    }
  }, []);

  const dismissStreakReward = () => {
    setIsNewStreakUnlocked(false);
  };

  return {
    streak,
    isNewStreakUnlocked,
    streakXpBonus,
    dismissStreakReward,
  };
}
