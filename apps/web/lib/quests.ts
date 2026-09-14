export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  xpReward: number;
  starReward: number;
  icon: string;
  isClaimed: boolean;
}

export interface BattlePassTier {
  tier: number;
  requiredStars: number;
  rewardTitle: string;
  rewardType: 'xp' | 'badge' | 'avatar_border' | 'sound_theme';
  rewardValue: string;
  isFree: boolean;
}

export const SEASON_1_PASS: BattlePassTier[] = [
  { tier: 1, requiredStars: 2, rewardTitle: 'Novice Cadet Title', rewardType: 'badge', rewardValue: 'Novice Cadet', isFree: true },
  { tier: 2, requiredStars: 5, rewardTitle: '+200 XP Bonus', rewardType: 'xp', rewardValue: '200', isFree: true },
  { tier: 3, requiredStars: 10, rewardTitle: 'Neon Cyber Avatar Border', rewardType: 'avatar_border', rewardValue: 'border-cyan-500 shadow-cyan-500/50', isFree: true },
  { tier: 5, requiredStars: 20, rewardTitle: 'Glitch Matrix Profile Aura', rewardType: 'avatar_border', rewardValue: 'border-purple-500 shadow-purple-500/50', isFree: true },
  { tier: 8, requiredStars: 35, rewardTitle: '+500 XP Bonus', rewardType: 'xp', rewardValue: '500', isFree: true },
  { tier: 10, requiredStars: 50, rewardTitle: 'Esports Champion Title', rewardType: 'badge', rewardValue: 'Esports Champion', isFree: true },
  { tier: 15, requiredStars: 80, rewardTitle: 'Gold Foil Holographic Border', rewardType: 'avatar_border', rewardValue: 'border-amber-400 shadow-amber-400/50', isFree: true },
  { tier: 20, requiredStars: 120, rewardTitle: 'Apex Cyber Crown (+1,000 XP)', rewardType: 'xp', rewardValue: '1000', isFree: true },
];

/**
 * Returns today's 3 deterministic daily bounties based on UTC date
 */
export function getDailyQuests(date = new Date()): DailyQuest[] {
  const dayString = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;

  return [
    {
      id: `quest-score-${dayString}`,
      title: 'High Score Hunter',
      description: 'Score 1,000+ points in any arcade game',
      target: 1000,
      progress: 0,
      xpReward: 100,
      starReward: 2,
      icon: '🎯',
      isClaimed: false,
    },
    {
      id: `quest-play-${dayString}`,
      title: 'Arcade Explorer',
      description: 'Play 3 different games in the catalog',
      target: 3,
      progress: 0,
      xpReward: 75,
      starReward: 2,
      icon: '🕹️',
      isClaimed: false,
    },
    {
      id: `quest-streak-${dayString}`,
      title: 'Daily Streak Keeper',
      description: 'Log in and maintain your daily gaming streak',
      target: 1,
      progress: 1,
      xpReward: 50,
      starReward: 1,
      icon: '🔥',
      isClaimed: false,
    },
  ];
}
