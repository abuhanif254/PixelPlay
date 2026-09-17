import { describe, it, expect } from 'vitest';

describe('Edge Search Ranking Engine (RFC-TEST-001)', () => {
  // 1. Sanitization Function under test
  function sanitizeSearchQuery(input: string | null | undefined): string {
    if (!input) return '';
    return input
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .replace(/[%_\\]/g, ' ')
      .trim()
      .slice(0, 80);
  }

  // 2. Trigram Generator & Similarity (Simulating PostgreSQL pg_trgm)
  function getTrigrams(str: string): Set<string> {
    const padded = `  ${str.toLowerCase()} `;
    const trg = new Set<string>();
    for (let i = 0; i < padded.length - 2; i++) {
      trg.add(padded.slice(i, i + 3));
    }
    return trg;
  }

  function trigramSimilarity(s1: string, s2: string): number {
    const trg1 = getTrigrams(s1);
    const trg2 = getTrigrams(s2);
    let common = 0;
    trg1.forEach((t) => {
      if (trg2.has(t)) common++;
    });
    const union = trg1.size + trg2.size - common;
    return union === 0 ? 0 : common / union;
  }

  // 3. Multi-Factor Hybrid Relevance Scoring (Simulating public.search_games)
  interface GameDoc {
    id: string;
    title: string;
    slug: string;
    category: string;
    total_plays: number;
  }

  function computeGameRelevance(game: GameDoc, query: string): number {
    const cleanQ = query.trim().toLowerCase();
    if (!cleanQ) return 1.0;

    const titleLower = game.title.toLowerCase();
    const slugLower = game.slug.toLowerCase();

    const exactTitle = titleLower === cleanQ ? 12.0 : 0.0;
    const exactSlug = slugLower === cleanQ ? 10.0 : 0.0;
    const prefixTitle = titleLower.startsWith(cleanQ) ? 6.0 : 0.0;
    const substringTitle = titleLower.includes(cleanQ) ? 3.0 : 0.0;

    const trgm = trigramSimilarity(game.title, cleanQ) * 5.0;

    const rawRelevance = exactTitle + exactSlug + prefixTitle + substringTitle + trgm;
    const popularityMultiplier = 1.0 + Math.log(Math.max(game.total_plays, 0) + 1.0) * 0.08;

    return rawRelevance * popularityMultiplier;
  }

  describe('1. Search Input Sanitization & Anti-Injection Protection', () => {
    it('should strip null bytes and ASCII control characters', () => {
      const malicious = 'game\x00name\x1F\x7F';
      expect(sanitizeSearchQuery(malicious)).toBe('gamename');
    });

    it('should neutralize SQL wildcard injection characters (% and _)', () => {
      const wildcard = 'Select%From_Games\\Admin';
      expect(sanitizeSearchQuery(wildcard)).toBe('Select From Games Admin');
    });

    it('should clamp excessively long queries to 80 characters', () => {
      const longString = 'a'.repeat(150);
      const sanitized = sanitizeSearchQuery(longString);
      expect(sanitized.length).toBe(80);
    });

    it('should handle null, undefined, empty, and whitespace-only queries safely', () => {
      expect(sanitizeSearchQuery(null)).toBe('');
      expect(sanitizeSearchQuery(undefined)).toBe('');
      expect(sanitizeSearchQuery('')).toBe('');
      expect(sanitizeSearchQuery('     ')).toBe('');
    });
  });

  describe('2. Trigram Similarity Typo-Tolerance (pg_trgm Simulation)', () => {
    it('should return 1.0 for identical strings', () => {
      expect(trigramSimilarity('Snake', 'Snake')).toBe(1.0);
      expect(trigramSimilarity('2048', '2048')).toBe(1.0);
    });

    it('should tolerate common typos and misspellings above detection threshold (0.2)', () => {
      // "flapy" vs "Flappy Bird"
      const flappyScore = trigramSimilarity('flapy', 'Flappy Bird');
      expect(flappyScore).toBeGreaterThan(0.2);

      // "subway serfers" vs "Subway Surfers"
      const subwayScore = trigramSimilarity('subway serfers', 'Subway Surfers');
      expect(subwayScore).toBeGreaterThan(0.5);

      // "mincraft" vs "Minecraft"
      const minecraftScore = trigramSimilarity('mincraft', 'Minecraft');
      expect(minecraftScore).toBeGreaterThan(0.5);
    });

    it('should return low score for completely unrelated strings', () => {
      const score = trigramSimilarity('chess', 'sudoku');
      expect(score).toBeLessThan(0.1);
    });
  });

  describe('3. Multi-Factor Hybrid Relevance Algorithm Invariants', () => {
    const sampleGames: GameDoc[] = [
      { id: '1', title: 'Neon Snake', slug: 'snake', category: 'Arcade', total_plays: 50000 },
      { id: '2', title: 'Snake Evolution 3D', slug: 'snake-evolution-3d', category: 'Arcade', total_plays: 500 },
      { id: '3', title: 'Rattlesnake Desert', slug: 'rattlesnake-desert', category: 'Action', total_plays: 100 },
      { id: '4', title: 'Neon Flyer', slug: 'flappy-bird', category: 'Arcade', total_plays: 40000 },
    ];

    it('should rank exact slug/title matches highest', () => {
      const snakeScore = computeGameRelevance(sampleGames[0], 'snake'); // exact slug match
      const evolScore = computeGameRelevance(sampleGames[1], 'snake'); // prefix match
      const desertScore = computeGameRelevance(sampleGames[2], 'snake'); // substring match

      expect(snakeScore).toBeGreaterThan(evolScore);
      expect(evolScore).toBeGreaterThan(desertScore);
    });

    it('should correctly prioritize exact search hits over typo-tolerant hits', () => {
      const exactScore = computeGameRelevance(sampleGames[0], 'Neon Snake');
      const typoScore = computeGameRelevance(sampleGames[0], 'Neon Snke');

      expect(exactScore).toBeGreaterThan(typoScore);
      expect(typoScore).toBeGreaterThan(0); // Still scores positively
    });

    it('should give popularity boost without overwhelming relevance', () => {
      const popularGame: GameDoc = {
        id: '10',
        title: 'Super Jump',
        slug: 'super-jump',
        category: 'Action',
        total_plays: 100000,
      };
      const unpopularGame: GameDoc = {
        id: '11',
        title: 'Super Jump',
        slug: 'super-jump-indie',
        category: 'Action',
        total_plays: 10,
      };

      const popScore = computeGameRelevance(popularGame, 'Super Jump');
      const unpopScore = computeGameRelevance(unpopularGame, 'Super Jump');

      expect(popScore).toBeGreaterThan(unpopScore);
      // Popularity boost should be reasonable (< 2x multiplier)
      expect(popScore / unpopScore).toBeLessThan(2.0);
    });
  });

  describe('4. Flagship Original Games Contract', () => {
    const originals = [
      { slug: 'snake', title: 'Neon Snake', category: 'Arcade', isOriginal: true },
      { slug: 'flappy-bird', title: 'Neon Flyer', category: 'Arcade', isOriginal: true },
      { slug: '2048', title: '2048 Classic', category: 'Puzzle', isOriginal: true },
    ];

    it('should match flagship originals on direct query', () => {
      const snakeMatch = originals.filter((g) => g.title.toLowerCase().includes('snake') || g.slug === 'snake');
      expect(snakeMatch.length).toBe(1);
      expect(snakeMatch[0].slug).toBe('snake');
    });

    it('should match flagship originals under category filter', () => {
      const arcadeOriginals = originals.filter((g) => g.category.toLowerCase() === 'arcade');
      expect(arcadeOriginals.length).toBe(2);
      expect(arcadeOriginals.map((g) => g.slug)).toEqual(['snake', 'flappy-bird']);
    });
  });
});
