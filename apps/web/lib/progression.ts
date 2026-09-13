// Spielcade Global Gamification & RPG Leveling Engine

export interface LevelInfo {
  level: number;
  totalXp: number;
  currentLevelBaseXp: number;
  nextLevelXp: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
  rankTitle: string;
  rankTier: 'novice' | 'challenger' | 'master' | 'champion' | 'legend';
  rankBadge: string;
  badgeColor: string;
  gradient: string;
}

export const XP_REWARDS = {
  GAME_PLAY: 25,
  PERSONAL_BEST: 75,
  CHALLENGE_BEATEN: 150,
  STREAK_BASE: 50,
  REVIEW_SUBMITTED: 100,
} as const;

/**
 * Calculates total cumulative XP needed to reach a given level.
 * Level 1 = 0 XP
 * Level 2 = 100 XP
 * Level 3 = 270 XP
 * Level 4 = 480 XP
 * Level 5 = 725 XP
 * Level 10 = 2,360 XP
 * Level 20 = 6,400 XP
 * Level 50 = 26,000 XP
 */
export function getCumulativeXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level - 1, 1.42));
}

/**
 * Converts total accumulated XP into full player level metadata, rank, and progress percent.
 */
export function getLevelInfo(totalXp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(totalXp || 0));

  let level = 1;
  while (getCumulativeXpForLevel(level + 1) <= safeXp && level < 100) {
    level++;
  }

  const currentLevelBaseXp = getCumulativeXpForLevel(level);
  const nextLevelXp = getCumulativeXpForLevel(level + 1);
  const xpNeededForNextLevel = nextLevelXp - currentLevelBaseXp;
  const xpInCurrentLevel = safeXp - currentLevelBaseXp;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((xpInCurrentLevel / Math.max(1, xpNeededForNextLevel)) * 100))
  );

  let rankTitle = 'Novice Gamer';
  let rankTier: LevelInfo['rankTier'] = 'novice';
  let rankBadge = '🥉';
  let badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  let gradient = 'from-emerald-500 to-teal-600';

  if (level >= 35) {
    rankTitle = 'Mythic Legend';
    rankTier = 'legend';
    rankBadge = '👑';
    badgeColor = 'text-rose-400 bg-rose-500/15 border-rose-500/30';
    gradient = 'from-rose-500 via-pink-600 to-purple-600';
  } else if (level >= 20) {
    rankTitle = 'Diamond Champion';
    rankTier = 'champion';
    rankBadge = '💎';
    badgeColor = 'text-purple-400 bg-purple-500/15 border-purple-500/30';
    gradient = 'from-purple-500 via-indigo-600 to-blue-600';
  } else if (level >= 10) {
    rankTitle = 'Gold Master';
    rankTier = 'master';
    rankBadge = '🥇';
    badgeColor = 'text-amber-400 bg-amber-500/15 border-amber-500/30';
    gradient = 'from-amber-400 via-yellow-500 to-orange-500';
  } else if (level >= 5) {
    rankTitle = 'Silver Challenger';
    rankTier = 'challenger';
    rankBadge = '🥈';
    badgeColor = 'text-sky-400 bg-sky-500/15 border-sky-500/30';
    gradient = 'from-sky-400 to-blue-600';
  }

  return {
    level,
    totalXp: safeXp,
    currentLevelBaseXp,
    nextLevelXp,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progressPercent,
    rankTitle,
    rankTier,
    rankBadge,
    badgeColor,
    gradient,
  };
}
