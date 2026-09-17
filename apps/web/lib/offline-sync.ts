'use client';

import { submitScore } from '@/app/games/actions';

export interface QueuedScoreItem {
  id: string;
  gameSlug: string;
  score: number;
  timestamp: number;
}

const STORAGE_KEY = 'spielcade_offline_queue';

/**
 * Retrieves the current pending scores from local storage.
 */
export function getOfflineQueue(): QueuedScoreItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Adds a score to the offline queue when internet connectivity is unavailable.
 */
export function queueOfflineScore(gameSlug: string, score: number): void {
  if (typeof window === 'undefined' || !gameSlug || score <= 0) return;
  try {
    const queue = getOfflineQueue();
    // Check if there's already an entry for this game
    const existingIndex = queue.findIndex(item => item.gameSlug === gameSlug);
    if (existingIndex >= 0) {
      // Keep highest score
      if (score > queue[existingIndex].score) {
        queue[existingIndex].score = score;
        queue[existingIndex].timestamp = Date.now();
      }
    } else {
      queue.push({
        id: Math.random().toString(36).substring(2, 9),
        gameSlug,
        score,
        timestamp: Date.now(),
      });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    console.log('[OfflineSync] Score queued for later sync:', { gameSlug, score });
  } catch (err) {
    console.warn('[OfflineSync] Failed to queue offline score:', err);
  }
}

/**
 * Flushes all queued offline scores to Supabase once back online.
 */
export async function flushOfflineQueue(): Promise<{ synced: number; failed: number }> {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { synced: 0, failed: 0 };
  }

  let synced = 0;
  let failed = 0;
  const remainingQueue: QueuedScoreItem[] = [];

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    try {
      const res = await submitScore(item.gameSlug, item.score);
      if (res && res.success) {
        synced++;
      } else {
        // Keep in queue if user was not logged in or temporary error
        remainingQueue.push(item);
        failed++;
      }
    } catch {
      remainingQueue.push(item);
      failed++;
    }

    // Pace consecutive score synchronizations to respect anti-cheat cooldown
    if (i < queue.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 3100));
    }
  }

  try {
    if (remainingQueue.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remainingQueue));
    }
  } catch {}

  if (synced > 0) {
    console.log(`[OfflineSync] Successfully synced ${synced} scores to leaderboard.`);
    window.dispatchEvent(
      new CustomEvent('spielcade:scores-synced', {
        detail: { count: synced },
      })
    );
  }

  return { synced, failed };
}

/**
 * Registers an automatic online listener to flush the queue when network connectivity restores.
 */
export function initOfflineSync(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => {
    console.log('[OfflineSync] Internet connection detected. Flushing score queue...');
    flushOfflineQueue().catch(() => {});
  };

  window.addEventListener('online', handleOnline);

  // Attempt initial flush on startup if online
  if (navigator.onLine) {
    setTimeout(() => {
      flushOfflineQueue().catch(() => {});
    }, 2000);
  }

  return () => {
    window.removeEventListener('online', handleOnline);
  };
}
