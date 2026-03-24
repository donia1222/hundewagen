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
        <body style={{ margin: 0, padding: 0, background: '#ffffff' }}>
          <div style={{
            minHeight: '100vh',
            background: '#ffffff',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: '#1a1a1a', fontFamily: "'Segoe UI', sans-serif", textAlign: 'center', padding: '2rem',
          }}>
            {/* Logo Lweb */}
            <img
              src="/logolweb.png"
              alt="Lweb Logo"
              style={{ width: '180px', marginBottom: '2rem' }}
            />
            <div style={{ marginTop: '1rem', width: '40px', height: '2px', background: '#1a1a1a', borderRadius: '2px', opacity: 0.2 }} />
            <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#444', lineHeight: 2 }}>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem', color: '#1a1a1a' }}>Lweb Schweiz</p>
              <p style={{ margin: 0 }}>App Entwickler &amp; Full-Stack Developer in Buchs SG</p>
              <p style={{ margin: 0, color: '#777', fontSize: '0.85rem' }}>
                Native iOS &amp; Android Apps, moderne Websites und KI-Lösungen.<br />
                Faire Preise, direkt vom Entwickler.
              </p>
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'center' }}>
                <a href="mailto:info@lweb.ch" style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: 500 }}>info@lweb.ch</a>
                <a href="tel:+41765608645" style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: 500 }}>+41 76 560 86 45</a>
                <a href="https://www.lweb.ch" target="_blank" rel="noopener noreferrer" style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: 500 }}>www.lweb.ch</a>
                <p style={{ margin: 0, color: '#888', fontSize: '0.8rem' }}>9475 Sevelen, Schweiz</p>
              </div>
            </div>
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
