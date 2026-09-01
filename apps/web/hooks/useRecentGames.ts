"use client";

import { useState, useEffect, useCallback } from 'react';

export interface RecentGameItem {
  slug: string;
  title: string;
  image?: string;
  category?: string;
  rating?: number;
  lastPlayed?: string;
}

const RECENT_GAMES_KEY = 'spielcade_recent_games_v2';
const MAX_RECENT_GAMES = 10;

export function useRecentGames() {
  const [recentGames, setRecentGames] = useState<RecentGameItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(RECENT_GAMES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // If old string array format, convert to items
          const normalized: RecentGameItem[] = parsed.map((item: any) => {
            if (typeof item === 'string') {
              return { slug: item, title: item.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) };
            }
            return item;
          });
          setRecentGames(normalized);
        }
      }
    } catch (e) {
      console.error('Failed to load recent games', e);
    }
  }, []);

  const addRecentGame = React.useCallback((gameData: string | RecentGameItem) => {
    try {
      const item: RecentGameItem = typeof gameData === 'string' 
        ? { slug: gameData, title: gameData.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), lastPlayed: new Date().toISOString() }
        : { ...gameData, lastPlayed: new Date().toISOString() };

      const stored = localStorage.getItem(RECENT_GAMES_KEY);
      let current: RecentGameItem[] = stored ? JSON.parse(stored) : [];
      
      // Remove if it already exists to put it at the beginning
      current = current.filter(g => (typeof g === 'string' ? g : g.slug) !== item.slug);
      current.unshift(item);
      
      // Keep only the most recent ones
      if (current.length > MAX_RECENT_GAMES) {
        current = current.slice(0, MAX_RECENT_GAMES);
      }
      
      localStorage.setItem(RECENT_GAMES_KEY, JSON.stringify(current));
      setRecentGames(current);
      
      // Dispatch custom event for cross-component sync
      window.dispatchEvent(new Event('recentGamesUpdated'));
    } catch (e) {
      console.error('Failed to save recent game', e);
    }
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem(RECENT_GAMES_KEY);
        if (stored) setRecentGames(JSON.parse(stored));
      } catch (e) {
        // ignore
      }
    };
    
    window.addEventListener('recentGamesUpdated', handleUpdate);
    return () => window.removeEventListener('recentGamesUpdated', handleUpdate);
  }, []);

  const clearRecentGames = React.useCallback(() => {
    try {
      localStorage.removeItem(RECENT_GAMES_KEY);
      localStorage.removeItem('spielcade_recent_games');
      setRecentGames([]);
      window.dispatchEvent(new Event('recentGamesUpdated'));
    } catch (e) {
      console.error('Failed to clear recent games', e);
    }
  }, []);

  return {
    recentGames,
    recentSlugs: recentGames.map(g => g.slug),
    addRecentGame,
    clearRecentGames,
    isMounted
  };
}
