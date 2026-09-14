import { Metadata } from 'next';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Daily Bounties & Season 1 Battle Pass | Spielcade',
  description: 'Complete 24-hour arcade quests, earn Battle Stars, and unlock exclusive cyber cosmetic titles and avatar borders on Spielcade.',
  alternates: {
    canonical: 'https://spielcade.com/quests',
  },
};

export default function QuestsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
