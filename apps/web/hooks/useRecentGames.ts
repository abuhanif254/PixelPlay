"use client";

import { useState, useEffect } from 'react';

const RECENT_GAMES_KEY = 'spielcade_recent_games';
const MAX_RECENT_GAMES = 12;

export function useRecentGames() {
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(RECENT_GAMES_KEY);
      if (stored) {
        setRecentSlugs(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recent games', e);
    }
  }, []);

  const addRecentGame = (slug: string) => {
    try {
      const stored = localStorage.getItem(RECENT_GAMES_KEY);
      let current = stored ? JSON.parse(stored) : [];
      
      // Remove if it already exists to put it at the beginning
      current = current.filter((s: string) => s !== slug);
      current.unshift(slug);
      
      // Keep only the most recent ones
      if (current.length > MAX_RECENT_GAMES) {
        current = current.slice(0, MAX_RECENT_GAMES);
      }
      
      localStorage.setItem(RECENT_GAMES_KEY, JSON.stringify(current));
      
      // If we are on the client, also update state so other components might react if they share state (though here they don't natively share, this is local to the hook instance)
      setRecentSlugs(current);
      
      // Dispatch custom event for cross-component sync
      window.dispatchEvent(new Event('recentGamesUpdated'));
    } catch (e) {
      console.error('Failed to save recent game', e);
    }
  };

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem(RECENT_GAMES_KEY);
        if (stored) setRecentSlugs(JSON.parse(stored));
      } catch (e) {
        // ignore
      }
    };
    
    window.addEventListener('recentGamesUpdated', handleUpdate);
    return () => window.removeEventListener('recentGamesUpdated', handleUpdate);
  }, []);

  return {
    recentSlugs,
    addRecentGame,
    isMounted
  };
}
