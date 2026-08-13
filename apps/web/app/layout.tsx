import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://pixelplay.com'),
  manifest: "/manifest.json",
  title: {
    default: 'PixelPlay | Best Free Online Browser Games',
    template: '%s | PixelPlay Games',
  },
  description: 'Play the best free online browser games instantly. No downloads required. Join millions of players worldwide on PixelPlay.',
  keywords: ['browser games', 'free games', 'online games', 'html5 games', 'play now'],
  authors: [{ name: 'PixelPlay Team' }],
  creator: 'PixelPlay',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pixelplay.com',
    title: 'PixelPlay | Best Free Online Browser Games',
    description: 'Play the best free online browser games instantly. No downloads required.',
    siteName: 'PixelPlay Games',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PixelPlay | Best Free Online Browser Games',
    description: 'Play the best free online browser games instantly. No downloads required.',
    creator: '@pixelplay',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'PixelPlay Games',
  url: 'https://pixelplay.com',
  description: 'Play the best free online browser games instantly.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://pixelplay.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
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
          strategy="afterInteractive"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
