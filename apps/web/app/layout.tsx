import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';
import ThreeGlobalCanvas from '@/components/3d/ThreeGlobalCanvas';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://spielcade.com'),
  manifest: "/manifest.json",
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
  }
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Spielcade Games',
  url: 'https://spielcade.com',
  description: 'Play the best free online browser games instantly.'
};

import { ThemeProvider } from '@/components/ThemeProvider';
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Monetag Push Notifications Script (Placeholder Zone ID) */}
        <meta name="monetag" content="mock-verification-code" />
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased min-h-screen flex flex-col`}>
        {/* Monetag Script tag injected outside of head for better performance often recommended by Monetag */}
        <Script 
          src="https://alwingulla.com/88/tag.min.js" 
          data-zone="mock-zone-id" 
          data-cfasync="false" 
          async 
          strategy="lazyOnload"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main id="main-scroll-container" className="flex-grow">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
        
        {/* Global 3D Canvas Portal System */}
        <ThreeGlobalCanvas />
      </body>
    </html>
  );
}
