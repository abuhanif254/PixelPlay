import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';
import ThreeGlobalCanvas from '@/components/3d/ThreeGlobalCanvas';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://spielcade.com'),
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
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Spielcade Games',
  url: 'https://spielcade.com',
  description: 'Play the best free online browser games instantly.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://spielcade.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
};

import { ThemeProvider } from '@/components/ThemeProvider';
import Script from 'next/script';

import { createClient } from '@/lib/supabase/server';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: config } = await supabase.from('site_config').select('config_value').eq('config_key', 'maintenance_mode').single();
  const isMaintenance = config?.config_value === 'true';

  let showMaintenance = isMaintenance;
  
  if (isMaintenance) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role === 'admin') {
        showMaintenance = false;
      }
    }
  }

  if (showMaintenance) {
    return (
      <html lang="en">
        <body className={`${inter.className} bg-[#0A0B1A] text-white h-screen flex flex-col items-center justify-center text-center p-6`}>
          <div className="w-20 h-20 mb-6 bg-[#6366F1]/20 rounded-full flex items-center justify-center mx-auto text-[#6366F1] animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h1 className="text-4xl font-black mb-4 font-outfit text-white">We'll be back soon!</h1>
          <p className="text-gray-400 max-w-md mx-auto">Spielcade is currently undergoing scheduled maintenance to bring you new games and features. Please check back later.</p>
        </body>
      </html>
    );
  }

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
