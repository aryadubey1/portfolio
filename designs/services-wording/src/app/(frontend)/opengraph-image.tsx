import { ImageResponse } from 'next/og'

export const alt = 'Arya Dubey: bring the idea, leave with the finished thing'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background:
            'radial-gradient(circle at 12% 18%, rgba(244,169,191,.75), transparent 42%), radial-gradient(circle at 88% 14%, rgba(152,196,240,.8), transparent 40%), radial-gradient(circle at 62% 92%, rgba(248,215,124,.7), transparent 45%), radial-gradient(circle at 18% 96%, rgba(152,214,189,.7), transparent 40%), #fbfaf7',
          color: '#15161d',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 26, letterSpacing: 6, color: '#2b36d9', textTransform: 'uppercase' }}>
          Arya Dubey · an atlas of things I’ve built
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 96, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>
          <span>Bring the idea.</span>
          <span>Leave with the</span>
          <span>finished thing.</span>
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: '#3c3f4e' }}>aryadubey.tech</div>
      </div>
    ),
    size,
  )
}
