import { describe, it, expect } from 'vitest';
import {
  createImpressionToken,
  verifyImpressionToken,
} from '@/lib/security/ad-token';

describe('Anti-Cheat Ad Impression Token Engine (RFC-AD-001)', () => {
  const sampleSlotId = 'zone-sidebar-300x250';
  const sampleGameId = 'game-snake-123';
  const sampleSessionId = 'sess-xyz-987';

  describe('1. Token Generation & Structure Standards', () => {
    it('should generate a two-part dot-delimited token (<payload>.<signature>)', async () => {
      const token = await createImpressionToken({
        slotId: sampleSlotId,
        gameId: sampleGameId,
        sessionId: sampleSessionId,
      });

      expect(typeof token).toBe('string');
      const parts = token.split('.');
      expect(parts).toHaveLength(2);
      expect(parts[0].length).toBeGreaterThan(10);
      expect(parts[1].length).toBe(64); // 32-byte SHA-256 HMAC in hex = 64 characters
    });

    it('should generate unique cryptographic nonces on subsequent calls', async () => {
      const token1 = await createImpressionToken({ slotId: sampleSlotId });
      const token2 = await createImpressionToken({ slotId: sampleSlotId });

      expect(token1).not.toBe(token2);

      const res1 = await verifyImpressionToken(token1);
      const res2 = await verifyImpressionToken(token2);

      expect(res1.valid).toBe(true);
      expect(res2.valid).toBe(true);
      if (res1.valid && res2.valid) {
        expect(res1.payload.nonce).not.toBe(res2.payload.nonce);
        expect(res1.payload.nonce.length).toBe(32); // 16 bytes = 32 hex chars
      }
    });
  });

  describe('2. Token Verification & Payload Integrity', () => {
    it('should successfully verify a genuine, untampered token', async () => {
      const token = await createImpressionToken({
        slotId: sampleSlotId,
        gameId: sampleGameId,
        sessionId: sampleSessionId,
      });

      const result = await verifyImpressionToken(token);
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.payload.slotId).toBe(sampleSlotId);
        expect(result.payload.gameId).toBe(sampleGameId);
        expect(result.payload.sessionId).toBe(sampleSessionId);
        expect(typeof result.payload.nonce).toBe('string');
        expect(result.payload.expiresAt).toBeGreaterThan(Date.now());
      }
    });

    it('should handle optional gameId and sessionId gracefully as null', async () => {
      const token = await createImpressionToken({ slotId: sampleSlotId });
      const result = await verifyImpressionToken(token);

      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.payload.slotId).toBe(sampleSlotId);
        expect(result.payload.gameId).toBeNull();
        expect(result.payload.sessionId).toBeNull();
      }
    });
  });

  describe('3. Anti-Fraud & Rejection Invariants', () => {
    it('should reject expired tokens (> 120s)', async () => {
      // Create a token with negative TTL (already expired)
      const expiredToken = await createImpressionToken({
        slotId: sampleSlotId,
        customTtlMs: -5000,
      });

      const result = await verifyImpressionToken(expiredToken);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.reason).toBe('EXPIRED');
        expect(result.error).toContain('expired');
      }
    });

    it('should reject tokens with tampered payload content', async () => {
      const token = await createImpressionToken({ slotId: sampleSlotId });
      const [payload, sig] = token.split('.');

      // Alter payload string by appending characters
      const tamperedToken = `${payload}x.${sig}`;
      const result = await verifyImpressionToken(tamperedToken);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.reason).toBe('INVALID_SIGNATURE');
      }
    });

    it('should reject tokens with tampered HMAC signatures', async () => {
      const token = await createImpressionToken({ slotId: sampleSlotId });
      const [payload, sig] = token.split('.');

      // Corrupt the signature hex
      const corruptedSig = sig.slice(0, 62) + '00';
      const result = await verifyImpressionToken(`${payload}.${corruptedSig}`);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.reason).toBe('INVALID_SIGNATURE');
      }
    });

    it('should reject tokens signed with a mismatched secret key', async () => {
      const token = await createImpressionToken({
        slotId: sampleSlotId,
        overrideSecret: 'attacker-secret-key-12345678',
      });

      // Verification using server standard key
      const result = await verifyImpressionToken(token);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.reason).toBe('INVALID_SIGNATURE');
      }
    });

    it('should reject malformed token strings and null/empty inputs', async () => {
      expect((await verifyImpressionToken('')).valid).toBe(false);
      expect((await verifyImpressionToken('no-dot-token')).valid).toBe(false);
      expect((await verifyImpressionToken('one.two.three')).valid).toBe(false);
      expect((await verifyImpressionToken(null as any)).valid).toBe(false);
      expect((await verifyImpressionToken(undefined as any)).valid).toBe(false);
    });
  });

  describe('3. AdSense Ownership Verification & ads.txt Compliance (IAB Standards)', () => {
    it('should contain the verified Google AdSense publisher DIRECT entry in public/ads.txt', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const adsTxtPath = path.resolve(process.cwd(), 'public/ads.txt');
      expect(fs.existsSync(adsTxtPath)).toBe(true);

      const content = fs.readFileSync(adsTxtPath, 'utf-8');
      const requiredLine = 'google.com, pub-9824094207004107, DIRECT, f08c47fec0942fa0';

      expect(content).toContain(requiredLine);

      // Verify it appears in the primary publisher section
      const lines = content.split('\n').map((l) => l.trim());
      const pubIndex = lines.indexOf(requiredLine);
      expect(pubIndex).toBeGreaterThanOrEqual(0);
      expect(pubIndex).toBeLessThan(10); // Guaranteed in the top 10 lines
    });
  });
});
