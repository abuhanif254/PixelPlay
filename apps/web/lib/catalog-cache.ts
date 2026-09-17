import { gamesRegistry } from '@spielcade/games/registry';
import { createClient } from '@supabase/supabase-js';

export interface CachedGameItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  rating: number;
  image?: string;
  image_url: string;
  total_plays: number;
  description?: string;
  created_at?: string;
}

export interface CatalogCachePayload {
  trending: CachedGameItem[];
  newGames: CachedGameItem[];
  topRated: CachedGameItem[];
  totalActiveGames: number;
  cachedAt: number;
}

// Generate high-reliability local fallback games derived from registry
export function getLocalFallbackCatalog(): CatalogCachePayload {
  const fallbackGames: CachedGameItem[] = Object.entries(gamesRegistry).map(([slug, item]) => ({
    id: slug,
    slug,
    title: item.config.title,
    category: item.config.category || 'Arcade',
    rating: item.config.rating || 4.9,
    image: item.config.image || '',
    image_url: item.config.image || '',
    total_plays: 100000,
    description: 'Instant free HTML5 browser game playable on any device.',
    created_at: new Date().toISOString(),
  }));

  return {
    trending: fallbackGames,
    newGames: fallbackGames,
    topRated: fallbackGames,
    totalActiveGames: 17125,
    cachedAt: Date.now(),
  };
}

// Public Supabase client for reading active game catalog without session/cookie dependencies
function getPublicCatalogClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

// Edge memory cache container attached to globalThis to survive Edge invocations
interface GlobalCatalogCache {
  payload: CatalogCachePayload | null;
  revalidatingPromise: Promise<CatalogCachePayload> | null;
}

const g = globalThis as unknown as { __spielcade_catalog_cache?: GlobalCatalogCache };
if (!g.__spielcade_catalog_cache) {
  g.__spielcade_catalog_cache = {
    payload: null,
    revalidatingPromise: null,
  };
}

const CACHE_TTL_MS = 300_000; // 5 minutes freshness window
const STALE_GRACE_MS = 86_400_000; // 24 hours stale-while-revalidate serving

async function fetchFreshCatalog(): Promise<CatalogCachePayload> {
  const fallback = getLocalFallbackCatalog();

  // During static site generation (next build), return the local registry catalog immediately
  // to avoid hanging the build pipeline on external database network queries.
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return fallback;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const supabase = getPublicCatalogClient();
    const [
      { data: trendingGames },
      { data: newArrivals },
      { data: topRatedGames },
      { count: exactCount },
    ] = await Promise.all([
      supabase
        .from('games')
        .select('id, title, slug, image_url, category, total_plays, rating, description')
        .eq('status', 'active')
        .order('total_plays', { ascending: false })
        .limit(36)
        .abortSignal(controller.signal),
      supabase
        .from('games')
        .select('id, title, slug, image_url, category, total_plays, rating')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(16)
        .abortSignal(controller.signal),
      supabase
        .from('games')
        .select('id, title, slug, image_url, category, total_plays, rating')
        .eq('status', 'active')
        .order('rating', { ascending: false })
        .limit(12)
        .abortSignal(controller.signal),
      supabase
        .from('games')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .abortSignal(controller.signal),
    ]);

    clearTimeout(timeoutId);

    const result: CatalogCachePayload = {
      trending: (trendingGames && trendingGames.length > 0 ? (trendingGames as any) : fallback.trending),
      newGames: (newArrivals && newArrivals.length > 0 ? (newArrivals as any) : fallback.newGames),
      topRated: (topRatedGames && topRatedGames.length > 0 ? (topRatedGames as any) : fallback.topRated),
      totalActiveGames: exactCount || fallback.totalActiveGames,
      cachedAt: Date.now(),
    };

    return result;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[CatalogCache] Background refresh error, using fallback:', err);
    return fallback;
  }
}

/**
 * Returns warm Edge in-memory catalog data in < 1ms.
 * Employs Stale-While-Revalidate: if cached data is older than 5 minutes,
 * serves stale data immediately and revalidates in the background without blocking the user.
 */
export async function getCachedCatalogData(): Promise<CatalogCachePayload> {
  // During static site generation (next build), return the local registry catalog immediately
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return getLocalFallbackCatalog();
  }

  const cache = g.__spielcade_catalog_cache!;
  const now = Date.now();

  // 1. Fresh Cache Hit (< 5 minutes old) -> Return in < 0.1ms with ZERO network calls
  if (cache.payload && now - cache.payload.cachedAt < CACHE_TTL_MS) {
    return cache.payload;
  }

  // 2. Stale Cache Hit (5 min to 24 hr old) -> Return immediately & trigger background SWR revalidation
  if (cache.payload && now - cache.payload.cachedAt < STALE_GRACE_MS) {
    const staleData = cache.payload;

    if (!cache.revalidatingPromise) {
      cache.revalidatingPromise = fetchFreshCatalog()
        .then((fresh) => {
          cache.payload = fresh;
          return fresh;
        })
        .finally(() => {
          cache.revalidatingPromise = null;
        });
    }

    return staleData;
  }

  // 3. Cold Start / Empty Cache -> Await first fetch, cache, and return
  if (!cache.revalidatingPromise) {
    cache.revalidatingPromise = fetchFreshCatalog()
      .then((fresh) => {
        cache.payload = fresh;
        return fresh;
      })
      .finally(() => {
        cache.revalidatingPromise = null;
      });
  }

  return cache.revalidatingPromise;
}
