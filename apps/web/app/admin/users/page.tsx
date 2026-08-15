export const runtime = 'edge';
import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin';
import UsersTable from './UsersTable';

export const revalidate = 0;

export default async function AdminUsersPage() {
  await requireAdmin();
  const supabase = createClient();

  // Fetch all profiles with their score counts
  const { data: profiles } = await supabase
    .from('profiles')
    .select(`
      id, username, full_name, avatar_url, role,
      xp, level, created_at, updated_at
    `)
    .order('created_at', { ascending: false });

  // Fetch score counts per user
  const { data: scoreCounts } = await supabase
    .from('scores')
    .select('user_id')
    .then(async ({ data }) => {
      if (!data) return { data: {} };
      const counts: Record<string, number> = {};
      data.forEach(s => { counts[s.user_id] = (counts[s.user_id] || 0) + 1; });
      return { data: counts };
    });

  const mappedUsers = (profiles || []).map((p: any) => ({
    id: p.id,
    username: p.username || 'Unknown',
    full_name: p.full_name || '',
    avatar_url: p.avatar_url || '',
    role: p.role as 'user' | 'admin',
    xp: p.xp ?? 0,
    level: p.level ?? 1,
    score_count: (scoreCounts as Record<string, number>)?.[p.id] ?? 0,
    created_at: p.created_at,
  }));

  return <UsersTable initialUsers={mappedUsers} />;
}
