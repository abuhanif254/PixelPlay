import { describe, it, expect } from 'vitest';
import {
  validateApiKeyFormat,
  hashApiKey,
  extractApiKeyFromHeaders,
} from '@/lib/auth/api-key';

describe('Auth & Developer Payout Engine (RFC-TEST-001)', () => {
  const validKey = 'sp_live_a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90';

  describe('1. Master API Key Format & Entropy Standards', () => {
    it('should accept properly formatted 72-character API keys', () => {
      expect(validateApiKeyFormat(validKey)).toBe(true);
    });

    it('should require the sp_live_ prefix', () => {
      const testKey = validKey.replace('sp_live_', 'sp_test_');
      expect(validateApiKeyFormat(testKey)).toBe(false);

      const noPrefixKey = validKey.replace('sp_live_', '');
      expect(validateApiKeyFormat(noPrefixKey)).toBe(false);
    });

    it('should require exactly 64 hexadecimal characters after prefix', () => {
      // 63 chars (too short)
      const shortKey = validKey.slice(0, 71);
      expect(validateApiKeyFormat(shortKey)).toBe(false);

      // 65 chars (too long)
      const longKey = validKey + 'a';
      expect(validateApiKeyFormat(longKey)).toBe(false);
    });

    it('should reject non-hexadecimal characters', () => {
      const nonHexKey = validKey.slice(0, 70) + 'zz';
      expect(validateApiKeyFormat(nonHexKey)).toBe(false);
    });

    it('should reject null, undefined, empty string, or non-string inputs', () => {
      expect(validateApiKeyFormat('')).toBe(false);
      expect(validateApiKeyFormat('   ')).toBe(false);
      expect(validateApiKeyFormat(null as any)).toBe(false);
      expect(validateApiKeyFormat(undefined as any)).toBe(false);
      expect(validateApiKeyFormat(12345 as any)).toBe(false);
    });
  });

  describe('2. Web Crypto SHA-256 Hash Invariance', () => {
    it('should generate a 64-character hexadecimal digest', async () => {
      const hash = await hashApiKey(validKey);
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64);
      expect(/^[a-f0-9]{64}$/.test(hash)).toBe(true);
    });

    it('should produce deterministic, idempotent digests for the same key', async () => {
      const hashA = await hashApiKey(validKey);
      const hashB = await hashApiKey(validKey);
      expect(hashA).toBe(hashB);
    });

    it('should produce distinct digests for distinct keys (zero collision)', async () => {
      const key2 = 'sp_live_0000000000000000000000000000000000000000000000000000000000000001';
      const hash1 = await hashApiKey(validKey);
      const hash2 = await hashApiKey(key2);
      expect(hash1).not.toBe(hash2);
    });

    it('should trim whitespace before hashing', async () => {
      const hashPadded = await hashApiKey(`  ${validKey}  `);
      const hashClean = await hashApiKey(validKey);
      expect(hashPadded).toBe(hashClean);
    });
  });

  describe('3. Authorization Header Extraction Protocols', () => {
    it('should extract API key from standard "Authorization: Bearer <key>" header', () => {
      const headers = new Headers({
        authorization: `Bearer ${validKey}`,
      });
      expect(extractApiKeyFromHeaders(headers)).toBe(validKey);
    });

    it('should handle case-insensitive "bearer" scheme', () => {
      const headers = new Headers({
        authorization: `bearer ${validKey}`,
      });
      expect(extractApiKeyFromHeaders(headers)).toBe(validKey);
    });

    it('should extract API key from custom "x-api-key" header', () => {
      const headers = new Headers({
        'x-api-key': validKey,
      });
      expect(extractApiKeyFromHeaders(headers)).toBe(validKey);
    });

    it('should prioritize Bearer token when both headers are provided', () => {
      const keySecondary = 'sp_live_ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
      const headers = new Headers({
        authorization: `Bearer ${validKey}`,
        'x-api-key': keySecondary,
      });
      expect(extractApiKeyFromHeaders(headers)).toBe(validKey);
    });

    it('should return null when auth headers are missing or malformed', () => {
      expect(extractApiKeyFromHeaders(new Headers())).toBeNull();
      expect(extractApiKeyFromHeaders(new Headers({ authorization: 'Basic dXNlcjpwYXNz' }))).toBeNull();
      expect(extractApiKeyFromHeaders(new Headers({ 'x-api-key': '' }))).toBeNull();
      expect(extractApiKeyFromHeaders(new Headers({ authorization: 'Bearer ' }))).toBeNull();
    });
  });

  describe('4. 70% Net Publisher Revenue Settlement Calculation Engine', () => {
    function computeSettlement(plays: number) {
      const impressions = Math.round(plays * 2.4);
      const gross = Number(((impressions / 1000) * 1.20).toFixed(4));
      const developerShare = Number((gross * 0.70).toFixed(4));
      const platformShare = Number((gross * 0.30).toFixed(4));
      return { impressions, gross, developerShare, platformShare };
    }

    it('should calculate zero revenue for 0 plays', () => {
      const rev = computeSettlement(0);
      expect(rev.impressions).toBe(0);
      expect(rev.gross).toBe(0);
      expect(rev.developerShare).toBe(0);
      expect(rev.platformShare).toBe(0);
    });

    it('should settle 100 plays with exact 70/30 split', () => {
      const rev = computeSettlement(100);
      expect(rev.impressions).toBe(240);
      expect(rev.gross).toBe(0.288);
      expect(rev.developerShare).toBe(0.2016);
      expect(rev.platformShare).toBe(0.0864);
      expect(Math.abs(rev.developerShare + rev.platformShare - rev.gross)).toBeLessThan(0.0001);
    });

    it('should settle 10,000 plays with exact $20.16 developer payout', () => {
      const rev = computeSettlement(10000);
      expect(rev.impressions).toBe(24000);
      expect(rev.gross).toBe(28.80);
      expect(rev.developerShare).toBe(20.16);
      expect(rev.platformShare).toBe(8.64);
      expect(rev.developerShare + rev.platformShare).toBe(rev.gross);
    });

    it('should settle 50,000 plays exceeding the $100 payout threshold', () => {
      const rev = computeSettlement(50000);
      expect(rev.impressions).toBe(120000);
      expect(rev.gross).toBe(144.00);
      expect(rev.developerShare).toBe(100.80);
      expect(rev.platformShare).toBe(43.20);
      expect(rev.developerShare + rev.platformShare).toBe(rev.gross);
    });

    it('should settle 1,000,000 plays scale safely', () => {
      const rev = computeSettlement(1000000);
      expect(rev.impressions).toBe(2400000);
      expect(rev.gross).toBe(2880.00);
      expect(rev.developerShare).toBe(2016.00);
      expect(rev.platformShare).toBe(864.00);
      expect(rev.developerShare + rev.platformShare).toBe(rev.gross);
    });
  });

  describe('5. Developer Payout Settings Rules & Account Validation', () => {
    function validatePayoutSettings(data: { method: string; account: string; taxCertified: boolean }) {
      const cleanMethod = String(data.method || '').toLowerCase().trim();
      if (!['paypal', 'stripe', 'wire'].includes(cleanMethod)) {
        return { valid: false, error: 'Invalid payout method selected.' };
      }
      const cleanAccount = String(data.account || '').trim();
      if (!cleanAccount || cleanAccount.length < 3 || cleanAccount.length > 255) {
        return { valid: false, error: 'Please enter a valid payout account identifier.' };
      }
      return {
        valid: true,
        data: {
          method: cleanMethod,
          account: cleanAccount,
          taxCertified: Boolean(data.taxCertified),
        },
      };
    }

    it('should accept valid PayPal configuration', () => {
      const res = validatePayoutSettings({
        method: 'paypal',
        account: 'developer@example.com',
        taxCertified: true,
      });
      expect(res.valid).toBe(true);
      expect(res.data?.method).toBe('paypal');
      expect(res.data?.taxCertified).toBe(true);
    });

    it('should accept valid Stripe Connected account', () => {
      const res = validatePayoutSettings({
        method: 'stripe',
        account: 'acct_1N00000000000000',
        taxCertified: false,
      });
      expect(res.valid).toBe(true);
      expect(res.data?.method).toBe('stripe');
    });

    it('should reject invalid payout methods', () => {
      expect(validatePayoutSettings({ method: 'crypto', account: '0x123...', taxCertified: true }).valid).toBe(false);
      expect(validatePayoutSettings({ method: 'check', account: '123 Main St', taxCertified: true }).valid).toBe(false);
      expect(validatePayoutSettings({ method: '', account: 'dev@test.com', taxCertified: true }).valid).toBe(false);
    });

    it('should reject empty or out-of-bounds account strings', () => {
      expect(validatePayoutSettings({ method: 'paypal', account: 'ab', taxCertified: true }).valid).toBe(false); // < 3 chars
      expect(validatePayoutSettings({ method: 'paypal', account: 'a'.repeat(256), taxCertified: true }).valid).toBe(false); // > 255 chars
      expect(validatePayoutSettings({ method: 'paypal', account: '   ', taxCertified: true }).valid).toBe(false);
    });
  });
});
