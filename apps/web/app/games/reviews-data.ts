import { createPublicClient } from '@/lib/supabase/server';

export interface ReviewItem {
  id: string;
  userId?: string;
  author: string;
  avatarUrl?: string;
  level?: number;
  date: string;
  rating: number;
  content: string;
  helpful: number;
  isVerified?: boolean;
}

const SEED_REVIEWS: ReviewItem[] = [
  {
    id: 'seed-1',
    author: 'GameMaster99',
    date: '2 days ago',
    rating: 5,
    content: `Smooth performance and addictive mechanics! Works beautifully on both desktop and mobile browser.`,
    helpful: 24,
    isVerified: true,
    level: 14,
  },
  {
    id: 'seed-2',
    author: 'PixelNinja',
    date: '5 days ago',
    rating: 5,
    content: `Solid gameplay loop and no latency at all. Highly recommended for quick sessions during study or work breaks.`,
    helpful: 18,
    isVerified: true,
    level: 9,
  },
  {
    id: 'seed-3',
    author: 'RetroGamer42',
    date: '1 week ago',
    rating: 4,
    content: `Fun and challenging! Took a few tries to master the rhythm, but very rewarding once you get into the flow.`,
    helpful: 12,
    isVerified: false,
    level: 6,
  }
];

interface CachedReviewsEntry {
  items: ReviewItem[];
  cachedAt: number;
}

const gReviews = globalThis as unknown as { __spielcade_reviews_cache?: Map<string, CachedReviewsEntry> };
if (!gReviews.__spielcade_reviews_cache) {
  gReviews.__spielcade_reviews_cache = new Map();
}

const REVIEWS_TTL_MS = 600_000; // 10 minutes
const MAX_REVIEWS_CACHE_ENTRIES = 250;

export async function getGameReviews(slug: string, gameId?: string): Promise<ReviewItem[]> {
  const cacheKey = gameId || slug;
  const cache = gReviews.__spielcade_reviews_cache!;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.cachedAt < REVIEWS_TTL_MS) {
    return cached.items;
  }

  const supabase = createPublicClient();

  try {
    let query = supabase
      .from('game_reviews')
      .select(`
        id,
        rating,
        comment,
        helpful_count,
        created_at,
        author_name,
        user_id,
        user:user_id (
          username,
          avatar_url,
          level
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (gameId) {
      query = query.or(`game_id.eq.${gameId},game_slug.eq.${slug}`);
    } else {
      query = query.eq('game_slug', slug);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      if (cache.size >= MAX_REVIEWS_CACHE_ENTRIES) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey) cache.delete(oldestKey);
      }
      cache.set(cacheKey, { items: SEED_REVIEWS, cachedAt: Date.now() });
      return SEED_REVIEWS;
    }

    const items: ReviewItem[] = data.map((r: any) => {
      const createdAt = new Date(r.created_at);
      const diffDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const timeStr = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;

      return {
        id: r.id,
        userId: r.user_id,
        author: r.user?.username || r.author_name || 'Anonymous Player',
        avatarUrl: r.user?.avatar_url,
        level: r.user?.level || 1,
        date: timeStr,
        rating: r.rating || 5,
        content: r.comment || '',
        helpful: r.helpful_count || 0,
        isVerified: !!r.user_id,
      };
    });

    if (cache.size >= MAX_REVIEWS_CACHE_ENTRIES) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) cache.delete(oldestKey);
    }
    cache.set(cacheKey, { items, cachedAt: Date.now() });
    return items;
  } catch {
    return SEED_REVIEWS;
  }
}

