import { Metadata } from 'next';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Arcade Party Duels — Play Online With Friends | Spielcade',
  description: 'Create private arcade party rooms, challenge friends to simultaneous real-time duels, and see who dominates the live score meter.',
  alternates: {
    canonical: 'https://spielcade.com/party',
  },
};

export default function PartyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
