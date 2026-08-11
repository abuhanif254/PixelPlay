import { ImageResponse } from 'next/og';
import { gamesRegistry } from '@pixelplay/games/registry';
import { siteConfig } from '@/lib/seo';

export const runtime = 'edge';
export const alt = 'Game preview';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const game = gamesRegistry[params.slug];

  if (!game) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: '#0A0B1A',
            color: 'white',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {siteConfig.name} - Play Free Browser Games
        </div>
      ),
      {
        ...size,
      }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0B1A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Background Decorative Element */}
        <div
          style={{
            position: 'absolute',
            right: '-100px',
            top: '-100px',
            width: '600px',
            height: '600px',
            background: 'linear-gradient(to bottom right, #6366f1, transparent)',
            borderRadius: '50%',
            filter: 'blur(100px)',
            opacity: 0.2,
          }}
        />

        {/* Brand */}
        <div
          style={{
            fontSize: '40px',
            fontWeight: 'bold',
            color: '#6366f1',
            marginBottom: '40px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {siteConfig.name}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '96px',
            fontWeight: '900',
            color: 'white',
            lineHeight: 1.1,
            marginBottom: '30px',
            display: 'flex',
          }}
        >
          Play {game.config.title}
        </div>

        {/* Meta Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              background: '#12132A',
              padding: '12px 24px',
              borderRadius: '100px',
              color: 'white',
              fontSize: '32px',
              fontWeight: '600',
              display: 'flex',
            }}
          >
            ★ {game.config.rating || '4.5'}
          </div>
          <div
            style={{
              background: '#12132A',
              padding: '12px 24px',
              borderRadius: '100px',
              color: '#9ca3af',
              fontSize: '32px',
              display: 'flex',
            }}
          >
            {game.config.category || 'Arcade'}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
