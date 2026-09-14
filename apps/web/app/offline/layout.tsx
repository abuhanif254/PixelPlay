import { Metadata } from 'next';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Offline Arcade Hub — Zero Internet Browser Gaming | Spielcade',
  description: 'Play free offline HTML5 web games anywhere with zero internet connection. Instant play with cached games and automatic score synchronization.',
  alternates: {
    canonical: 'https://spielcade.com/offline',
  },
};

export default function OfflineLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
