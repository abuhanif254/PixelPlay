import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Offline Service Worker & PWA Subsystem (RFC-TEST-001)', () => {
  const publicDir = path.resolve(__dirname, '../../public');
  const manifestPath = path.join(publicDir, 'manifest.json');
  const swPath = path.join(publicDir, 'sw.js');

  describe('1. Web App Manifest 2.0 Specification & Installability', () => {
    it('should have a physically valid public/manifest.json', () => {
      expect(fs.existsSync(manifestPath)).toBe(true);
    });

    it('should satisfy all W3C PWA Installability requirements', () => {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      expect(typeof manifest.name).toBe('string');
      expect(typeof manifest.short_name).toBe('string');
      expect(manifest.start_url).toBe('/');
      expect(manifest.id).toBe('/');
      expect(manifest.scope).toBe('/');
      expect(manifest.display).toBe('standalone');
      expect(Array.isArray(manifest.display_override)).toBe(true);
      expect(manifest.display_override).toContain('standalone');
      expect(manifest.theme_color).toBe('#6366F1');
      expect(manifest.background_color).toBe('#05050F');
      expect(Array.isArray(manifest.categories)).toBe(true);
      expect(manifest.categories).toContain('games');
    });

    it('should include valid 192x192 and 512x512 maskable icons', () => {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      expect(Array.isArray(manifest.icons)).toBe(true);

      const has192 = manifest.icons.some(
        (icon: any) => icon.sizes === '192x192' && icon.purpose.includes('maskable')
      );
      const has512 = manifest.icons.some(
        (icon: any) => icon.sizes === '512x512' && icon.purpose.includes('maskable')
      );

      expect(has192).toBe(true);
      expect(has512).toBe(true);
    });

    it('should verify physical existence of all manifest icons on disk', () => {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      manifest.icons.forEach((icon: any) => {
        const iconFile = path.join(publicDir, icon.src);
        expect(fs.existsSync(iconFile)).toBe(true);
      });
    });

    it('should define quick launch shortcuts for flagship games and offline hub', () => {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      expect(Array.isArray(manifest.shortcuts)).toBe(true);
      expect(manifest.shortcuts.length).toBeGreaterThanOrEqual(3);

      const urls = manifest.shortcuts.map((s: any) => s.url);
      expect(urls).toContain('/games/snake');
      expect(urls).toContain('/games/2048');
      expect(urls).toContain('/games/flappy-bird');
      expect(urls).toContain('/offline');
    });
  });

  describe('2. Evergreen Service Worker v4 Invariants (public/sw.js)', () => {
    it('should have a physically valid public/sw.js', () => {
      expect(fs.existsSync(swPath)).toBe(true);
    });

    it('should use spielcade-v4 cache identifier', () => {
      const swContent = fs.readFileSync(swPath, 'utf8');
      expect(swContent).toContain("CACHE_NAME = 'spielcade-v4'");
    });

    it('should precache critical offline routes and flagship games', () => {
      const swContent = fs.readFileSync(swPath, 'utf8');
      expect(swContent).toContain("'/offline'");
      expect(swContent).toContain("'/games/snake'");
      expect(swContent).toContain("'/games/2048'");
      expect(swContent).toContain("'/games/flappy-bird'");
    });

    it('should register install, activate, and fetch lifecycle listeners', () => {
      const swContent = fs.readFileSync(swPath, 'utf8');
      expect(swContent).toContain("self.addEventListener('install'");
      expect(swContent).toContain("self.addEventListener('activate'");
      expect(swContent).toContain("self.addEventListener('fetch'");
    });

    it('should handle SKIP_WAITING client signals and claim clients immediately', () => {
      const swContent = fs.readFileSync(swPath, 'utf8');
      expect(swContent).toContain('SKIP_WAITING');
      expect(swContent).toContain('self.clients.claim()');
    });

    it('should automatically prune obsolete caches on activation', () => {
      const swContent = fs.readFileSync(swPath, 'utf8');
      expect(swContent).toContain('caches.delete(key)');
    });

    it('should use Promise.allSettled during precache installation for resilience', () => {
      const swContent = fs.readFileSync(swPath, 'utf8');
      expect(swContent).toContain('Promise.allSettled');
    });

    it('should verify physical existence of static assets listed in precache', () => {
      const staticAssets = [
        'manifest.json',
        'favicon.ico',
        'logo.png',
        'icons/icon-192x192.png',
        'icons/icon-512x512.png',
        'images/games/snake.svg',
        'images/games/2048.svg',
        'images/games/flappy-bird.svg',
      ];

      staticAssets.forEach((asset) => {
        const fullPath = path.join(publicDir, asset);
        expect(fs.existsSync(fullPath)).toBe(true);
      });
    });
  });
});
