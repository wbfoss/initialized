import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 'bold',
                background: 'linear-gradient(to right, #60a5fa, #a855f7, #ec4899)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              initialized.dev
            </div>
            <div style={{ fontSize: 32, color: '#9ca3af', marginTop: 20 }}>
              GitHub Year in Review 2025
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // This would need to run in Node.js runtime to use Prisma
    // For edge runtime, we'll create a simpler version
    // In production, you'd want to use a separate API route to fetch the data

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
            position: 'relative',
          }}
        >
          {/* Stars background */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.3,
              backgroundImage: `radial-gradient(2px 2px at 100px 50px, white, transparent),
                               radial-gradient(2px 2px at 300px 150px, white, transparent),
                               radial-gradient(1px 1px at 500px 100px, white, transparent),
                               radial-gradient(2px 2px at 700px 200px, white, transparent),
                               radial-gradient(1px 1px at 900px 80px, white, transparent),
                               radial-gradient(2px 2px at 1100px 170px, white, transparent)`,
            }}
          />

          {/* Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
            }}
          >
            {/* Avatar placeholder */}
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              {username[0].toUpperCase()}
            </div>

            {/* Username */}
            <div style={{ fontSize: 48, fontWeight: 'bold', color: 'white' }}>
              @{username}
            </div>

            {/* Year badge */}
            <div
              style={{
                background: 'rgba(139, 92, 246, 0.3)',
                padding: '12px 32px',
                borderRadius: 100,
                fontSize: 28,
                color: '#a855f7',
                fontWeight: 600,
              }}
            >
              2025 Year in Review
            </div>

            {/* Brand */}
            <div
              style={{
                marginTop: 40,
                fontSize: 32,
                background: 'linear-gradient(to right, #60a5fa, #a855f7, #ec4899)',
                backgroundClip: 'text',
                color: 'transparent',
                fontWeight: 'bold',
              }}
            >
              initialized.dev
            </div>
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
