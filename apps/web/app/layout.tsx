import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';
import './globals.css';

const PwaInstallBanner = dynamic(() => import('@/components/PwaInstallBanner'), { ssr: false });
const PWARegistration = dynamic(() => import('@/components/PWARegistration'), { ssr: false });
const OfflineBanner = dynamic(() => import('@/components/OfflineBanner'), { ssr: false });
const LevelUpModal = dynamic(() => import('@/components/LevelUpModal'), { ssr: false });
const ArcadeRadio = dynamic(() => import('@/components/ArcadeRadio'), { ssr: false });
const ArcadePulse = dynamic(() => import('@/components/ArcadePulse'), { ssr: false });
const SecretVaultModal = dynamic(() => import('@/components/SecretVaultModal'), { ssr: false });
const CookieConsentBanner = dynamic(() => import('@/components/CookieConsentBanner'), { ssr: false });

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-outfit',
});

export const viewport: Viewport = {
  themeColor: '#0A0B1A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://spielcade.com'),
  manifest: "/manifest.json",
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Spielcade',
  },
  title: {
    default: 'Spielcade | Best Free Online Browser Games',
    template: '%s | Spielcade Games',
  },
  description: 'Play the best free online browser games instantly. No downloads required. Join millions of players worldwide on Spielcade.',
  keywords: ['browser games', 'free games', 'online games', 'html5 games', 'play now'],
  authors: [{ name: 'Spielcade Team' }],
  creator: 'Spielcade',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://spielcade.com',
    title: 'Spielcade | Best Free Online Browser Games',
    description: 'Play the best free online browser games instantly. No downloads required.',
    siteName: 'Spielcade Games',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spielcade | Best Free Online Browser Games',
    description: 'Play the best free online browser games instantly. No downloads required.',
    creator: '@spielcade',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'G-SPIELCADE-VERIFICATION',
  },
  other: {
    'google-adsense-account': 'ca-pub-9824094207004107',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://spielcade.com/#organization',
      'name': 'Spielcade',
      'url': 'https://spielcade.com',
      'logo': {
        '@type': 'ImageObject',
        '@id': 'https://spielcade.com/#logo',
        'url': 'https://spielcade.com/logo.png',
        'caption': 'Spielcade'
      },
      'sameAs': [
        'https://twitter.com/spielcade',
        'https://www.youtube.com/@spielcade'
      ]
    },
    {
      '@type': 'WebSite',
      '@id': 'https://spielcade.com/#website',
      'url': 'https://spielcade.com',
      'name': 'Spielcade Games',
      'description': 'Play the best free online browser games instantly with zero downloads.',
      'publisher': {
        '@id': 'https://spielcade.com/#organization'
      },
      'potentialAction': {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://spielcade.com/games?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    }
  ]
};

import { ThemeProvider } from '@/components/ThemeProvider';
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const monetagZone = process.env.NEXT_PUBLIC_MONETAG_ZONE_ID;
  const isMonetagLive = monetagZone && monetagZone !== 'mock-zone-id';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://img.gamemonetize.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://img.gamemonetize.com" />
        <link rel="preconnect" href="https://img.gamedistribution.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://img.gamedistribution.com" />
        <link rel="dns-prefetch" href="https://www.highperformanceformat.com" />
        <link rel="preconnect" href="https://html5.gamedistribution.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://html5.gamedistribution.com" />
        <link rel="alternate" type="application/rss+xml" title="Spielcade Games RSS Feed" href="/feed.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {isMonetagLive && (
          <meta name="monetag" content={monetagZone} />
        )}
      </head>
      <body className={`${inter.className} ${inter.variable} ${outfit.variable} bg-background text-foreground antialiased min-h-screen flex flex-col`}>
        {isMonetagLive && (
          <Script 
            src="https://alwingulla.com/88/tag.min.js" 
            data-zone={monetagZone} 
            data-cfasync="false" 
            async 
            strategy="lazyOnload"
          />
        )}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PWARegistration />
          <OfflineBanner />
          <Navbar />
          <main id="main-scroll-container" className="flex-grow w-full max-w-full overflow-x-hidden">
            {children}
          </main>
          <Footer />
          <PwaInstallBanner />
          <LevelUpModal />
          <ArcadeRadio />
          <ArcadePulse />
          <SecretVaultModal />
          <CookieConsentBanner />
        </ThemeProvider>
      </body>
    </html>

  );
}
