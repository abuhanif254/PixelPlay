import Image from 'next/image';
import Link from 'next/link';
import { gamesRegistry } from '@pixelplay/games';
import AllGamesClient from './AllGamesClient';

export default function AllGamesPage() {
  // Convert registry to array for easier consumption
  const allGames = Object.entries(gamesRegistry).map(([slug, game]) => ({
    slug,
    ...game.config
  }));

  return (
    <div className="min-h-screen bg-[#05050F] text-white pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6 font-medium">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>&gt;</span>
          <span className="text-gray-200">All Games</span>
        </div>

        {/* Hero Section */}
        <div className="relative w-full h-[320px] rounded-[32px] overflow-hidden bg-gradient-to-r from-[#111228] to-[#1D1B4B] border border-white/5 mb-8 flex items-center shadow-2xl shadow-primary/20">
          <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          
          <div className="relative z-10 w-full md:w-1/2 p-8 md:p-12 lg:p-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-outfit font-extrabold text-white mb-4 leading-tight">
              All Games
            </h1>
            <p className="text-gray-300 text-lg max-w-md">
              Explore our collection of 500+ free online games. No downloads, no installs - just click and play your favorite games instantly!
            </p>
          </div>
          
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-1/2">
            <div className="relative w-full h-full">
              <Image 
                src="/images/hero-controller-3d.jpg" 
                alt="Gaming Controller" 
                fill
                className="object-cover object-left mask-image-linear-left"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1D1B4B] via-transparent to-transparent" />
            </div>
          </div>
        </div>

        {/* Interactive Client Section */}
        <AllGamesClient initialGames={allGames} />
        
      </div>
    </div>
  );
}
