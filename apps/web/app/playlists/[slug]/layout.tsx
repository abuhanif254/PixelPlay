import { Metadata } from 'next';
import { getPlaylistBySlug } from '@/lib/playlists';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const playlist = getPlaylistBySlug(params.slug);
  const title = playlist
    ? `${playlist.title} — Curated Game Playlist | Spielcade`
    : 'Game Playlist | Spielcade';
  const description = playlist?.description || 'Play curated HTML5 game playlists with zero downloads on Spielcade.';
  const canonicalUrl = `https://spielcade.com/playlists/${params.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Spielcade',
      type: 'website',
    },
  };
}

export default function PlaylistDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
