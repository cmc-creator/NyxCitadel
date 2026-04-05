import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'NyxCitadel — Healthcare Compliance That Never Sleeps';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        background: '#060b16',
        fontFamily: 'system-ui, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Teal glow — top right */}
      <div
        style={{
          position: 'absolute',
          top: -140,
          right: -140,
          width: 580,
          height: 580,
          background: 'radial-gradient(circle, rgba(13,115,119,0.60) 0%, transparent 68%)',
          borderRadius: '50%',
          display: 'flex',
        }}
      />
      {/* Blue glow — bottom left */}
      <div
        style={{
          position: 'absolute',
          bottom: -100,
          left: -90,
          width: 460,
          height: 460,
          background: 'radial-gradient(circle, rgba(29,78,216,0.28) 0%, transparent 68%)',
          borderRadius: '50%',
          display: 'flex',
        }}
      />
      {/* Subtle amber center-right */}
      <div
        style={{
          position: 'absolute',
          top: '45%',
          right: 80,
          width: 220,
          height: 220,
          background: 'radial-gradient(circle, rgba(180,130,20,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          display: 'flex',
        }}
      />

      {/* Main layout */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '68px 88px',
          flex: 1,
          position: 'relative',
        }}
      >
        {/* Top — category pill */}
        <div style={{ display: 'flex' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(13,115,119,0.22)',
              border: '1px solid rgba(13,115,119,0.52)',
              borderRadius: 100,
              padding: '9px 24px',
            }}
          >
            <span style={{ color: '#5edfde', fontSize: 18, fontWeight: 600 }}>
              ⚕  Healthcare Compliance Platform
            </span>
          </div>
        </div>

        {/* Middle — brand + tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              fontSize: 86,
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-3px',
              lineHeight: 1,
            }}
          >
            NyxCitadel™
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 500,
              color: '#14b8b3',
              lineHeight: 1.3,
              maxWidth: 680,
            }}
          >
            The only compliance platform that never sleeps.
            Survey-ready — always.
          </div>
        </div>

        {/* Bottom — trust badges + domain */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            {['HIPAA Compliant', 'CMS Aligned', 'JC Ready', 'SOC 2 Ready'].map((badge) => (
              <div
                key={badge}
                style={{
                  display: 'flex',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.13)',
                  borderRadius: 8,
                  padding: '9px 18px',
                  color: '#94a3b8',
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                {badge}
              </div>
            ))}
          </div>
          <div style={{ color: '#3f6070', fontSize: 19, fontWeight: 600 }}>
            nyxcitadel.com
          </div>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
