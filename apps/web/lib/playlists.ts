export interface PlaylistItem {
  slug: string;
  title: string;
  category: string;
  image: string;
  durationMinutes: number;
  difficulty: 'Casual' | 'Medium' | 'Hardcore';
  description: string;
}

export interface Playlist {
  id: string;
  slug: string;
  title: string;
  curator: string;
  tagline: string;
  description: string;
  coverGradient: string;
  badgeEmoji: string;
  estimatedTotalMinutes: number;
  featured: boolean;
  games: PlaylistItem[];
}

export const CURATED_PLAYLISTS: Playlist[] = [
  {
    id: 'coffee-break',
    slug: 'coffee-break',
    title: '5-Minute Coffee Break',
    curator: 'Spielcade Editors',
    tagline: 'Instant micro-sessions for quick dopamine hits',
    description: 'The ultimate collection of zero-setup, instant-action games designed to be played in rapid 3-to-5 minute intervals.',
    coverGradient: 'from-amber-600 via-orange-600 to-amber-900',
    badgeEmoji: '☕',
    estimatedTotalMinutes: 15,
    featured: true,
    games: [
      {
        slug: 'snake',
        title: 'Neon Snake',
        category: 'Arcade',
        image: '/images/games/snake.svg',
        durationMinutes: 4,
        difficulty: 'Casual',
        description: 'Glide through the neon grid and collect energy orbs.',
      },
      {
        slug: 'flappy-bird',
        title: 'Neon Flyer',
        category: 'Arcade',
        image: '/images/games/flappy-bird.svg',
        durationMinutes: 3,
        difficulty: 'Medium',
        description: 'Single-tap obstacle dodging with rhythmic gravity physics.',
      },
      {
        slug: 'catchy-ball',
        title: 'Catchy Ball Arcade',
        category: 'Arcade',
        image: '/icons/icon-192x192.png',
        durationMinutes: 5,
        difficulty: 'Casual',
        description: 'High-speed deflection and orbital paddle action.',
      },
      {
        slug: '2048',
        title: '2048 Classic',
        category: 'Puzzle',
        image: '/images/games/2048.svg',
        durationMinutes: 6,
        difficulty: 'Casual',
        description: 'Swipe and combine tiles in a cozy mathematical puzzle.',
      },
    ],
  },
  {
    id: 'hardcore-reflexes',
    slug: 'hardcore-reflexes',
    title: 'Apex Reflex Gauntlet',
    curator: 'Arcade Pro Team',
    tagline: 'High-APM reflex test for competitive speedrunners',
    description: 'Push your reaction speeds to the absolute limit. One mistake means instant game over. Are your fingers fast enough?',
    coverGradient: 'from-rose-600 via-purple-700 to-slate-900',
    badgeEmoji: '⚡',
    estimatedTotalMinutes: 20,
    featured: true,
    games: [
      {
        slug: 'flappy-bird',
        title: 'Neon Flyer',
        category: 'Arcade',
        image: '/images/games/flappy-bird.svg',
        durationMinutes: 4,
        difficulty: 'Hardcore',
        description: 'Narrow pipe gaps that demand frame-perfect taps.',
      },
      {
        slug: 'snake',
        title: 'Neon Snake',
        category: 'Arcade',
        image: '/images/games/snake.svg',
        durationMinutes: 6,
        difficulty: 'Hardcore',
        description: 'High-speed serpent maneuvering in tight grid spaces.',
      },
      {
        slug: 'blade-merge',
        title: 'Blade Merge Master',
        category: 'Action',
        image: '/icons/icon-192x192.png',
        durationMinutes: 10,
        difficulty: 'Medium',
        description: 'Rapid weapon synthesis and enemy wave defense.',
      },
    ],
  },
  {
    id: 'zen-mind',
    slug: 'zen-mind',
    title: 'Zen Mind & Chill Logic',
    curator: 'Mindfulness Arcade',
    tagline: 'Relaxing spatial puzzles with zero timers and ambient bliss',
    description: 'Unwind your mind with thoughtfully crafted logic and physics puzzles. No rush, no stress—just pure spatial satisfaction.',
    coverGradient: 'from-teal-600 via-cyan-700 to-slate-900',
    badgeEmoji: '🧘',
    estimatedTotalMinutes: 25,
    featured: false,
    games: [
      {
        slug: '2048',
        title: '2048 Classic',
        category: 'Puzzle',
        image: '/images/games/2048.svg',
        durationMinutes: 10,
        difficulty: 'Casual',
        description: 'Calm slide-to-merge numbers at your own pace.',
      },
      {
        slug: 'pull-the-pin-3d-help-police',
        title: 'Pull the Pin 3D',
        category: 'Puzzle',
        image: '/icons/icon-192x192.png',
        durationMinutes: 15,
        difficulty: 'Casual',
        description: 'Clever gravity mechanics and bomb avoidance puzzles.',
      },
    ],
  },
  {
    id: 'retro-pixel-tributes',
    slug: 'retro-pixel-tributes',
    title: '80s & 90s Pixel Nostalgia',
    curator: 'Retro Vault',
    tagline: 'Vintage arcade tributes crafted with modern cyber flair',
    description: 'Relive the golden era of coin-op cabinets, CRT glow, and synthesized sound chips.',
    coverGradient: 'from-fuchsia-600 via-indigo-700 to-slate-900',
    badgeEmoji: '🕹️',
    estimatedTotalMinutes: 18,
    featured: false,
    games: [
      {
        slug: 'snake',
        title: 'Neon Snake',
        category: 'Arcade',
        image: '/images/games/snake.svg',
        durationMinutes: 5,
        difficulty: 'Casual',
        description: 'Nokia 3310 era legend reimagined in glowing Tron aesthetics.',
      },
      {
        slug: 'flappy-bird',
        title: 'Neon Flyer',
        category: 'Arcade',
        image: '/images/games/flappy-bird.svg',
        durationMinutes: 4,
        difficulty: 'Medium',
        description: 'Classic arcade flyer physics with cyberpunk synth styling.',
      },
      {
        slug: 'catchy-ball',
        title: 'Catchy Ball Arcade',
        category: 'Arcade',
        image: '/icons/icon-192x192.png',
        durationMinutes: 6,
        difficulty: 'Casual',
        description: 'Pong-inspired arcade deflection action.',
      },
    ],
  },
];

export function getAllPlaylists(): Playlist[] {
  return CURATED_PLAYLISTS;
}

export function getPlaylistBySlug(slug: string): Playlist | undefined {
  return CURATED_PLAYLISTS.find((p) => p.slug === slug);
}

/**
 * Returns the next game in the playlist queue given the current game slug
 */
export function getNextPlaylistGame(playlistSlug: string, currentGameSlug: string): PlaylistItem | null {
  const playlist = getPlaylistBySlug(playlistSlug);
  if (!playlist || playlist.games.length === 0) return null;

  const currentIndex = playlist.games.findIndex((g) => g.slug === currentGameSlug);
  if (currentIndex === -1 || currentIndex === playlist.games.length - 1) {
    // Loop back to first game or return null
    return playlist.games[0];
  }

  return playlist.games[currentIndex + 1];
}
