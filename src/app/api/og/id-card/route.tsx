import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'Unknown';
    const name = searchParams.get('name') || username;
    const rank = searchParams.get('rank') || 'ENSIGN';
    const division = searchParams.get('division') || 'OPERATIONS';
    const serial = searchParams.get('serial') || 'SFC-000000';
    const level = searchParams.get('level') || '1';

    // Division colors
    const divisionColors: Record<string, string> = {
      OPERATIONS: '#f59e0b',
      SCIENCE: '#22d3ee',
      ENGINEERING: '#ef4444',
      COMMAND: '#f59e0b',
    };
    const divColor = divisionColors[division] || '#f59e0b';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000',
            padding: 40,
          }}
        >
          {/* ID Card */}
          <div
            style={{
              width: 900,
              height: 500,
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: 20,
              border: `4px solid ${divColor}`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Top Header Bar */}
            <div style={{ display: 'flex', height: 60 }}>
              <div
                style={{
                  width: 200,
                  height: 60,
                  background: divColor,
                  borderBottomRightRadius: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: '#000', fontSize: 14, fontWeight: 'bold', letterSpacing: 3 }}>
                  LCARS
                </span>
              </div>
              <div
                style={{
                  flex: 1,
                  background: divColor,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 24,
                }}
              >
                <span style={{ color: '#000', fontSize: 16, fontWeight: 'bold', letterSpacing: 4 }}>
                  STARFLEET DEVELOPER COMMAND
                </span>
              </div>
              <div
                style={{
                  width: 100,
                  height: 60,
                  background: '#9370db',
                  borderBottomLeftRadius: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: '#000', fontSize: 18, fontWeight: 'bold' }}>2025</span>
              </div>
            </div>

            {/* Main Content */}
            <div style={{ display: 'flex', flex: 1, padding: 32, gap: 32 }}>
              {/* Photo Section */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: 160,
                    height: 200,
                    background: divColor,
                    borderRadius: 12,
                    padding: 4,
                    display: 'flex',
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      background: '#000',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: 72, fontWeight: 'bold', color: divColor }}>
                      {username[0].toUpperCase()}
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: 10, color: '#666', marginTop: 8, letterSpacing: 2 }}>
                  PHOTO ID
                </span>
              </div>

              {/* Info Section */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Name */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 10, color: '#666', letterSpacing: 2 }}>NAME</span>
                  <span style={{ fontSize: 36, fontWeight: 'bold', color: '#fff' }}>{name}</span>
                  <span style={{ fontSize: 18, color: '#9370db' }}>@{username}</span>
                </div>

                {/* Rank & Division */}
                <div style={{ display: 'flex', gap: 48 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 10, color: '#666', letterSpacing: 2 }}>RANK</span>
                    <span style={{ fontSize: 20, fontWeight: 'bold', color: divColor }}>{rank}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 10, color: '#666', letterSpacing: 2 }}>DIVISION</span>
                    <span style={{ fontSize: 20, fontWeight: 'bold', color: divColor }}>{division}</span>
                  </div>
                </div>

                {/* Serial & Clearance */}
                <div style={{ display: 'flex', gap: 48 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 10, color: '#666', letterSpacing: 2 }}>SERIAL NO.</span>
                    <span style={{ fontSize: 18, color: '#22d3ee', fontFamily: 'monospace' }}>{serial}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 10, color: '#666', letterSpacing: 2 }}>CLEARANCE</span>
                    <span style={{ fontSize: 18, fontWeight: 'bold', color: '#cc6666' }}>LEVEL {level}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div style={{ display: 'flex', height: 40 }}>
              <div
                style={{
                  width: 100,
                  background: '#cc6666',
                  borderTopRightRadius: 20,
                }}
              />
              <div
                style={{
                  flex: 1,
                  background: 'linear-gradient(to right, #cc6666, #9370db, #22d3ee)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: '#000', fontSize: 12, fontWeight: 'bold', letterSpacing: 3 }}>
                  INITIALIZED.DEV
                </span>
              </div>
              <div
                style={{
                  width: 100,
                  background: '#22d3ee',
                  borderTopLeftRadius: 20,
                }}
              />
            </div>

            {/* Holographic overlay effect */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 4px,
                  rgba(255,255,255,0.02) 4px,
                  rgba(255,255,255,0.02) 8px
                )`,
              }}
            />
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG Image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
