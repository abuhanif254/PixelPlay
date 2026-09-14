export interface TournamentGame {
  id: string;
  slug: string;
  title: string;
  category: string;
  icon: string;
  accentColor: string;
  badge: string;
  targetGoal: string;
}

export const TOURNAMENT_GAMES: TournamentGame[] = [
  {
    id: 'neon-snake',
    slug: 'neon-snake',
    title: 'Neon Snake',
    category: 'Arcade',
    icon: '🐍',
    accentColor: 'from-emerald-500 to-green-600',
    badge: 'Precision Reflex Cup',
    targetGoal: 'Reach 2,500+ PTS without crashing',
  },
  {
    id: '2048-classic',
    slug: '2048-classic',
    title: '2048 Classic',
    category: 'Puzzle',
    icon: '🔢',
    accentColor: 'from-amber-500 to-orange-600',
    badge: 'Neural Logic Championship',
    targetGoal: 'Merge to 2048 tile in record moves',
  },
  {
    id: 'neon-flyer',
    slug: 'neon-flyer',
    title: 'Neon Flyer',
    category: 'Arcade',
    icon: '🚀',
    accentColor: 'from-cyan-500 to-blue-600',
    badge: 'Cyber Flap Masters',
    targetGoal: 'Survive 40+ gravity obstacles',
  },
  {
    id: 'pull-the-pin',
    slug: 'pull-the-pin',
    title: 'Pull the Pin 3D',
    category: 'Puzzle',
    icon: '📌',
    accentColor: 'from-purple-500 to-indigo-600',
    badge: 'Gravity Physics Cup',
    targetGoal: 'Clear 15 puzzle chambers flawlessly',
  },
  {
    id: 'blade-merge-master',
    slug: 'blade-merge-master',
    title: 'Blade Merge Master',
    category: 'Action',
    icon: '⚔️',
    accentColor: 'from-rose-500 to-red-600',
    badge: 'Weapon Master Grand Prix',
    targetGoal: 'Synthesize Tier 10 Legendary Blade',
  },
  {
    id: 'color-sort-master',
    slug: 'color-sort-master',
    title: 'Color Sort Master',
    category: 'Puzzle',
    icon: '🧪',
    accentColor: 'from-teal-500 to-emerald-600',
    badge: 'Chemical Logic Derby',
    targetGoal: 'Solve 10 test tube racks with zero undos',
  },
  {
    id: 'block-stack-rush',
    slug: 'block-stack-rush',
    title: 'Block Stack Rush',
    category: 'Arcade',
    icon: '🧱',
    accentColor: 'from-fuchsia-500 to-pink-600',
    badge: 'Skyward Architect Cup',
    targetGoal: 'Build 50 perfectly aligned storeys',
  },
];

export const CUP_REWARDS = {
  GOLD: { rank: '1st Place', xp: 500, label: '🥇 Gold Champion', title: 'Cup Champion' },
  SILVER: { rank: '2nd Place', xp: 300, label: '🥈 Silver Master', title: 'Cup Contender' },
  BRONZE: { rank: '3rd Place', xp: 150, label: '🥉 Bronze Elite', title: 'Cup Finalist' },
  PARTICIPANT: { rank: 'Participant', xp: 50, label: '🎮 Match Finish', title: 'Cup Challenger' },
};

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

  return {
    game,
    nextResetUtcMs,
    editionCode,
    dayIndex: gameIndex,
    rewards: CUP_REWARDS,
  };
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
