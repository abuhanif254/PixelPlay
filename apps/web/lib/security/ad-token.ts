// apps/web/lib/security/ad-token.ts
// RFC-AD-001: Cryptographic Ephemeral Ad Impression Token Engine (HMAC-SHA256)

export interface ImpressionTokenPayload {
  slotId: string;
  gameId?: string | null;
  sessionId?: string | null;
  nonce: string;
  issuedAt: number;
  expiresAt: number;
}

export type VerifyTokenResult =
  | { valid: true; payload: ImpressionTokenPayload }
  | { valid: false; reason: 'EXPIRED' | 'INVALID_SIGNATURE' | 'MALFORMED' | 'PREMATURE'; error: string };

const TOKEN_TTL_MS = 120_000; // 120 seconds TTL (2 minutes)
const CLOCK_SKEW_TOLERANCE_MS = 5_000; // 5 seconds clock drift tolerance

function getSigningSecret(): string {
  return (
    process.env.AD_IMPRESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'spielcade-ad-verification-secret-master-entropy-v1'
  );
}

// URL-safe Base64 encoding/decoding utilities compatible with Edge, Node, and Browser
function toBase64Url(str: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(base64url: string): string {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function hexFromBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Creates a cryptographically signed, short-lived ephemeral token for an ad slot.
 */
export async function createImpressionToken(params: {
  slotId: string;
  gameId?: string | null;
  sessionId?: string | null;
  customTtlMs?: number;
  overrideSecret?: string;
}): Promise<string> {
  const now = Date.now();
  const ttl = params.customTtlMs ?? TOKEN_TTL_MS;

  // Generate 16 bytes of cryptographically random entropy for the nonce
  const nonceBytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(nonceBytes);
  const nonce = Array.from(nonceBytes, (b) => b.toString(16).padStart(2, '0')).join('');

  const payload: ImpressionTokenPayload = {
    slotId: params.slotId.trim(),
    gameId: params.gameId ? params.gameId.trim() : null,
    sessionId: params.sessionId ? params.sessionId.trim() : null,
    nonce,
    issuedAt: now,
    expiresAt: now + ttl,
  };

  const payloadStr = JSON.stringify(payload);
  const encodedPayload = toBase64Url(payloadStr);

  const secret = params.overrideSecret || getSigningSecret();
  const key = await getCryptoKey(secret);
  const signatureBuffer = await globalThis.crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(encodedPayload)
  );
  const signatureHex = hexFromBuffer(signatureBuffer);

  return `${encodedPayload}.${signatureHex}`;
}

/**
 * Verifies the authenticity, expiration, and format of an impression token.
 */
export async function verifyImpressionToken(
  token: string,
  overrideSecret?: string
): Promise<VerifyTokenResult> {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'MALFORMED', error: 'Token must be a non-empty string.' };
  }

  const parts = token.trim().split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { valid: false, reason: 'MALFORMED', error: 'Invalid token structure. Expected <payload>.<signature>.' };
  }

  const [encodedPayload, signatureHex] = parts;

  // 1. Verify HMAC-SHA256 signature
  try {
    const secret = overrideSecret || getSigningSecret();
    const key = await getCryptoKey(secret);
    const expectedSigBuffer = await globalThis.crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(encodedPayload)
    );
    const expectedSigHex = hexFromBuffer(expectedSigBuffer);

    // Constant-time comparison to prevent timing attacks
    if (signatureHex.length !== expectedSigHex.length) {
      return { valid: false, reason: 'INVALID_SIGNATURE', error: 'Signature mismatch.' };
    }

    let diff = 0;
    for (let i = 0; i < signatureHex.length; i++) {
      diff |= signatureHex.charCodeAt(i) ^ expectedSigHex.charCodeAt(i);
    }
    if (diff !== 0) {
      return { valid: false, reason: 'INVALID_SIGNATURE', error: 'Signature mismatch.' };
    }
  } catch (err: any) {
    return { valid: false, reason: 'MALFORMED', error: `Signature verification error: ${err.message}` };
  }

  // 2. Decode and parse JSON payload
  let payload: ImpressionTokenPayload;
  try {
    const decodedStr = fromBase64Url(encodedPayload);
    payload = JSON.parse(decodedStr);
  } catch (err: any) {
    return { valid: false, reason: 'MALFORMED', error: 'Failed to parse token payload JSON.' };
  }

  if (
    !payload ||
    typeof payload.slotId !== 'string' ||
    typeof payload.nonce !== 'string' ||
    typeof payload.issuedAt !== 'number' ||
    typeof payload.expiresAt !== 'number'
  ) {
    return { valid: false, reason: 'MALFORMED', error: 'Payload missing required schema fields.' };
  }

  // 3. Temporal Validity Checks
  const now = Date.now();

  // Reject future tokens beyond clock skew tolerance
  if (payload.issuedAt > now + CLOCK_SKEW_TOLERANCE_MS) {
    return { valid: false, reason: 'PREMATURE', error: 'Token issued in the future.' };
  }

  // Reject expired tokens
  if (now > payload.expiresAt) {
    return { valid: false, reason: 'EXPIRED', error: 'Token has expired.' };
  }

  return { valid: true, payload };
}
