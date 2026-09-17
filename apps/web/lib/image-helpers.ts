/**
 * Whitelist of trusted image domains permitted to be processed by Next.js server image optimizer.
 * Prevents SSRF, open image proxying, and bandwidth theft.
 */
export const WHITELISTED_IMAGE_DOMAINS = [
  'spielcade.com',
  'supabase.co',
  'api.dicebear.com',
  'gamemonetize.com',
  'gamedistribution.com',
  'gamepix.com',
  'images.unsplash.com',
  'lh3.googleusercontent.com',
  'avatars.githubusercontent.com',
];

/**
 * Checks whether an image URL originates from a trusted domain that matches Next.js remotePatterns.
 * If true, Next.js can safely optimize the image (AVIF/WebP) via `/_next/image`.
 * If false, callers should pass `unoptimized={true}` so the browser fetches directly client-side.
 */
export function isWhitelistedImage(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();
  if (!trimmed) return false;

  // Local assets and data/blob URLs are always trusted
  if (trimmed.startsWith('/') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);

    // Strictly require HTTPS protocol
    if (parsed.protocol !== 'https:') {
      return false;
    }

    const host = parsed.hostname.toLowerCase();

    return WHITELISTED_IMAGE_DOMAINS.some(
      (trusted) => host === trusted || host.endsWith(`.${trusted}`)
    );
  } catch {
    return false;
  }
}
