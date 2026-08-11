'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

// Mock hook for cloud syncing.
// In a real application, this would detect when a user logs in
// and push their local favorites and recent games up to Supabase/Firebase.

export function useGameSync() {
  const { data: session, status } = useSession();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const syncData = async () => {
        setIsSyncing(true);
        try {
          // Read local data
          const recentGames = localStorage.getItem('pixelplay_recent_games');
          
          // Mock API call to cloud
          // await fetch('/api/user/sync', {
          //   method: 'POST',
          //   body: JSON.stringify({ recentGames }),
          // });

          console.log('[Cloud Sync] Successfully synced data for', session?.user?.name);
          setLastSynced(new Date());
        } catch (error) {
          console.error('[Cloud Sync] Failed to sync data', error);
        } finally {
          setIsSyncing(false);
        }
      };

      // Sync on initial auth load
      syncData();
      
      // Optionally setup an interval for periodic syncs
      // const interval = setInterval(syncData, 5 * 60 * 1000); // 5 minutes
      // return () => clearInterval(interval);
    }
  }, [status, session]);

  return { isSyncing, lastSynced };
}
