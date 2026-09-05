import { ImageResponse } from 'next/og';
import { categoriesData } from '@/lib/mockCategories';

export const runtime = 'edge';
export const alt = 'Category preview';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const category = categoriesData[params.slug] || {
    title: params.slug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
    icon: '🎮',
    color: '#6366f1',
    description: 'Play the best free online browser games with zero downloads on Spielcade.',
    stats: { games: '100+', plays: '2.5M+', rating: '4.8' },
  };

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
        {/* Decorative Glow */}
        <div
          style={{
            position: 'absolute',
            right: '-80px',
            top: '-80px',
            width: '650px',
            height: '650px',
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
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '8px 24px',
              borderRadius: '100px',
              color: '#e0e7ff',
              fontSize: '20px',
              fontWeight: '700',
              display: 'flex',
            }}
          >
            INSTANT PLAY • UNBLOCKED
          </div>
        </div>

        {/* Center Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxWidth: '920px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <span style={{ fontSize: '72px' }}>{category.icon}</span>
            <span
              style={{
                fontSize: '84px',
                fontWeight: '900',
                color: 'white',
                letterSpacing: '-2px',
                lineHeight: 1.05,
              }}
            >
              {category.title}
            </span>
          </div>
          <div
            style={{
              fontSize: '26px',
              color: '#9ca3af',
              lineHeight: 1.4,
              display: 'flex',
            }}
          >
            {category.description}
          </div>
        </div>

        {/* Meta Stats Badges */}
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
              color: '#a5b4fc',
              fontSize: '24px',
              fontWeight: '700',
              display: 'flex',
            }}
          >
            {category.stats?.games || '100+'} Games
          </div>
          <div
            style={{
              background: '#12132A',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '12px 28px',
              borderRadius: '100px',
              color: '#34d399',
              fontSize: '24px',
              fontWeight: '700',
              display: 'flex',
            }}
          >
            {category.stats?.plays || '1M+'} Total Plays
          </div>
          <div
            style={{
              background: '#6366f1',
              padding: '12px 32px',
              borderRadius: '100px',
              color: 'white',
              fontSize: '24px',
              fontWeight: '800',
              display: 'flex',
            }}
          >
            EXPLORE GENRE →
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}