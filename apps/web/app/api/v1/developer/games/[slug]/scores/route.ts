export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { authenticateDeveloperRequest, apiAuthErrorResponse } from '@/lib/auth/api-key';
import { createClient } from '@/lib/supabase/server';

interface ScorePayload {
  score: number;
  username?: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const auth = await authenticateDeveloperRequest(request);
  if (!auth.success) {
    return apiAuthErrorResponse(auth);
  }

  const { developer } = auth;
  const gameSlug = params.slug?.trim().toLowerCase();

  if (!gameSlug) {
    return NextResponse.json({ error: 'Game slug is required.' }, { status: 400 });
  }

  // Parse body
  let body: ScorePayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
  }

  const { score, username, user_id, metadata } = body;

  // 1. Validate score parameter
  if (typeof score !== 'number' || !Number.isFinite(score)) {
    return NextResponse.json(
      { error: 'Invalid score parameter. Score must be a finite number.' },
      { status: 400 }
    );
  }

  const cleanScore = Math.floor(score);
  if (cleanScore < 0 || cleanScore > 10_000_000) {
    return NextResponse.json(
      { error: 'Invalid score value. Score must be between 0 and 10,000,000.' },
      { status: 400 }
    );
  }

  const supabase = createClient();

  // 2. Fetch game & verify developer ownership
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('id, title, slug, developer_id, status')
    .eq('slug', gameSlug)
    .maybeSingle();

  if (gameError || !game) {
    return NextResponse.json(
      { error: `Game with slug '${gameSlug}' was not found.` },
      { status: 404 }
    );
  }

  if (game.developer_id !== developer.developerId) {
    return NextResponse.json(
      {
        error: 'Forbidden. Your API key does not have permission to submit scores for this game.',
        code: 'NOT_GAME_OWNER',
      },
      { status: 403 }
    );
  }

  if (game.status !== 'active') {
    return NextResponse.json(
      {
        error: `Cannot submit scores for game with status '${game.status}'. Game must be active.`,
        code: 'GAME_NOT_ACTIVE',
      },
      { status: 400 }
    );
  }

  // 3. Resolve player target ID
  let targetUserId = developer.developerId; // fallback to developer if no player specified

  if (user_id) {
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user_id)
      .maybeSingle();

    if (userProfile) {
      targetUserId = userProfile.id;
    }
  } else if (username) {
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', username.trim())
      .maybeSingle();

    if (userProfile) {
      targetUserId = userProfile.id;
    }
  }

  // 4. Server-authoritative insertion into scores table
  const { data: scoreRecord, error: insertError } = await supabase
    .from('scores')
    .insert([
      {
        game_id: game.id,
        user_id: targetUserId,
        score: cleanScore,
      },
    ])
    .select('id, created_at')
    .maybeSingle();

  if (insertError) {
    return NextResponse.json(
      { error: 'Failed to record score into platform database.', details: insertError.message },
      { status: 500 }
    );
  }

  // 5. Award player progression XP asynchronously
  try {
    const addedXp = Math.max(25, Math.min(500, Math.floor(cleanScore / 100)));
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp')
      .eq('id', targetUserId)
      .maybeSingle();

    if (profile) {
      const newXp = (profile.xp || 0) + addedXp;
      const newLevel = Math.floor(newXp / 500) + 1;
      await supabase
        .from('profiles')
        .update({ xp: newXp, level: newLevel, updated_at: new Date().toISOString() })
        .eq('id', targetUserId);
    }
  } catch {
    // Non-critical progression fallback
  }

  return NextResponse.json(
    {
      success: true,
      message: 'Score successfully recorded by server-authoritative API.',
      game: {
        id: game.id,
        slug: game.slug,
        title: game.title,
      },
      player: {
        user_id: targetUserId,
        identifier: username || user_id || developer.username,
      },
      score: cleanScore,
      recorded_at: scoreRecord?.created_at || new Date().toISOString(),
      metadata: metadata || null,
    },
    { status: 201 }
  );
}
