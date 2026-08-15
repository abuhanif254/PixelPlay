import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin';
import SettingsForm from './SettingsForm';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const { user, profile } = await requireAdmin();
  const supabase = createClient();

  // Fetch games list for the "clear scores" section
  const { data: games } = await supabase
    .from('games')
    .select('id, title, slug, total_plays')
    .order('title', { ascending: true });

  return (
    <SettingsForm
      adminProfile={{
        id: user.id,
        email: user.email || '',
        username: profile.username || '',
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || '',
      }}
      games={(games || []).map((g: any) => ({ id: g.id, title: g.title, slug: g.slug, total_plays: g.total_plays ?? 0 }))}
    />
  );
}
