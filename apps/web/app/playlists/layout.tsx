import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Curated Game Playlists & Binge Play | Spielcade',
  description: 'Explore handpicked game playlists curated by the Spielcade editorial team. Launch continuous Binge Play sessions across coffee break, reflex, and puzzle collections.',
  keywords: ['game playlists', 'binge gaming', 'coffee break games', 'retro arcade collections', 'browser game queues'],
  alternates: {
    canonical: 'https://spielcade.com/playlists',
  },
  openGraph: {
    title: 'Curated Game Playlists - Spielcade',
    description: 'Explore handpicked game playlists and launch continuous Binge Play sessions.',
    type: 'website',
    url: 'https://spielcade.com/playlists',
  },
};

export default function PlaylistsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
