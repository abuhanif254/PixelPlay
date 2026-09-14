import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tournament Arena & Daily Arcade Cups | Spielcade',
  description: 'Compete in 24-hour Daily Arcade Cups and weekend Blitz Tournaments. Climb the live standings, claim XP prize pools, and win exclusive champion badges.',
  keywords: ['arcade tournament', 'online gaming cup', 'daily game challenge', 'blitz championship', 'high score contest'],
  openGraph: {
    title: 'Tournament Arena & Daily Cups - Spielcade',
    description: 'Enter today’s high-score tournament, battle top players in real time, and earn golden champion rewards.',
    type: 'website',
    url: 'https://spielcade.com/tournaments',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tournament Arena - Spielcade',
    description: 'Enter today’s high-score tournament, battle top players in real time, and earn golden champion rewards.',
  },
};

export default function TournamentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
