import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { gamesRegistry } from '@spielcade/games/registry';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug') || 'snake';
  const challenger = searchParams.get('challenger') || 'A Player';
  const rawScore = searchParams.get('score') || '1500';
  const formattedScore = !isNaN(Number(rawScore))
    ? Number(rawScore).toLocaleString()
    : rawScore;

  // Retrieve game info
  const localGame = gamesRegistry[slug];
  let title = localGame?.config?.title;
  let category = localGame?.config?.category || 'Arcade';

  if (!title) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
      );
      const { data: dbGame } = await supabase
        .from('games')
        .select('title, category')
        .eq('slug', slug)
        .single();

      if (dbGame) {
        title = dbGame.title;
        category = dbGame.category || 'Arcade';
      }
    } catch {}
  }

  if (!title) {
    title = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: '#070818',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '60px 70px',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Background Radial Neon Glows */}
        <div
          style={{
            position: 'absolute',
            right: '-100px',
            top: '-100px',
            width: '650px',
            height: '650px',
            background: 'radial-gradient(circle, rgba(236,72,153,0.35) 0%, rgba(99,102,241,0.2) 50%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '-80px',
            bottom: '-80px',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Top Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: '900',
              color: '#6366F1',
              display: 'flex',
              alignItems: 'center',
              letterSpacing: '-1px',
            }}
          >
            SPIEL<span style={{ color: '#ffffff' }}>CADE</span>
          </div>

          <div
            style={{
              background: 'linear-gradient(90deg, #EC4899, #8B5CF6)',
              padding: '8px 24px',
              borderRadius: '100px',
              color: '#FFFFFF',
              fontSize: '18px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 4px 20px rgba(236,72,153,0.4)',
              letterSpacing: '1px',
            }}
          >
            ⚔️ HIGH SCORE CHALLENGE
          </div>
        </div>

        {/* Center Versus Block */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            width: '100%',
          }}
        >
          {/* Challenger Callout Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '20px',
              padding: '16px 24px',
              width: 'fit-content',
            }}
          >
            <div
              style={{
                fontSize: '28px',
                display: 'flex',
              }}
            >
              🔥
            </div>
            <div
              style={{
                fontSize: '26px',
                fontWeight: '800',
                color: '#FBBF24',
                display: 'flex',
              }}
            >
              @{challenger}
            </div>
            <div
              style={{
                fontSize: '24px',
                color: '#E2E8F0',
                display: 'flex',
              }}
            >
              scored
            </div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: '900',
                color: '#F43F5E',
                background: 'rgba(244,63,94,0.15)',
                padding: '4px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(244,63,94,0.3)',
                display: 'flex',
              }}
            >
              {formattedScore} PTS
            </div>
          </div>

          {/* Target Game Question */}
          <div
            style={{
              fontSize: '64px',
              fontWeight: '900',
              color: '#FFFFFF',
              lineHeight: 1.1,
              display: 'flex',
              letterSpacing: '-1.5px',
            }}
          >
            Can you beat this in {title}?
          </div>

          <div
            style={{
              fontSize: '24px',
              color: '#94A3B8',
              display: 'flex',
            }}
          >
            Accept the match and play free online instantly • No download or install required
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                background: 'rgba(99,102,241,0.2)',
                border: '1px solid rgba(99,102,241,0.4)',
                borderRadius: '12px',
                padding: '8px 18px',
                color: '#A5B4FC',
                fontSize: '18px',
                fontWeight: '700',
                display: 'flex',
              }}
            >
              🎮 {category}
            </div>
            <div
              style={{
                background: 'rgba(16,185,129,0.2)',
                border: '1px solid rgba(16,185,129,0.4)',
                borderRadius: '12px',
                padding: '8px 18px',
                color: '#6EE7B7',
                fontSize: '18px',
                fontWeight: '700',
                display: 'flex',
              }}
            >
              ⚡ Instant Play
            </div>
          </div>

          <div
            style={{
              fontSize: '22px',
              fontWeight: '800',
              color: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            spielcade.com/games/{slug} ➔
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
