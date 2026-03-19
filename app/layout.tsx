import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/next';
import { CookieBanner } from '@/components/cookie-banner'

// ⚙️ MANTENIMIENTO: cambia a false para volver al estado normal
const MAINTENANCE_MODE = true


export const metadata: Metadata = {
  title: 'US - Fishing & Huntingshop',
  description: 'Ihr Spezialist für Jagd- und Angelausrüstung. Premium Outdoor-Ausrüstung zu fairen Preisen.',
  generator: '9745 Sevelen',
  icons: {
    icon: '/favicon.png',
    apple: '/icon-192x192.png',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#2C5F2E',
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  if (MAINTENANCE_MODE) {
    return (
      <html lang="en">
        <body style={{ margin: 0, padding: 0, background: '#0f0f0f' }}>
          <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f0f 0%, #1a2e1a 50%, #0f0f0f 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: 'white', fontFamily: "'Segoe UI', sans-serif", textAlign: 'center', padding: '2rem',
          }}>
            <p style={{ fontSize: '0.85rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#4ade80', marginBottom: '1rem' }}>
              US - Fishing &amp; Huntingshop
            </p>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800', margin: '0 0 1.5rem', lineHeight: 1.1 }}>
              Wir sind bald zurück
            </h1>
            <p style={{ fontSize: '1.05rem', opacity: 0.6, maxWidth: '380px', lineHeight: 1.7, margin: 0 }}>
              Wir arbeiten gerade daran.<br />Bald sind wir für Sie bereit!
            </p>
            <div style={{ marginTop: '3rem', width: '40px', height: '2px', background: '#4ade80', borderRadius: '2px' }} />
            <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', opacity: 0.3 }}>
              9745 Sevelen, Schweiz
            </p>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <body>{children} <Analytics /><CookieBanner /></body>
    </html>
  )
}
