export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createImpressionToken } from '@/lib/security/ad-token';

export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Malformed JSON payload.' },
        { status: 400 }
      );
    }

    const { slot_id, game_id, session_id } = body;

    if (!slot_id || typeof slot_id !== 'string' || slot_id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Parameter slot_id is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    const cleanSlotId = slot_id.trim();
    const cleanGameId = game_id && typeof game_id === 'string' ? game_id.trim() : null;
    const cleanSessionId = session_id && typeof session_id === 'string' ? session_id.trim() : null;

    const token = await createImpressionToken({
      slotId: cleanSlotId,
      gameId: cleanGameId,
      sessionId: cleanSessionId,
    });

    return NextResponse.json(
      {
        success: true,
        token,
        slot_id: cleanSlotId,
        expires_in_sec: 120,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err: any) {
    console.error('Error generating impression token:', err);
    return NextResponse.json(
      { error: 'Internal error generating impression token.' },
      { status: 500 }
    );
  }
}
