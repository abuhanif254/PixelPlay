import React from 'react';
import { requireAdmin } from '@/lib/admin';
import { createClient } from '@/lib/supabase/server';
import QueueClient from './QueueClient';
import { Inbox } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function GameQueuePage() {
  await requireAdmin();
  const supabase = createClient();

  const { data: games } = await supabase
    .from('games')
    .select(`
      id, title, slug, category, description, image_url, source_url, created_at,
      profiles (username, full_name, avatar_url)
    `)
    .eq('status', 'pending_review')
    .order('created_at', { ascending: true });

  const typedGames = (games || []).map((g: any) => ({
    ...g,
    developer: g.profiles,
  }));

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-gray-900 dark:text-white tracking-tight text-balance mb-2">
            Approval Queue
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Review and approve games submitted by developers.</p>
        </div>
        <Link href="/admin/games" className="px-4 py-2 bg-gray-100 dark:bg-white/10 text-sm font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
          Back to Games
        </Link>
      </div>

      {typedGames.length === 0 ? (
        <div className="bg-white dark:bg-[#111228]/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
            <Inbox size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Inbox Zero!</h3>
          <p className="text-sm text-gray-500">There are no pending games to review.</p>
        </div>
      ) : (
        <QueueClient initialGames={typedGames} />
      )}
    </div>
  );
}
