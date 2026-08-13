import React from 'react';
import { Metadata } from 'next';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import ProfileHero from '@/components/profile/ProfileHero';
import ProfileGameRow from '@/components/profile/ProfileGameRow';
import ProfileAchievements from '@/components/profile/ProfileAchievements';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileActivity from '@/components/profile/ProfileActivity';
import ProfileCollections from '@/components/profile/ProfileCollections';

export const metadata: Metadata = {
  title: 'Profile | PixelPlay',
  description: 'Your player profile dashboard.',
};

export const runtime = 'edge';

// Mock data for game rows
const recentGames = [
  { title: '2048', meta: '2 hours ago', image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=200&auto=format&fit=crop' },
  { title: 'Sudoku', meta: 'Yesterday', image: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=200&auto=format&fit=crop' },
  { title: 'Snake', meta: 'Yesterday', image: 'https://images.unsplash.com/photo-1518063319789-7217e3706b32?q=80&w=200&auto=format&fit=crop' },
  { title: 'Block Puzzle', meta: '2 days ago', image: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=200&auto=format&fit=crop' },
  { title: 'Tic Tac Toe', meta: '3 days ago', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=200&auto=format&fit=crop' },
];

const favoriteGames = [
  { title: 'Chess', rating: '4.8', image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=200&auto=format&fit=crop', isFavorite: true },
  { title: 'Minesweeper', rating: '4.6', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=200&auto=format&fit=crop', isFavorite: true },
  { title: 'Word Search', rating: '4.5', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=200&auto=format&fit=crop', isFavorite: true },
  { title: 'Solitaire', rating: '4.7', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=200&auto=format&fit=crop', isFavorite: true },
  { title: 'Sudoku', rating: '4.6', image: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=200&auto=format&fit=crop', isFavorite: true },
];

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#05050F] text-white pt-24 pb-20">
      <div className="container mx-auto px-4 xl:px-8 max-w-[1600px] flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar */}
        <div className="hidden lg:block relative">
          <div className="sticky top-24">
            <ProfileSidebar />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-6 w-full overflow-hidden">
          
          <ProfileHero />

          {/* Row: Recently Played & Favorite Games */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ProfileGameRow title="Recently Played" games={recentGames.slice(0, 4)} viewAllLink="/profile/recent" />
            <ProfileGameRow title="Favorite Games" games={favoriteGames.slice(0, 4)} viewAllLink="/profile/favorites" />
          </div>

          {/* Row: Achievements & Game Stats */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ProfileAchievements />
            <ProfileStats />
          </div>

          {/* Row: Activity Feed & Collections */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ProfileActivity />
            <ProfileCollections />
          </div>

        </div>

      </div>
    </div>
  );
}
