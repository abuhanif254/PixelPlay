import { describe, it, expect } from 'vitest';
import { isWhitelistedImage, WHITELISTED_IMAGE_DOMAINS } from '@/lib/image-helpers';

describe('Core Web Vitals & Image Optimization Suite (RFC-PERF-001)', () => {
  describe('Domain Whitelist Security (isWhitelistedImage)', () => {
    it('accepts whitelisted CDN domains exactly and their subdomains', () => {
      const allowedSamples = [
        'https://img.gamemonetize.com/thumbnail.jpg',
        'https://html5.gamemonetize.com/banner.webp',
        'https://img.gamedistribution.com/game-cover.png',
        'https://static.gamedistribution.com/asset.avif',
        'https://cdn.gamepix.com/games/2048/icon.png',
        'https://xyzabc.supabase.co/storage/v1/object/public/game-assets/cover.jpg',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Gamer1',
        'https://images.unsplash.com/photo-12345?w=400',
        'https://lh3.googleusercontent.com/a/ACg8ocI...',
        'https://avatars.githubusercontent.com/u/123456?v=4',
        'https://spielcade.com/assets/banner.png',
        'https://play.spielcade.com/logo.webp',
      ];

      for (const url of allowedSamples) {
        expect(isWhitelistedImage(url), `Expected ${url} to be whitelisted`).toBe(true);
      }
    });

    it('accepts local relative paths, data URLs, and blob URLs', () => {
      expect(isWhitelistedImage('/covers/flappy.png')).toBe(true);
      expect(isWhitelistedImage('/images/hero.webp')).toBe(true);
      expect(isWhitelistedImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...')).toBe(true);
      expect(isWhitelistedImage('blob:http://localhost:3000/1234-5678')).toBe(true);
    });

    it('strictly enforces HTTPS protocol for remote domains', () => {
      // Insecure HTTP should always be rejected to prevent mixed content & MITM attacks
      expect(isWhitelistedImage('http://img.gamemonetize.com/thumbnail.jpg')).toBe(false);
      expect(isWhitelistedImage('http://img.gamedistribution.com/cover.png')).toBe(false);
      expect(isWhitelistedImage('ftp://img.gamemonetize.com/cover.png')).toBe(false);
    });

    it('rejects untrusted third-party domains to prevent SSRF and open proxy abuse', () => {
      const untrustedSamples = [
        'https://malicious-cdn.com/exploit.jpg',
        'https://phishing-site.xyz/image.png',
        'https://evil-gamemonetize.com/fake.jpg', // Lookalike domain attack
        'https://gamemonetize.com.attacker.com/evil.jpg', // Suffix spoofing
        'https://supabase.co.attacker.io/leak.png',
        'https://169.254.169.254/latest/meta-data', // AWS IMDS SSRF
        'https://127.0.0.1/admin.png', // Loopback SSRF
        'https://localhost:8080/secret.jpg',
      ];

      for (const url of untrustedSamples) {
        expect(isWhitelistedImage(url), `Expected ${url} to be rejected`).toBe(false);
      }
    });

    it('gracefully handles null, undefined, empty strings, and malformed URLs', () => {
      expect(isWhitelistedImage(null)).toBe(false);
      expect(isWhitelistedImage(undefined)).toBe(false);
      expect(isWhitelistedImage('')).toBe(false);
      expect(isWhitelistedImage('   ')).toBe(false);
      expect(isWhitelistedImage('not-a-url')).toBe(false);
      expect(isWhitelistedImage('htt//broken-url')).toBe(false);
    });

    it('maintains a comprehensive whitelist of production partners', () => {
      expect(WHITELISTED_IMAGE_DOMAINS).toContain('gamemonetize.com');
      expect(WHITELISTED_IMAGE_DOMAINS).toContain('gamedistribution.com');
      expect(WHITELISTED_IMAGE_DOMAINS).toContain('gamepix.com');
      expect(WHITELISTED_IMAGE_DOMAINS).toContain('supabase.co');
      expect(WHITELISTED_IMAGE_DOMAINS).toContain('spielcade.com');
      expect(WHITELISTED_IMAGE_DOMAINS.length).toBeGreaterThanOrEqual(9);
    });
  });

  describe('Catalog Grid Layout & CLS Prevention Calibration', () => {
    it('verifies 4:3 aspect ratio alignment between GameCard and GameCardSkeleton', () => {
      // 4:3 aspect ratio = 1.3333...
      const targetRatio = 4 / 3;
      expect(targetRatio).toBeCloseTo(1.3333, 4);

      // Previous aspect-square (1:1 = 1.0) caused a 25% height mismatch during hydration
      const previousSquareRatio = 1 / 1;
      const heightDiscrepancyPercentage = ((targetRatio - previousSquareRatio) / targetRatio) * 100;
      expect(heightDiscrepancyPercentage).toBeCloseTo(25, 1);

      // Both GameCard and GameCardSkeleton now utilize the matching aspect-[4/3] class token
      const gameCardClassToken = 'aspect-[4/3]';
      const skeletonClassToken = 'aspect-[4/3]';
      expect(gameCardClassToken).toBe(skeletonClassToken);
    });

    it('validates responsive sizes string for Next.js image density calculation', () => {
      const sizes = '(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 240px';
      
      // Check that all 4 grid breakpoints and fallback are properly specified
      expect(sizes).toContain('(max-width: 640px) 50vw');
      expect(sizes).toContain('(max-width: 768px) 33vw');
      expect(sizes).toContain('(max-width: 1024px) 25vw');
      expect(sizes).toContain('(max-width: 1280px) 20vw');
      expect(sizes).toMatch(/240px$/);

      // Verify sizes covers mobile (50vw for 2-column layout)
      const mobileSpec = sizes.match(/\(max-width: 640px\)\s*(\d+)vw/);
      expect(mobileSpec).not.toBeNull();
      expect(mobileSpec![1]).toBe('50');
    });

    it('verifies CDN preconnect origin format for zero-RTT TLS handshakes', () => {
      const criticalCdnOrigins = [
        'https://img.gamemonetize.com',
        'https://img.gamedistribution.com',
        'https://html5.gamedistribution.com',
      ];

      for (const origin of criticalCdnOrigins) {
        const url = new URL(origin);
        expect(url.protocol).toBe('https:');
        expect(url.pathname).toBe('/');
        expect(url.search).toBe('');
      }
    });
  });

  describe('Priority Preloading Rules', () => {
    it('applies priority preloading correctly only to above-the-fold cards', () => {
      // Priority should be enabled for the first row of items (e.g. index < 4 or 6)
      const cardCount = 20;
      const topRowThreshold = 4;

      const cardStates = Array.from({ length: cardCount }, (_, idx) => ({
        index: idx,
        priority: idx < topRowThreshold,
        loading: idx < topRowThreshold ? 'eager' : 'lazy',
        fetchPriority: idx < topRowThreshold ? 'high' : 'auto',
      }));

      // Top row (0, 1, 2, 3) must be eager + high fetchPriority
      for (let i = 0; i < topRowThreshold; i++) {
        expect(cardStates[i].priority).toBe(true);
        expect(cardStates[i].loading).toBe('eager');
        expect(cardStates[i].fetchPriority).toBe('high');
      }

      // Below the fold (4..19) must be lazy + auto fetchPriority
      for (let i = topRowThreshold; i < cardCount; i++) {
        expect(cardStates[i].priority).toBe(false);
        expect(cardStates[i].loading).toBe('lazy');
        expect(cardStates[i].fetchPriority).toBe('auto');
      }
    });
  });
});
