export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { authenticateDeveloperRequest, apiAuthErrorResponse } from '@/lib/auth/api-key';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const auth = await authenticateDeveloperRequest(request);
  if (!auth.success) {
    return apiAuthErrorResponse(auth);
  }

  const { developer } = auth;
  const supabase = createClient();

  // 1. Fetch payout profile configuration status
  const { data: payoutProfile } = await supabase
    .from('developer_payout_profiles')
    .select('payout_method, status, tax_certified, created_at')
    .eq('developer_id', developer.developerId)
    .maybeSingle();

  // 2. Fetch game catalog statistics
  const { data: games } = await supabase
    .from('games')
    .select('id, status, total_plays')
    .eq('developer_id', developer.developerId);

  const gamesList = games || [];
  const activeCount = gamesList.filter((g) => g.status === 'active').length;
  const pendingCount = gamesList.filter((g) => g.status === 'pending').length;
  const draftCount = gamesList.filter((g) => g.status === 'draft').length;
  const totalPlays = gamesList.reduce((acc, g) => acc + (Number(g.total_plays) || 0), 0);

  return NextResponse.json({
    success: true,
    developer: {
      id: developer.developerId,
      username: developer.username,
      full_name: developer.fullName,
      avatar_url: developer.avatarUrl,
      role: developer.role,
      api_key: {
        id: developer.keyId,
        name: developer.keyName,
        created_at: developer.createdAt,
        last_used_at: developer.lastUsedAt || null,
      },
      payout_profile: {
        is_configured: !!payoutProfile,
        method: payoutProfile?.payout_method || null,
        status: payoutProfile?.status || 'not_configured',
        tax_certified: payoutProfile?.tax_certified || false,
      },
      catalog: {
        total_games: gamesList.length,
        active_games: activeCount,
        pending_review: pendingCount,
        drafts: draftCount,
        total_plays: totalPlays,
      },
      rev_share: {
        net_publisher_share: '70%',
        platform_fee: '30%',
        payout_threshold_usd: 50.0,
      },
    },
  });
}
