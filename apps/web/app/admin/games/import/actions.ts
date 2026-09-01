'use server';

import { createClient } from '@/lib/supabase/server';
import { verifyAdminAction } from '@/lib/admin';
import { revalidatePath } from 'next/cache';
import { 
  FeedProvider, 
  RawGameFeedItem, 
  fetchGameMonetizeFeed, 
  fetchGameDistributionFeed, 
  fetchCustomJsonFeed 
} from '@/lib/game-feeds';
import { enrichGameForDatabase, slugifyGameTitle } from '@/lib/seo-enricher';

export interface FeedPreviewResult {
  games: (RawGameFeedItem & { slug: string; isImported: boolean })[];
  totalFetched: number;
  newCount: number;
}

/**
 * Fetch games from a feed provider and mark which ones already exist in Supabase
 */
export async function fetchFeedPreview(
  provider: FeedProvider,
  options?: {
    category?: string;
    limit?: number;
    customUrl?: string;
  }
): Promise<{ success: boolean; data?: FeedPreviewResult; error?: string }> {
  const auth = await verifyAdminAction();
  if (!auth.success) {
    return { success: false, error: 'Unauthorized: Admin access required.' };
  }

  try {
    let rawGames: RawGameFeedItem[] = [];

    if (provider === 'gamemonetize') {
      rawGames = await fetchGameMonetizeFeed({
        category: options?.category,
        num: options?.limit || 50
      });
    } else if (provider === 'gamedistribution') {
      rawGames = await fetchGameDistributionFeed({
        collection: options?.category
      });
    } else if (provider === 'custom' && options?.customUrl) {
      rawGames = await fetchCustomJsonFeed(options.customUrl);
    }

    if (rawGames.length === 0) {
      return {
        success: true,
        data: { games: [], totalFetched: 0, newCount: 0 }
      };
    }

    // Check existing slugs in Supabase to detect duplicates
    const supabase = createClient();
    const slugsToCheck = rawGames.map(g => slugifyGameTitle(g.title));
    
    const { data: existingGames } = await supabase
      .from('games')
      .select('slug')
      .in('slug', slugsToCheck);

    const existingSlugSet = new Set(existingGames?.map(g => g.slug) || []);

    const enrichedPreview = rawGames.map(game => {
      const slug = slugifyGameTitle(game.title);
      return {
        ...game,
        slug,
        isImported: existingSlugSet.has(slug)
      };
    });

    const newCount = enrichedPreview.filter(g => !g.isImported).length;

    return {
      success: true,
      data: {
        games: enrichedPreview,
        totalFetched: enrichedPreview.length,
        newCount
      }
    };
  } catch (error: any) {
    console.error('fetchFeedPreview error:', error);
    return {
      success: false,
      error: error?.message || 'Failed to fetch game feed.'
    };
  }
}

/**
 * Batch import selected games into Supabase with automatic SEO enrichment
 */
export async function batchImportGames(
  gamesToImport: RawGameFeedItem[]
): Promise<{ success: boolean; importedCount: number; error?: string }> {
  const auth = await verifyAdminAction();
  if (!auth.success) {
    return { success: false, importedCount: 0, error: 'Unauthorized: Admin access required.' };
  }

  if (!gamesToImport || gamesToImport.length === 0) {
    return { success: false, importedCount: 0, error: 'No games selected for import.' };
  }

  try {
    const supabase = createClient();

    // Run SEO Enrichment on all selected games
    const enrichedRecords = gamesToImport.map(rawGame => enrichGameForDatabase(rawGame));

    // Batch upsert to Supabase in chunks of 50 for stability
    const chunkSize = 50;
    let totalImported = 0;

    for (let i = 0; i < enrichedRecords.length; i += chunkSize) {
      const chunk = enrichedRecords.slice(i, i + chunkSize);
      
      let { error } = await supabase
        .from('games')
        .upsert(chunk, { onConflict: 'slug' });

      // If 'metadata' or 'source_url' columns don't exist in Supabase schema yet, fallback gracefully
      if (error && (error.message.includes('metadata') || error.message.includes('source_url'))) {
        console.warn('Column not found in Supabase schema. Retrying with available core columns.');
        const isMetadataMissing = error.message.includes('metadata');
        const isSourceUrlMissing = error.message.includes('source_url');

        const fallbackChunk = chunk.map(({ metadata, source_url, ...core }) => {
          const item: any = { ...core };
          if (!isMetadataMissing) item.metadata = metadata;
          if (!isSourceUrlMissing) item.source_url = source_url;
          return item;
        });

        const retryResult = await supabase
          .from('games')
          .upsert(fallbackChunk, { onConflict: 'slug' });
        
        error = retryResult.error;
      }

      if (error) {
        console.error('Batch import chunk error:', error);
        throw new Error(`Database error on batch chunk: ${error.message}`);
      }

      totalImported += chunk.length;
    }

    // Revalidate paths for instantaneous Edge cache refresh
    try {
      revalidatePath('/admin/games');
      revalidatePath('/games');
      revalidatePath('/(home)', 'page');
      revalidatePath('/sitemap.xml');
    } catch (revalErr) {
      console.warn('Revalidation warning:', revalErr);
    }

    return {
      success: true,
      importedCount: totalImported
    };
  } catch (error: any) {
    console.error('batchImportGames error:', error);
    return {
      success: false,
      importedCount: 0,
      error: error?.message || 'Failed to complete batch import.'
    };
  }
}
