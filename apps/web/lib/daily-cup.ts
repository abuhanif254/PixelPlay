export interface TournamentGame {
  id: string;
  slug: string;
  title: string;
  category: string;
  icon: string;
  accentColor: string;
  badge: string;
  targetGoal: string;
  coverImage?: string;
}

export const TOURNAMENT_GAMES: TournamentGame[] = [
  {
    id: 'snake',
    slug: 'snake',
    title: 'Neon Snake',
    category: 'Arcade',
    icon: '🐍',
    accentColor: 'from-emerald-500 to-green-600',
    badge: 'Precision Reflex Cup',
    targetGoal: 'Reach 2,500+ PTS without crashing',
    coverImage: '/images/games/snake.svg',
  },
  {
    id: '2048',
    slug: '2048',
    title: '2048 Classic',
    category: 'Puzzle',
    icon: '🔢',
    accentColor: 'from-amber-500 to-orange-600',
    badge: 'Neural Logic Championship',
    targetGoal: 'Merge to 2048 tile in record moves',
    coverImage: '/images/games/2048.svg',
  },
  {
    id: 'flappy-bird',
    slug: 'flappy-bird',
    title: 'Neon Flyer',
    category: 'Arcade',
    icon: '🚀',
    accentColor: 'from-cyan-500 to-blue-600',
    badge: 'Cyber Flap Masters',
    targetGoal: 'Survive 40+ gravity obstacles',
    coverImage: '/images/games/flappy-bird.svg',
  },
  {
    id: 'pull-the-pin-3d-help-police',
    slug: 'pull-the-pin-3d-help-police',
    title: 'Pull the Pin 3D',
    category: 'Puzzle',
    icon: '📌',
    accentColor: 'from-purple-500 to-indigo-600',
    badge: 'Gravity Physics Cup',
    targetGoal: 'Clear 15 puzzle chambers flawlessly',
    coverImage: '/icons/icon-192x192.png',
  },
  {
    id: 'blade-merge',
    slug: 'blade-merge',
    title: 'Blade Merge Master',
    category: 'Action',
    icon: '⚔️',
    accentColor: 'from-rose-500 to-red-600',
    badge: 'Weapon Master Grand Prix',
    targetGoal: 'Synthesize Tier 10 Legendary Blade',
    coverImage: '/icons/icon-192x192.png',
  },
  {
    id: 'catchy-ball',
    slug: 'catchy-ball',
    title: 'Catchy Ball Arcade',
    category: 'Arcade',
    icon: '⚽',
    accentColor: 'from-teal-500 to-emerald-600',
    badge: 'Orbital Deflection Derby',
    targetGoal: 'Score 120 consecutive ball catches',
    coverImage: '/icons/icon-192x192.png',
  },
];

export const CUP_REWARDS = {
  GOLD: { rank: '1st Place', xp: 500, stars: 25, label: '🥇 Gold Champion', title: 'Cup Champion', frame: 'border-amber-400 shadow-amber-500/50' },
  SILVER: { rank: '2nd Place', xp: 300, stars: 15, label: '🥈 Silver Master', title: 'Cup Contender', frame: 'border-slate-300 shadow-slate-400/50' },
  BRONZE: { rank: '3rd Place', xp: 150, stars: 10, label: '🥉 Bronze Elite', title: 'Cup Finalist', frame: 'border-amber-600 shadow-amber-700/50' },
  TOP10: { rank: 'Top 10', xp: 100, stars: 5, label: '🎖️ Top 10 Star', title: 'Grand Finalist', frame: 'border-indigo-400 shadow-indigo-500/30' },
  PARTICIPANT: { rank: 'Participant', xp: 50, stars: 2, label: '🎮 Match Finish', title: 'Cup Challenger', frame: 'border-white/10' },
};

export interface TournamentStanding {
  rank: number;
  username: string;
  score: number;
  country: string;
  avatar: string;
  isVerified: boolean;
  timeAgo: string;
}

export interface BlitzCup {
  id: string;
  title: string;
  type: 'weekend' | 'monthly' | 'special';
  gameSlug: string;
  gameTitle: string;
  prizePool: string;
  startDate: string;
  endDate: string;
  icon: string;
  color: string;
}

export const UPCOMING_BLITZ_CUPS: BlitzCup[] = [
  {
    id: 'weekend-speedrun',
    title: 'Weekend 2048 Speedrun Sprint',
    type: 'weekend',
    gameSlug: '2048',
    gameTitle: '2048 Classic',
    prizePool: '2,500 XP + Holographic Badge',
    startDate: 'Saturday, 00:00 UTC',
    endDate: 'Sunday, 23:59 UTC',
    icon: '⚡',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
  },
  {
    id: 'neon-snake-survival',
    title: 'Snake Ultra Marathon Cup',
    type: 'weekend',
    gameSlug: 'snake',
    gameTitle: 'Neon Snake',
    prizePool: '3,000 XP + Crown Avatar Border',
    startDate: 'Next Friday, 18:00 UTC',
    endDate: 'Next Sunday, 23:59 UTC',
    icon: '🐍',
    color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-400',
  },
  {
    id: 'flappy-sky-duel',
    title: 'Gravity Flap Apex Masters',
    type: 'special',
    gameSlug: 'flappy-bird',
    gameTitle: 'Neon Flyer',
    prizePool: '5,000 XP + Grandmaster Title',
    startDate: 'End of Month',
    endDate: 'Month Final',
    icon: '🚀',
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
  },
];

/**
 * Returns today's active Daily Arcade Cup tournament game and timing info
 */
export function getDailyTournament(date = new Date()) {
  const utcYear = date.getUTCFullYear();
  const utcMonth = date.getUTCMonth();
  const utcDate = date.getUTCDate();

  // Deterministic daily index based on UTC epoch days
  const todayUtcMs = Date.UTC(utcYear, utcMonth, utcDate);
  const daysSinceEpoch = Math.floor(todayUtcMs / 86400000);
  const gameIndex = Math.abs(daysSinceEpoch) % TOURNAMENT_GAMES.length;
  const game = TOURNAMENT_GAMES[gameIndex];

  // Midnight UTC timestamp for reset
  const nextResetUtcMs = Date.UTC(utcYear, utcMonth, utcDate + 1, 0, 0, 0);

  // Tournament edition code (e.g. "DAC-2026-09-14")
  const editionCode = `DAC-${utcYear}-${String(utcMonth + 1).padStart(2, '0')}-${String(utcDate).padStart(2, '0')}`;

  // Deterministic standings generator based on day seed
  const standings = generateDeterministicStandings(daysSinceEpoch, game.slug);

  return {
    game,
    nextResetUtcMs,
    editionCode,
    dayIndex: gameIndex,
    rewards: CUP_REWARDS,
    standings,
    totalEntrants: 1420 + (daysSinceEpoch % 350),
    prizePoolXp: 5000,
  };
}

/**
 * Generates deterministic realistic player standings for the tournament
 */
function generateDeterministicStandings(daySeed: number, gameSlug: string): TournamentStanding[] {
  const baseScores: Record<string, number> = {
    snake: 4250,
    '2048': 32400,
    'flappy-bird': 184,
    'pull-the-pin-3d-help-police': 5200,
    'blade-merge': 14800,
    'catchy-ball': 340,
  };

  const high = baseScores[gameSlug] || 5000;

  const samplePlayers = [
    { name: 'VortexPilot', country: '🇺🇸', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' },
    { name: 'NeonKitten', country: '🇯🇵', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    { name: 'CyberShadow', country: '🇩🇪', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop' },
    { name: 'PixelSamurai', country: '🇰🇷', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop' },
    { name: 'ArcadeGod_99', country: '🇨🇦', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
    { name: 'QuantumRacer', country: '🇬🇧', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop' },
    { name: 'GlitchMaster', country: '🇧🇷', avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=100&h=100&fit=crop' },
    { name: 'ZeroCool', country: '🇫🇷', avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop' },
    { name: 'HyperNova', country: '🇸🇬', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
    { name: 'RetroGhost', country: '🇦🇺', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop' },
  ];

  return samplePlayers.map((player, idx) => {
    const scoreFactor = 1 - (idx * 0.065);
    const score = Math.round(high * scoreFactor - ((daySeed * (idx + 1)) % 37));
    return {
      rank: idx + 1,
      username: player.name,
      country: player.country,
      avatar: player.avatar,
      score,
      isVerified: true,
      timeAgo: `${(idx * 8) + 4}m ago`,
    };
  });
}

/**
 * Calculates remaining time until midnight UTC in formatted hours, minutes, seconds
 */
export function getRemainingTournamentTime(nextResetUtcMs: number): {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  isExpired: boolean;
} {
  const now = Date.now();
  const diff = Math.max(0, nextResetUtcMs - now);

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, formatted: '00h 00m 00s', isExpired: true };
  }

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  return {
    hours,
    minutes,
    seconds,
    formatted: `${hh}h ${mm}m ${ss}s`,
    isExpired: false,
  };
}
