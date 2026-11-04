/**
 * Google AdSense & Publisher Policy Compliance Guard
 * Protects platform against copyright strikes, trademark infringements, and broken iframe inventory.
 * Official Reference: https://support.google.com/adsense/answer/10502938
 */

export const FORBIDDEN_TRADEMARK_PATTERNS: readonly string[] = [
  'mario',
  'pokemon',
  'minecraft',
  'grand theft auto',
  'subway surfer',
  'spider-man',
  'spiderman',
  'batman',
  'roblox',
  'among us',
  'among-us',
  'fortnite',
  'brawl stars',
  'clash royale',
  'clash of clans',
  'pubg',
  'call of duty',
  'super mario',
  'geometry dash',
  'five nights at freddy',
  'fnaf',
  'poppy playtime',
  'skibidi',
  'squid game',
  'angry birds',
];

export const BUILT_IN_GAME_SLUGS: readonly string[] = [
  'snake',
  '2048',
  'chess',
  'minesweeper',
  'solitaire',
  'sudoku',
  'tic-tac-toe',
  'flappy-bird',
];

/**
 * Validates whether a game satisfies Google AdSense Programme Policies:
 * 1. Must not infringe on third-party intellectual property / trademarks.
 * 2. Must not have broken / empty source URLs (no content / under construction policy).
 */
export function isPolicyCompliantGame(game: {
  title?: string | null;
  slug?: string | null;
  source_url?: string | null;
} | null | undefined): boolean {
  if (!game) return false;

  const titleLower = (game.title || '').toLowerCase();
  const slugLower = (game.slug || '').toLowerCase();

  // 1. Intellectual Property check: prevent trademarked character & commercial game titles
  for (const pattern of FORBIDDEN_TRADEMARK_PATTERNS) {
    if (titleLower.includes(pattern) || slugLower.includes(pattern)) {
      return false;
    }
  }

  // 2. Exact GTA & Sonic checks
  if (/\bgta\b/i.test(titleLower) || /\bgta\b/i.test(slugLower)) {
    return false;
  }
  if (/\bsonic\b/i.test(titleLower) || /\bsonic\b/i.test(slugLower)) {
    return false;
  }

  // 3. Broken / Empty source_url check (only evaluated when source_url is included in the query)
  const isBuiltIn = BUILT_IN_GAME_SLUGS.includes(slugLower);
  if (!isBuiltIn && game.source_url !== undefined) {
    if (typeof game.source_url !== 'string' || game.source_url.trim() === '') {
      return false;
    }
  }

  return true;
}
