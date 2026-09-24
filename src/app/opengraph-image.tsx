import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'KeyArena — Serious Typing Performance Platform';
export const size = {
  width: 1200,
  height: 630
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
          color: '#ffffff',
          fontFamily: 'monospace',
          padding: '60px 80px',
          border: '12px solid #1a1a1a'
        }}
      >
        {/* Terminal Keycap Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px'
          }}
        >
          <div
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '20px',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '28px'
            }}
          >
            <span
              style={{
                fontSize: '52px',
                fontWeight: 'bold',
                color: '#000000'
              }}
            >
              {'>_'}
            </span>
          </div>

          <div style={{ display: 'flex', fontSize: '72px', fontWeight: 'bold' }}>
            <span style={{ color: '#9ca3af' }}>Key</span>
            <span style={{ color: '#ffffff' }}>Arena</span>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '32px',
            color: '#e5e5e5',
            textAlign: 'center',
            fontWeight: '600',
            marginBottom: '20px'
          }}
        >
          Serious Typing Performance Platform
        </div>

        {/* Feature Pills */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#1c1c1c',
              border: '1px solid #333333',
              borderRadius: '8px',
              padding: '10px 24px',
              fontSize: '20px',
              color: '#ffffff'
            }}
          >
            15s • 30s • 60s • 120s Tests
          </div>
          <div
            style={{
              backgroundColor: '#1c1c1c',
              border: '1px solid #333333',
              borderRadius: '8px',
              padding: '10px 24px',
              fontSize: '20px',
              color: '#ffffff'
            }}
          >
            N-Gram Deliberate Drills
          </div>
          <div
            style={{
              backgroundColor: '#1c1c1c',
              border: '1px solid #333333',
              borderRadius: '8px',
              padding: '10px 24px',
              fontSize: '20px',
              color: '#ffffff'
            }}
          >
            100% Free & Local Privacy
          </div>
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
