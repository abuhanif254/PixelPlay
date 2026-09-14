import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'For You — Personalized Games Discovery | Spielcade',
  description: 'AI-tailored game recommendations matching your play style, genres, and high-score achievements. Instant free HTML5 games with zero install.',
  alternates: {
    canonical: 'https://spielcade.com/for-you',
  },
};

export default function ForYouLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
