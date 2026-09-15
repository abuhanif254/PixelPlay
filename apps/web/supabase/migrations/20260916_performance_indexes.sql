-- 20260916_performance_indexes.sql
-- Safe & Idempotent: Creates missing performance indexes without touching existing tables or data

-- 1. Accelerates Sitemap chunk generation (1.xml, 2.xml... 20.xml) & New Arrivals
CREATE INDEX IF NOT EXISTS idx_games_sitemap 
ON public.games (status, created_at DESC) 
INCLUDE (slug, title, image_url);

-- 2. Accelerates Category browsing and Related Games recommendation engine
CREATE INDEX IF NOT EXISTS idx_games_category_plays 
ON public.games (status, category, total_plays DESC);

-- 3. Accelerates Top Rated sorting on Homepage and Browse
CREATE INDEX IF NOT EXISTS idx_games_rating 
ON public.games (status, rating DESC);

-- 4. Accelerates Trending / Most Played sorting
CREATE INDEX IF NOT EXISTS idx_games_total_plays 
ON public.games (status, total_plays DESC);

-- 5. Guarantees instant single-game lookup by slug
CREATE INDEX IF NOT EXISTS idx_games_slug 
ON public.games (slug);

-- 6. Enables pg_trgm for lightning-fast fuzzy title search in /api/search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_games_title_trgm 
ON public.games USING gin (title gin_trgm_ops);
