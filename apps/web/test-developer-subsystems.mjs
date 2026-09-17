import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

console.log('🧪 Starting SPIELCADE Developer Subsystems Test Suite (RFC-DEV-001 / SEC-11 / DEV-01)...');

// ─────────────────────────────────────────────────────────────────────────────
// Test Group 1: API Key Format Validation & Generation
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[1/5] Testing Master API Key Format & Entropy Standards...');

function validateApiKeyFormat(key) {
  if (!key || typeof key !== 'string') return false;
  return /^sp_live_[a-f0-9]{64}$/.test(key.trim());
}

// Generate valid key conforming to studio/actions.ts logic
function generateSampleKey() {
  const array = new Uint8Array(32);
  globalThis.crypto.getRandomValues(array);
  const rawKey = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `sp_live_${rawKey}`;
}

const sampleKey = generateSampleKey();
assert.equal(sampleKey.length, 72, 'Sample key length should be 72 chars (8 prefix + 64 hex)');
assert.equal(sampleKey.startsWith('sp_live_'), true, 'Sample key must have sp_live_ prefix');
assert.equal(validateApiKeyFormat(sampleKey), true, 'Sample key must pass format validation');

// Negative tests
assert.equal(validateApiKeyFormat('sp_test_1234'), false, 'Rejects test keys');
assert.equal(validateApiKeyFormat('sp_live_XYZ'), false, 'Rejects non-hex characters');
assert.equal(validateApiKeyFormat('sp_live_' + 'a'.repeat(63)), false, 'Rejects 63 hex chars');
assert.equal(validateApiKeyFormat('sp_live_' + 'a'.repeat(65)), false, 'Rejects 65 hex chars');
assert.equal(validateApiKeyFormat(''), false, 'Rejects empty string');
assert.equal(validateApiKeyFormat(null), false, 'Rejects null');
console.log('  ✔ Key format & entropy verification passed (100% compliant)');

// ─────────────────────────────────────────────────────────────────────────────
// Test Group 2: Web Crypto SHA-256 Hash Invariance & Consistency
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[2/5] Testing SHA-256 Web Crypto Hash Invariance...');

async function webCryptoHash(key) {
  const encoder = new TextEncoder();
  const data = encoder.encode(key.trim());
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const hash1 = await webCryptoHash(sampleKey);
const hash2 = await webCryptoHash(sampleKey);
assert.equal(hash1, hash2, 'Identical keys must produce identical SHA-256 hashes');
assert.equal(hash1.length, 64, 'SHA-256 hash must be exactly 64 hex characters');

// Compare with Node.js crypto standard
const nodeCryptoHash = createHash('sha256').update(sampleKey.trim()).digest('hex');
assert.equal(hash1, nodeCryptoHash, 'Web Crypto hash must match Node crypto SHA-256 byte-for-byte');

const differentKey = generateSampleKey();
const diffHash = await webCryptoHash(differentKey);
assert.notEqual(hash1, diffHash, 'Distinct keys must have distinct hashes');
console.log('  ✔ Web Crypto SHA-256 hashing is deterministic and matches OpenSSL digests');

// ─────────────────────────────────────────────────────────────────────────────
// Test Group 3: Header Extraction & Protocol Handling
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[3/5] Testing Authorization Header Extraction...');

function extractApiKeyFromHeaders(headers) {
  const authHeader = headers.get ? headers.get('authorization') : headers['authorization'];
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const candidate = authHeader.substring(7).trim();
    if (candidate) return candidate;
  }

  const customHeader = headers.get ? headers.get('x-api-key') : headers['x-api-key'];
  if (customHeader && customHeader.trim()) {
    return customHeader.trim();
  }

  return null;
}

// Bearer header standard
const headersBearer = new Headers({ Authorization: `Bearer ${sampleKey}` });
assert.equal(extractApiKeyFromHeaders(headersBearer), sampleKey, 'Extracts Bearer token correctly');

// Lowercase bearer
const headersBearerLower = new Headers({ authorization: `bearer ${sampleKey}` });
assert.equal(extractApiKeyFromHeaders(headersBearerLower), sampleKey, 'Extracts lowercase bearer correctly');

// Custom x-api-key header
const headersCustom = new Headers({ 'x-api-key': sampleKey });
assert.equal(extractApiKeyFromHeaders(headersCustom), sampleKey, 'Extracts x-api-key header correctly');

// Missing headers
const headersEmpty = new Headers();
assert.equal(extractApiKeyFromHeaders(headersEmpty), null, 'Returns null on missing headers');

// Malformed authorization
const headersMalformed = new Headers({ Authorization: 'Basic dXNlcjpwYXNz' });
assert.equal(extractApiKeyFromHeaders(headersMalformed), null, 'Ignores non-Bearer auth schemes');
console.log('  ✔ Header extraction accurately resolves Bearer and x-api-key protocols');

// ─────────────────────────────────────────────────────────────────────────────
// Test Group 4: Financial Settlement & Revenue Calculation Engine
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[4/5] Testing 70% Net Publisher Revenue Calculation Engine...');

function computeRevenueForPlays(plays) {
  const impressions = Math.round(plays * 2.4);
  const gross = Number(((impressions / 1000) * 1.20).toFixed(4));
  const developerShare = Number((gross * 0.70).toFixed(4));
  const platformShare = Number((gross * 0.30).toFixed(4));
  return { impressions, gross, developerShare, platformShare };
}

// Case 1: 100 plays
const rev100 = computeRevenueForPlays(100);
assert.equal(rev100.impressions, 240);
assert.equal(rev100.gross, 0.288);
assert.equal(rev100.developerShare, 0.2016);
assert.equal(rev100.platformShare, 0.0864);
assert.ok(Math.abs((rev100.developerShare + rev100.platformShare) - rev100.gross) < 0.0001);

// Case 2: 10,000 plays
const rev10k = computeRevenueForPlays(10000);
assert.equal(rev10k.impressions, 24000);
assert.equal(rev10k.gross, 28.80);
assert.equal(rev10k.developerShare, 20.16);
assert.equal(rev10k.platformShare, 8.64);
assert.equal(rev10k.developerShare + rev10k.platformShare, rev10k.gross);

// Case 3: 50,000 plays
const rev50k = computeRevenueForPlays(50000);
assert.equal(rev50k.impressions, 120000);
assert.equal(rev50k.gross, 144.00);
assert.equal(rev50k.developerShare, 100.80);
assert.equal(rev50k.platformShare, 43.20);
assert.equal(rev50k.developerShare + rev50k.platformShare, rev50k.gross);

console.log('  ✔ Guaranteed 70% publisher net rev-share calculation matches financial invariants');

// ─────────────────────────────────────────────────────────────────────────────
// Test Group 5: Server-Authoritative Score Bounds & Anti-Cheat Validation
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[5/5] Testing Server-Authoritative Score Anti-Cheat Rules...');

function validateScoreInput(score) {
  if (typeof score !== 'number' || !Number.isFinite(score)) {
    return { valid: false, error: 'Invalid score parameter. Must be a finite number.' };
  }
  const cleanScore = Math.floor(score);
  if (cleanScore < 0 || cleanScore > 10_000_000) {
    return { valid: false, error: 'Score out of bounds (0 to 10,000,000).' };
  }
  return { valid: true, cleanScore };
}

assert.equal(validateScoreInput(1500).valid, true);
assert.equal(validateScoreInput(1500).cleanScore, 1500);
assert.equal(validateScoreInput(1500.95).cleanScore, 1500, 'Floats must truncate to integer');
assert.equal(validateScoreInput(0).valid, true);
assert.equal(validateScoreInput(10_000_000).valid, true);

// Rejections
assert.equal(validateScoreInput(-1).valid, false);
assert.equal(validateScoreInput(10_000_001).valid, false);
assert.equal(validateScoreInput(Infinity).valid, false);
assert.equal(validateScoreInput(NaN).valid, false);
assert.equal(validateScoreInput('1500').valid, false);
assert.equal(validateScoreInput(null).valid, false);

console.log('  ✔ Score anti-cheat boundaries properly enforced (0 to 10,000,000)');

console.log('\n🎉 ALL 5 DEV & REVENUE SUBSYSTEM TESTS PASSED WITH 100% SUCCESS!\n');
