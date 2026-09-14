/**
 * Personalized Client-Side AI Affinity Engine for Spielcade
 * Computes individual player taste vectors and recommends games with match scores.
 */

export interface ScoredGame {
  id: string;
  slug: string;
  title: string;
  category: string;
  image_url: string;
  rating?: number;
  total_plays?: number;
  matchScore: number;
  matchPercent: number;
  affinityReason: string;
  badge?: string;
}

export function computeCategoryAffinities(): Record<string, number> {
  if (typeof window === 'undefined') return {};

  const affinities: Record<string, number> = {};

  try {
    // 1. Scan Recent Games History
    const rawRecent = localStorage.getItem('spielcade_recent_games');
    if (rawRecent) {
      const recentList: any[] = JSON.parse(rawRecent);
      recentList.forEach((item, idx) => {
        const cat = item.category || 'Arcade';
        // Recency decay: games played more recently have higher weighting
        const recencyWeight = Math.max(5, 25 - idx * 2);
        affinities[cat] = (affinities[cat] || 0) + recencyWeight;
      });
    }

    // 2. Scan Favorites (Strongest intent signal)
    const rawFavs = localStorage.getItem('spielcade_favorites');
    if (rawFavs) {
      const favs: string[] = JSON.parse(rawFavs);
      favs.forEach(() => {
        // Boost general action/arcade or specific known categories
        affinities['Action'] = (affinities['Action'] || 0) + 15;
      });
    }

    // 3. Scan Offline Checkpoints
    const rawCheckpoints = localStorage.getItem('spielcade_offline_sync_queue');
    if (rawCheckpoints) {
      const q: any[] = JSON.parse(rawCheckpoints);
      q.forEach(() => {
        affinities['Arcade'] = (affinities['Arcade'] || 0) + 10;
      });
    }
  } catch (err) {
    console.error('Error computing affinities:', err);
  }

  // Ensure default base baseline if user is new
  if (Object.keys(affinities).length === 0) {
    affinities['Action'] = 30;
    affinities['Arcade'] = 25;
    affinities['Puzzle'] = 20;
    affinities['Racing'] = 15;
  }

  return affinities;
}

export function scoreGamesWithAffinity(games: any[]): ScoredGame[] {
  const affinities = computeCategoryAffinities();
  const maxAffinity = Math.max(...Object.values(affinities), 1);

  return games.map((game) => {
    const cat = game.category || 'Arcade';
    const catAffinity = affinities[cat] || 5;

    // Base match percentage (65% - 99%)
    const affinityRatio = catAffinity / maxAffinity;
    const ratingBonus = ((Number(game.rating) || 4.5) - 4.0) * 10; // up to +10%
    const playsBonus = Math.min(10, Math.log10(Number(game.total_plays) || 1000) * 2);

    const calculatedMatch = Math.min(99, Math.round(70 + affinityRatio * 20 + ratingBonus * 0.5 + playsBonus * 0.4));

    let reason = `Top pick in ${cat} Games`;
    let badge = `🔥 ${calculatedMatch}% Match`;

    if (calculatedMatch >= 95) {
      reason = `Perfect match for your ${cat} play style`;
      badge = `⚡ ${calculatedMatch}% Match`;
    } else if ((game.total_plays || 0) < 60000 && (game.rating || 0) >= 4.8) {
      reason = 'Hidden Gem loved by high-skill players';
      badge = '💎 Hidden Gem';
    } else if (cat.toLowerCase().includes('puzzle') || cat.toLowerCase().includes('logic')) {
      reason = 'Brain teaser recommended for quick focus';
      badge = '🧠 Brain Boost';
    }

    return {
      ...game,
      matchScore: catAffinity,
      matchPercent: calculatedMatch,
      affinityReason: reason,
      badge,
    };
  }).sort((a, b) => b.matchPercent - a.matchPercent);
}
