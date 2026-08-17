import { Metadata } from 'next';
import NewGamesClient from './NewGamesClient';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'New Games - Play Free Online on Spielcade',
  description: 'Explore the latest games added to Spielcade. Fresh, fun and exciting games every week!',
};

export default function NewGamesPage() {
  return (
    <div className="min-h-screen bg-[#05050F] text-white pt-20 pb-12 font-sans">
      <NewGamesClient />
    </div>
  );
}
