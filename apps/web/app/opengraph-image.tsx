import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/seo';

export const runtime = 'edge';
export const alt = 'PlayHub - Play Free Browser Games';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0B1A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          position: 'relative',
          textAlign: 'center',
        }}
      >
        {/* Background Decorative Element */}
        <div
          style={{
            position: 'absolute',
            width: '800px',
            height: '800px',
            background: 'linear-gradient(to bottom right, #6366f1, transparent)',
            borderRadius: '50%',
            filter: 'blur(120px)',
            opacity: 0.15,
          }}
        />

        {/* Brand */}
        <div
          style={{
            fontSize: '120px',
            fontWeight: '900',
            color: 'white',
            lineHeight: 1.1,
            marginBottom: '40px',
            display: 'flex',
          }}
        >
          {siteConfig.name}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '48px',
            fontWeight: '600',
            color: '#9ca3af',
            display: 'flex',
          }}
        >
          Play the best free online browser games.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
