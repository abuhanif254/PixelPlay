'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useGameSync() {
  const [user, setUser] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    if (user) {
      const syncData = async () => {
        setIsSyncing(true);
        try {
          // Read local data
          const recentGames = JSON.parse(localStorage.getItem('pixelplay_recent_games') || '[]');
          
          if (recentGames.length > 0) {
            // Upsert to Supabase table
            await supabase.from('user_games').upsert({
              user_id: user.id,
              recent_games: recentGames,
              updated_at: new Date().toISOString()
            });
          }

          console.log('[Cloud Sync] Successfully synced data for', user.email);
          setLastSynced(new Date());
        } catch (error) {
          console.error('[Cloud Sync] Failed to sync data', error);
        } finally {
          setIsSyncing(false);
        }
      };

      syncData();
    }
  }, [user, supabase]);

  return { isSyncing, lastSynced };
}
