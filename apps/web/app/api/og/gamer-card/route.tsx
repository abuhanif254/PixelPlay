import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username') || 'Gamer';

  let displayName = username;
  let level = parseInt(searchParams.get('level') || '1', 10);
  let xp = parseInt(searchParams.get('xp') || '500', 10);
  let streak = parseInt(searchParams.get('streak') || '1', 10);
  let avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(username)}`;

  // Query Supabase for real player credentials if available
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    );
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url, xp, level, streak')
      .eq('username', username)
      .single();

    if (profile) {
      if (profile.full_name) displayName = profile.full_name;
      if (typeof profile.level === 'number') level = profile.level;
      if (typeof profile.xp === 'number') xp = profile.xp;
      if (typeof profile.streak === 'number') streak = profile.streak;
      if (profile.avatar_url) avatarUrl = profile.avatar_url;
    }
  } catch {}

  // Compute gamer rank title based on level
  let rankTitle = 'Arcade Cadet';
  let tierBadgeColor = '#6366F1';
  let tierGradient = 'linear-gradient(90deg, #6366F1, #8B5CF6)';

  if (level >= 25) {
    rankTitle = 'Apex Grandmaster';
    tierBadgeColor = '#F43F5E';
    tierGradient = 'linear-gradient(90deg, #F43F5E, #FB7185)';
  } else if (level >= 15) {
    rankTitle = 'Esports Champion';
    tierBadgeColor = '#F59E0B';
    tierGradient = 'linear-gradient(90deg, #F59E0B, #FBBF24)';
  } else if (level >= 10) {
    rankTitle = 'Gold Master';
    tierBadgeColor = '#10B981';
    tierGradient = 'linear-gradient(90deg, #10B981, #34D399)';
  } else if (level >= 5) {
    rankTitle = 'Cyber Veteran';
    tierBadgeColor = '#06B6D4';
    tierGradient = 'linear-gradient(90deg, #06B6D4, #38BDF8)';
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
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Background Ambient Glows */}
        <div
          style={{
            position: 'absolute',
            right: '-80px',
            top: '-80px',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '-80px',
            bottom: '-80px',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Passport Card Frame */}
        <div
          style={{
            background: 'rgba(15, 17, 38, 0.95)',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '28px',
            width: '1120px',
            height: '550px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '44px 50px',
            position: 'relative',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          }}
        >
          {/* Header Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              paddingBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: '900',
                  color: '#6366F1',
                  letterSpacing: '-1px',
                  display: 'flex',
                }}
              >
                SPIEL<span style={{ color: '#FFFFFF' }}>CADE</span>
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '800',
                  color: '#94A3B8',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  display: 'flex',
                }}
              >
                // OFFICIAL GAMER PASSPORT
              </div>
            </div>

            <div
              style={{
                background: tierGradient,
                padding: '6px 20px',
                borderRadius: '999px',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: '900',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: `0 0 20px ${tierBadgeColor}66`,
              }}
            >
              ★ {rankTitle.toUpperCase()}
            </div>
          </div>

          {/* Main Passport Content: Avatar + Player Info + Stats */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              gap: '40px',
              margin: '20px 0',
            }}
          >
            {/* Left: Avatar & Identity */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '28px',
              }}
            >
              <div
                style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '26px',
                  border: `3px solid ${tierBadgeColor}`,
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  boxShadow: `0 0 30px ${tierBadgeColor}44`,
                }}
              >
                <img
                  src={avatarUrl}
                  width="134"
                  height="134"
                  style={{
                    borderRadius: '22px',
                    objectFit: 'cover',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div
                  style={{
                    fontSize: '44px',
                    fontWeight: '900',
                    color: '#FFFFFF',
                    lineHeight: 1.1,
                    display: 'flex',
                  }}
                >
                  {displayName}
                </div>
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: '#A5B4FC',
                    display: 'flex',
                  }}
                >
                  @{username}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '4px',
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(99,102,241,0.2)',
                      border: '1px solid rgba(99,102,241,0.5)',
                      padding: '4px 14px',
                      borderRadius: '8px',
                      color: '#C7D2FE',
                      fontSize: '14px',
                      fontWeight: '800',
                      display: 'flex',
                    }}
                  >
                    LEVEL {level}
                  </div>
                  <div
                    style={{
                      background: 'rgba(245,158,11,0.15)',
                      border: '1px solid rgba(245,158,11,0.4)',
                      padding: '4px 14px',
                      borderRadius: '8px',
                      color: '#FCD34D',
                      fontSize: '14px',
                      fontWeight: '800',
                      display: 'flex',
                    }}
                  >
                    🔥 {streak} DAY STREAK
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Key Stats Matrix */}
            <div
              style={{
                display: 'flex',
                gap: '18px',
              }}
            >
              <div
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '18px',
                  padding: '18px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '140px',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '800',
                    color: '#94A3B8',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                    display: 'flex',
                  }}
                >
                  TOTAL XP
                </div>
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: '900',
                    color: '#FBBF24',
                    display: 'flex',
                  }}
                >
                  {xp.toLocaleString()}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '18px',
                  padding: '18px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '140px',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '800',
                    color: '#94A3B8',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                    display: 'flex',
                  }}
                >
                  TIER
                </div>
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: '900',
                    color: '#38BDF8',
                    display: 'flex',
                  }}
                >
                  TOP {Math.max(1, 100 - level * 3)}%
                </div>
              </div>
            </div>
          </div>

          {/* Footer Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '18px',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                color: '#64748B',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>🔒 VERIFIED ON-CHAIN ARCADIA IDENTITY</span>
              <span>•</span>
              <span>NO DOWNLOAD REQUIRED</span>
            </div>

            <div
              style={{
                fontSize: '16px',
                fontWeight: '800',
                color: '#E2E8F0',
                display: 'flex',
              }}
            >
              spielcade.com/profile/{username} ➔
            </div>
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
