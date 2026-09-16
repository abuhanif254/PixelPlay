import { ImageResponse } from 'next/og';
import { gamesRegistry } from '@spielcade/games/registry';
import { createClient } from '@supabase/supabase-js';
import { siteConfig } from '@/lib/seo';

export const runtime = 'edge';
export const alt = 'Game preview';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const localGame = gamesRegistry[params.slug];
  
  let title = localGame?.config?.title;
  let category = localGame?.config?.category || 'Arcade';
  let rating = localGame?.config?.rating || 4.8;
  let imageUrl = localGame?.config?.image;

  if (!title) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    );
    const { data: dbGame } = await supabase
      .from('games')
      .select('title, category, rating, image_url')
      .eq('slug', params.slug)
      .maybeSingle();

    if (dbGame) {
      title = dbGame.title;
      category = dbGame.category || 'Arcade';
      rating = dbGame.rating || 4.8;
      imageUrl = dbGame.image_url;
    }
  }

  if (!title) {
    title = params.slug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
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
          padding: '70px 80px',
          position: 'relative',
        }}
      >
        {/* Background Glow */}
        <div
          style={{
            position: 'absolute',
            right: '-60px',
            top: '-60px',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Top Header */}
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
              fontSize: '36px',
              fontWeight: '900',
              color: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              letterSpacing: '-1px',
            }}
          >
            SPIEL<span style={{ color: '#ffffff' }}>CADE</span>
          </div>

          <div
            style={{
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.4)',
              padding: '8px 24px',
              borderRadius: '100px',
              color: '#a5b4fc',
              fontSize: '20px',
              fontWeight: '700',
              display: 'flex',
            }}
          >
            100% FREE • NO DOWNLOAD
          </div>
        </div>

        {/* Center Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxWidth: '900px',
          }}
        >
          <div
            style={{
              fontSize: '76px',
              fontWeight: '900',
              color: 'white',
              lineHeight: 1.05,
              display: 'flex',
              letterSpacing: '-2px',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '28px',
              color: '#9ca3af',
              display: 'flex',
            }}
          >
            Play free online instantly in your browser — unblocked on mobile & PC
          </div>
        </div>

        {/* Meta Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              background: '#12132A',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '12px 28px',
              borderRadius: '100px',
              color: '#fbbf24',
              fontSize: '26px',
              fontWeight: '700',
              display: 'flex',
            }}
          >
            ★ {Number(rating).toFixed(1)} / 5.0
          </div>
          <div
            style={{
              background: '#12132A',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '12px 28px',
              borderRadius: '100px',
              color: '#e0e7ff',
              fontSize: '26px',
              fontWeight: '600',
              display: 'flex',
            }}
          >
            {category} Games
          </div>
          <div
            style={{
              background: '#6366f1',
              padding: '12px 32px',
              borderRadius: '100px',
              color: 'white',
              fontSize: '26px',
              fontWeight: '800',
              display: 'flex',
            }}
          >
            PLAY NOW →
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
