import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/next';
import { CookieBanner } from '@/components/cookie-banner'

// ⚙️ MANTENIMIENTO: cambia a false para volver al estado normal
const MAINTENANCE_MODE = false


export const metadata: Metadata = {
  title: {
    default: 'Hundewagen Shop – Hundewagen kaufen | hundewagen.shop',
    template: '%s | hundewagen.shop',
  },
  description: 'Hundewagen kaufen: Faltbare Hundewagen, Tragetaschen & Zubehör für kleine und große Hunde. Handverlesene Amazon-Auswahl – komfortabel, sicher & schnell geliefert. Jetzt entdecken!',
  keywords: [
    'Hundewagen', 'Hundewagen kaufen', 'Hundewagen faltbar', 'Hundewagen grosse Hunde',
    'Hundewagen bis 15 Kilo', 'Hundewagen bis 20 Kilo', 'Hundewagen ab 20 Kilo',
    'Hunde Buggy', 'Hundebuggy', 'Hundebuggy kaufen', 'Hunde Kinderwagen',
    'Hundewagen Deutschland', 'Hundewagen Schweiz', 'Hundewagen Österreich',
    'Hundewagen Amazon', 'Hundezubehör', 'Hundezubehör kaufen', 'Hundewagen Shop',
    'All-Terrain Hundewagen', 'Hundewagen outdoor', 'Hunde Sportwagen',
    'Hundewagen online kaufen', 'bester Hundewagen', 'Hundewagen Test',
    'Hundewagen günstig', 'Hundewagen Vergleich', 'www.hundewagen.shop',
  ],
  authors: [{ name: 'hundewagen.shop', url: 'https://hundewagen.shop' }],
  creator: 'hundewagen.shop',
  publisher: 'hundewagen.shop',
  metadataBase: new URL('https://www.hundewagen.shop'),
  alternates: {
    canonical: 'https://www.hundewagen.shop',
    languages: {
      'de-DE': 'https://www.hundewagen.shop',
      'de-CH': 'https://www.hundewagen.shop',
      'de-AT': 'https://www.hundewagen.shop',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    alternateLocale: ['de_CH', 'de_AT'],
    url: 'https://www.hundewagen.shop',
    siteName: 'www.hundewagen.shop',
    title: 'Hundewagen kaufen – Faltbare Hundewagen & Zubehör',
    description: 'Entdecke die besten Hundewagen für jeden Hund. Faltbar, sicher und komfortabel – direkt über Amazon. Schnelle Lieferung & einfache Rückgabe. Für Deutschland, Schweiz & Österreich.',
    images: [
      {
        url: '/wagen.png',
        width: 1200,
        height: 630,
        alt: 'Hundewagen Shop – www.hundewagen.shop',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hundewagen kaufen – www.hundewagen.shop',
    description: 'Die besten faltbaren Hundewagen & Zubehör für kleine und große Hunde. Für Deutschland 🇩🇪, Schweiz 🇨🇭 & Österreich 🇦🇹. Amazon-Auswahl, schnell geliefert.',
    images: ['/wagen.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.png',
    apple: '/icon-192x192.png',
  },
  manifest: '/manifest.json',
  category: 'shopping',
}

export const viewport: Viewport = {
  themeColor: '#4F7CFF',
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  if (MAINTENANCE_MODE) {
    return (
      <html lang="de">
        <body style={{ margin: 0, padding: 0 }}>
          <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(160deg, #f8f9fa 0%, #e9ecef 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
            textAlign: 'center', padding: '2rem',
          }}>
            {/* Card */}
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
              padding: 'clamp(2rem, 5vw, 3.5rem)',
              maxWidth: '520px', width: '100%',
            }}>
              {/* Logo */}
              <img
                src="/logolweb.png"
                alt="Lweb Logo"
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', display: 'block', marginLeft: 'auto', marginRight: 'auto', marginBottom: '0.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}
              />
              <p style={{ margin: '0 0 1.8rem', fontWeight: '700', fontSize: '1rem', color: '#111827' }}>Lweb Schweiz</p>

      

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.8rem' }}>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Kontakt</span>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
              </div>

              {/* Company info */}
              <p style={{ margin: '0 0 0.2rem', fontSize: '0.88rem', color: '#6b7280' }}>App Entwickler &amp; Full-Stack Developer in Buchs SG</p>
              <p style={{ margin: '0 0 1.5rem', fontSize: '0.82rem', color: '#9ca3af' }}>
                Native iOS &amp; Android Apps, moderne Websites und KI-Lösungen.
              </p>

              {/* Contact links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { href: 'mailto:info@lweb.ch', label: 'info@lweb.ch', icon: '✉' },
                  { href: 'tel:+41765608645', label: '+41 76 560 86 45', icon: '📞' },
                  { href: 'https://www.lweb.ch', label: 'www.lweb.ch', icon: '🌐', external: true },
                ].map(({ href, label, icon, external }) => (
                  <a
                    key={href}
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      padding: '0.65rem 1rem',
                      borderRadius: '10px',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      color: '#111827',
                      textDecoration: 'none',
                      fontSize: '0.9rem', fontWeight: 500,
                      transition: 'background 0.15s',
                    }}
                  >
                    <span>{icon}</span> {label}
                  </a>
                ))}
              </div>

              <p style={{ marginTop: '1.5rem', marginBottom: 0, fontSize: '0.78rem', color: '#d1d5db' }}>
                9475 Sevelen, Schweiz
              </p>
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
