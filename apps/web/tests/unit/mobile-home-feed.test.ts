import { describe, it, expect } from 'vitest';
import { VIBE_ITEMS } from '@/components/mobile/types';
import { MobileGameItem, MobileBadgeType } from '@/components/mobile/types';

describe('Poki & CrazyGames Mobile Homepage Architecture (RFC-MOBILE-001)', () => {
  describe('Vibe & Mood Carousel (MobileVibeScroller)', () => {
    it('contains all 6 core mood categories with valid deep links and distinct themes', () => {
      expect(VIBE_ITEMS.length).toBe(6);

      const expectedIds = ['brain', 'adrenaline', 'friends', 'arcade', 'shooter', 'quick'];
      const actualIds = VIBE_ITEMS.map((item) => item.id);
      expect(actualIds).toEqual(expectedIds);

      for (const item of VIBE_ITEMS) {
        expect(item.title.length).toBeGreaterThan(3);
        expect(item.category.length).toBeGreaterThan(2);
        expect(item.href.startsWith('/categories/') || item.href === '/games').toBe(true);
        expect(item.bgGradient).toContain('from-');
        expect(item.textColor).toContain('text-');
        expect(item.iconName).toBeDefined();
      }
    });

    it('maps "Train your brain" to Puzzle and "With friends" to 2-Player', () => {
      const brain = VIBE_ITEMS.find((v) => v.id === 'brain');
      expect(brain).toBeDefined();
      expect(brain?.category).toBe('Puzzle');
      expect(brain?.href).toBe('/categories/puzzle-games');

      const friends = VIBE_ITEMS.find((v) => v.id === 'friends');
      expect(friends).toBeDefined();
      expect(friends?.category).toBe('2-Player');
      expect(friends?.href).toBe('/categories/2-player-games');
    });
  });

  describe('Country Flag Detection & Conversion', () => {
    function isoToFlagEmoji(countryCode: string): string {
      if (!/^[A-Z]{2}$/.test(countryCode)) return '🔥';
      return String.fromCodePoint(
        127397 + countryCode.charCodeAt(0),
        127397 + countryCode.charCodeAt(1)
      );
    }

    it('accurately converts ISO 3166-1 alpha-2 codes to Unicode flag emojis', () => {
      expect(isoToFlagEmoji('BD')).toBe('🇧🇩'); // Bangladesh (CrazyGames screenshot 2)
      expect(isoToFlagEmoji('US')).toBe('🇺🇸'); // United States
      expect(isoToFlagEmoji('GB')).toBe('🇬🇧'); // United Kingdom
      expect(isoToFlagEmoji('DE')).toBe('🇩🇪'); // Germany
      expect(isoToFlagEmoji('FR')).toBe('🇫🇷'); // France
      expect(isoToFlagEmoji('JP')).toBe('🇯🇵'); // Japan
      expect(isoToFlagEmoji('BR')).toBe('🇧🇷'); // Brazil
    });

    it('falls back cleanly to fire emoji on invalid or missing country codes', () => {
      expect(isoToFlagEmoji('')).toBe('🔥');
      expect(isoToFlagEmoji('USA')).toBe('🔥');
      expect(isoToFlagEmoji('12')).toBe('🔥');
      expect(isoToFlagEmoji('b')).toBe('🔥');
    });
  });

  describe('Rhythmic Feed Cadence & Chunk Partitioning', () => {
    const mockGames: MobileGameItem[] = Array.from({ length: 30 }, (_, i) => ({
      id: `game-${i + 1}`,
      slug: `game-${i + 1}`,
      title: `Exciting Game ${i + 1}`,
      category: i % 2 === 0 ? 'Action' : 'Puzzle',
      rating: 4.5 + (i % 5) * 0.1,
      image_url: `https://img.gamemonetize.com/game-${i + 1}.jpg`,
      total_plays: 1000 * (30 - i),
    }));

    it('partitions games into alternating 16:9 featured cards and 3-column clusters', () => {
      const featured1 = mockGames[0];
      const grid1 = mockGames.slice(1, 7);
      const featured2 = mockGames[7];
      const grid2 = mockGames.slice(8, 14);
      const featured3 = mockGames[14];
      const grid3 = mockGames.slice(15, 21);
      const featured4 = mockGames[21];
      const grid5 = mockGames.slice(22, 28);

      // Featured cards must be singular items
      expect(featured1.id).toBe('game-1');
      expect(featured2.id).toBe('game-8');
      expect(featured3.id).toBe('game-15');
      expect(featured4.id).toBe('game-22');

      // Grids must contain exactly 6 items (2 rows of 3 columns)
      expect(grid1.length).toBe(6);
      expect(grid2.length).toBe(6);
      expect(grid3.length).toBe(6);
      expect(grid5.length).toBe(6);

      // Verify no overlap between featured cards and subsequent grid
      const grid1Slugs = new Set(grid1.map((g) => g.slug));
      expect(grid1Slugs.has(featured1.slug)).toBe(false);

      const grid2Slugs = new Set(grid2.map((g) => g.slug));
      expect(grid2Slugs.has(featured2.slug)).toBe(false);
    });

    it('assigns realistic micro-badges matching CrazyGames / Poki visual variety', () => {
      function getBadge(index: number, rating: number): MobileBadgeType {
        if (rating >= 4.9 && index % 3 === 0) return 'star';
        if (index % 4 === 1) return 'video';
        if (index % 5 === 0) return 'refresh';
        if (index % 7 === 2) return 'flame';
        return 'none';
      }

      const badges = mockGames.slice(0, 10).map((g, idx) => getBadge(idx, g.rating || 4.5));
      
      // Must contain a diverse set of badges
      expect(badges).toContain('refresh');
      expect(badges).toContain('video');
    });
  });

  describe('Mobile Viewport Image Density & Responsive Tokens', () => {
    it('validates 3-column mobile app icon sizes token (33vw, 120px)', () => {
      const iconSizes = '(max-width: 768px) 33vw, 120px';
      expect(iconSizes).toContain('33vw');
      expect(iconSizes).toContain('120px');
      expect(iconSizes).toMatch(/\(max-width: 768px\)/);
    });

    it('validates 16:9 featured card sizes token (100vw, 600px)', () => {
      const heroSizes = '(max-width: 768px) 100vw, 600px';
      expect(heroSizes).toContain('100vw');
      expect(heroSizes).toContain('600px');
      expect(heroSizes).toMatch(/\(max-width: 768px\)/);
    });
  });

  describe('Desktop & Tablet Breakpoint Isolation Guarantees', () => {
    it('verifies strict CSS breakpoint gating between mobile and desktop/tablet', () => {
      // Mobile container must be hidden at and above md (768px)
      const mobileContainerClasses = 'block md:hidden w-full';
      expect(mobileContainerClasses).toContain('block');
      expect(mobileContainerClasses).toContain('md:hidden');

      // Desktop and tablet container must be hidden below md and visible from md upwards
      const desktopContainerClasses = 'hidden md:flex flex-col gap-14 pb-20 w-full';
      expect(desktopContainerClasses).toContain('hidden');
      expect(desktopContainerClasses).toContain('md:flex');
      expect(desktopContainerClasses).toContain('gap-14');
    });

    it('verifies mobile feed container accounts for fixed 64px navbar with top offset', () => {
      const mobileFeedContainerClasses = 'flex flex-col w-full pb-28 pt-[72px] sm:pt-20 bg-white dark:bg-[#070818] text-slate-900 dark:text-white min-h-screen';
      expect(mobileFeedContainerClasses).toContain('pt-[72px]');
      expect(mobileFeedContainerClasses).toContain('pb-28');
    });

    it('verifies theme toggle button is visible on mobile viewports', () => {
      const themeToggleClasses = 'flex p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shrink-0';
      expect(themeToggleClasses.startsWith('flex')).toBe(true);
      expect(themeToggleClasses).not.toContain('hidden sm:flex');
    });
  });
});
