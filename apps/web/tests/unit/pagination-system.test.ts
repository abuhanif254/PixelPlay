import { describe, it, expect } from 'vitest';
import { getPaginationWindow } from '@/lib/pagination';
import fs from 'node:fs';
import path from 'node:path';

describe('Unified Enterprise Pagination & Zero-CLS Skeleton Subsystem (RFC-PAGIN-001)', () => {
  const componentsDir = path.resolve(__dirname, '../../components');
  const paginationPath = path.join(componentsDir, 'Pagination.tsx');
  const paginationSkeletonPath = path.join(componentsDir, 'PaginationSkeleton.tsx');

  describe('1. Sliding Window Algorithm (getPaginationWindow)', () => {
    it('handles single page catalogs gracefully', () => {
      expect(getPaginationWindow(1, 1)).toEqual([1]);
      expect(getPaginationWindow(1, 0)).toEqual([1]);
    });

    it('returns consecutive integers when totalPages <= 7', () => {
      expect(getPaginationWindow(1, 5)).toEqual([1, 2, 3, 4, 5]);
      expect(getPaginationWindow(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
      expect(getPaginationWindow(7, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('returns front-anchored window when currentPage <= 4 in large catalogs', () => {
      expect(getPaginationWindow(1, 50)).toEqual([1, 2, 3, 4, 5, '...', 50]);
      expect(getPaginationWindow(2, 50)).toEqual([1, 2, 3, 4, 5, '...', 50]);
      expect(getPaginationWindow(3, 50)).toEqual([1, 2, 3, 4, 5, '...', 50]);
      expect(getPaginationWindow(4, 50)).toEqual([1, 2, 3, 4, 5, '...', 50]);
    });

    it('returns end-anchored window when currentPage >= totalPages - 3 in large catalogs', () => {
      expect(getPaginationWindow(50, 50)).toEqual([1, '...', 46, 47, 48, 49, 50]);
      expect(getPaginationWindow(49, 50)).toEqual([1, '...', 46, 47, 48, 49, 50]);
      expect(getPaginationWindow(48, 50)).toEqual([1, '...', 46, 47, 48, 49, 50]);
      expect(getPaginationWindow(47, 50)).toEqual([1, '...', 46, 47, 48, 49, 50]);
    });

    it('returns middle window with dual ellipses when currentPage is in the middle', () => {
      expect(getPaginationWindow(10, 50)).toEqual([1, '...', 9, 10, 11, '...', 50]);
      expect(getPaginationWindow(25, 100)).toEqual([1, '...', 24, 25, 26, '...', 100]);
    });

    it('guarantees maximum window length is bounded to at most 7 items for zero layout overflow', () => {
      const testCases = [
        { cur: 1, total: 300 },
        { cur: 4, total: 300 },
        { cur: 150, total: 300 },
        { cur: 297, total: 300 },
        { cur: 300, total: 300 },
      ];

      for (const { cur, total } of testCases) {
        const window = getPaginationWindow(cur, total);
        expect(window.length).toBeLessThanOrEqual(7);
      }
    });
  });

  describe('2. Zero-CLS Skeleton Loader Contract (PaginationSkeleton.tsx)', () => {
    it('physically exists on disk', () => {
      expect(fs.existsSync(paginationSkeletonPath)).toBe(true);
    });

    it('preserves exact container height and margins to eliminate footer CLS', () => {
      const content = fs.readFileSync(paginationSkeletonPath, 'utf8');

      expect(content).toContain('mt-10 mb-6');
      expect(content).toContain('w-full');
      expect(content).toContain('animate-pulse');
      expect(content).toContain('role="status"');
      expect(content).toContain('aria-busy="true"');
      expect(content).toContain('aria-label="Loading page results"');
    });

    it('renders both responsive desktop and mobile skeleton placeholders', () => {
      const content = fs.readFileSync(paginationSkeletonPath, 'utf8');

      // Desktop layout tokens
      expect(content).toContain('hidden sm:flex');
      expect(content).toContain('w-9 h-9');

      // Mobile compact layout tokens
      expect(content).toContain('flex sm:hidden');
      expect(content).toContain('max-w-sm');
    });
  });

  describe('3. Unified Pagination Component Contract (Pagination.tsx)', () => {
    it('physically exists on disk', () => {
      expect(fs.existsSync(paginationPath)).toBe(true);
    });

    it('implements semantic nav, W3C accessibility, and Googlebot SEO link attributes', () => {
      const content = fs.readFileSync(paginationPath, 'utf8');

      expect(content).toContain('role="navigation"');
      expect(content).toContain('aria-label={ariaLabel}');
      expect(content).toContain("rel=\"prev\"");
      expect(content).toContain("rel=\"next\"");
      expect(content).toContain("aria-current={isCurrent ? 'page' : undefined}");
    });

    it('integrates PaginationSkeleton when isLoading is true', () => {
      const content = fs.readFileSync(paginationPath, 'utf8');

      expect(content).toContain('if (isLoading)');
      expect(content).toContain('<PaginationSkeleton');
    });

    it('supports responsive dual mode (Desktop sliding window + Mobile compact bar)', () => {
      const content = fs.readFileSync(paginationPath, 'utf8');

      // Desktop
      expect(content).toContain('hidden sm:flex');
      expect(content).toContain('w-9 h-9 rounded-lg text-sm font-bold');

      // Mobile
      expect(content).toContain('flex sm:hidden');
      expect(content).toContain('<span>Prev</span>');
      expect(content).toContain('<span>Next</span>');
      expect(content).toContain('Page');
      expect(content).toContain('of');
    });

    it('supports smooth scrolling to top on page change', () => {
      const content = fs.readFileSync(paginationPath, 'utf8');

      expect(content).toContain('window.scrollTo');
      expect(content).toContain("behavior: 'smooth'");
    });
  });

  describe('4. Catalog Pages Integration Invariants', () => {
    it('AllGamesClient.tsx imports and uses unified Pagination with zero unmounting', () => {
      const allGamesPath = path.resolve(__dirname, '../../app/games/AllGamesClient.tsx');
      const content = fs.readFileSync(allGamesPath, 'utf8');

      expect(content).toContain("import Pagination from '@/components/Pagination';");
      expect(content).toContain('<Pagination');
      expect(content).toContain('currentPage={currentPage}');
      expect(content).toContain('totalPages={totalPages}');
      expect(content).toContain('isLoading={isLoading}');
      // Ensures old unmounting pattern (!isLoading && totalPages > 1) is gone
      expect(content).not.toContain('{(!isLoading && totalPages > 1)');
    });

    it('PopularGamesClient.tsx imports and uses unified Pagination', () => {
      const popularGamesPath = path.resolve(__dirname, '../../app/popular/PopularGamesClient.tsx');
      const content = fs.readFileSync(popularGamesPath, 'utf8');

      expect(content).toContain("import Pagination from '@/components/Pagination';");
      expect(content).toContain('<Pagination');
      expect(content).toContain('currentPage={currentPage}');
      expect(content).toContain('totalPages={totalPages}');
      expect(content).toContain('onPageChange={handlePageChange}');
    });

    it('NewGamesClient.tsx imports and uses unified Pagination', () => {
      const newGamesPath = path.resolve(__dirname, '../../app/games/new/NewGamesClient.tsx');
      const content = fs.readFileSync(newGamesPath, 'utf8');

      expect(content).toContain("import Pagination from '@/components/Pagination';");
      expect(content).toContain('<Pagination');
      expect(content).toContain('currentPage={currentPage}');
      expect(content).toContain('totalPages={totalPages}');
      expect(content).toContain('onPageChange={handlePageChange}');
    });
  });
});
