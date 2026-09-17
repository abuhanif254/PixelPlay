export type MobileBadgeType = 'refresh' | 'video' | 'star' | 'flame' | 'none';

export interface MobileGameItem {
  id?: string;
  slug: string;
  title: string;
  category?: string;
  rating?: number;
  image?: string;
  image_url?: string;
  total_plays?: number;
  description?: string;
}

export interface VibeItemConfig {
  id: string;
  title: string;
  category: string;
  href: string;
  bgGradient: string;
  borderClass: string;
  textColor: string;
  iconName: 'brain' | 'adrenaline' | 'friends' | 'arcade' | 'shooter' | 'quick';
}

export const VIBE_ITEMS: VibeItemConfig[] = [
  {
    id: 'brain',
    title: 'Train your brain',
    category: 'Puzzle',
    href: '/categories/puzzle-games',
    bgGradient: 'from-[#0B1536] via-[#101F4E] to-[#162B6D]',
    borderClass: 'border-cyan-500/20 hover:border-cyan-400/50',
    textColor: 'text-cyan-300',
    iconName: 'brain',
  },
  {
    id: 'adrenaline',
    title: 'Adrenaline rush',
    category: 'Racing',
    href: '/categories/racing-games',
    bgGradient: 'from-[#2A0826] via-[#3B0E35] to-[#54124C]',
    borderClass: 'border-pink-500/20 hover:border-pink-400/50',
    textColor: 'text-pink-300',
    iconName: 'adrenaline',
  },
  {
    id: 'friends',
    title: 'With friends',
    category: '2-Player',
    href: '/categories/2-player-games',
    bgGradient: 'from-[#06241D] via-[#09352A] to-[#0E4F3E]',
    borderClass: 'border-emerald-500/20 hover:border-emerald-400/50',
    textColor: 'text-emerald-300',
    iconName: 'friends',
  },
  {
    id: 'arcade',
    title: 'Arcade frenzy',
    category: 'Arcade',
    href: '/categories/arcade-games',
    bgGradient: 'from-[#220B38] via-[#321252] to-[#481878]',
    borderClass: 'border-purple-500/20 hover:border-purple-400/50',
    textColor: 'text-purple-300',
    iconName: 'arcade',
  },
  {
    id: 'shooter',
    title: 'Target sniper',
    category: 'Shooting',
    href: '/categories/shooting-games',
    bgGradient: 'from-[#330C0C] via-[#4A1212] to-[#691818]',
    borderClass: 'border-rose-500/20 hover:border-rose-400/50',
    textColor: 'text-rose-300',
    iconName: 'shooter',
  },
  {
    id: 'quick',
    title: 'Instant play',
    category: 'Originals',
    href: '/games',
    bgGradient: 'from-[#1E1B4B] via-[#2E1065] to-[#3B0764]',
    borderClass: 'border-indigo-500/20 hover:border-indigo-400/50',
    textColor: 'text-indigo-300',
    iconName: 'quick',
  },
];

export interface MobileCrazyFeedProps {
  trending: MobileGameItem[];
  newGames: MobileGameItem[];
  topRated: MobileGameItem[];
  totalGamesCount: number;
  blogPosts?: any[];
}
