-- 20260918_full_text_search_pg_trgm.sql
-- RFC-SEARCH-001: Hybrid Full-Text & Trigram Fuzzy Search Engine Optimization

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add Search Document Vector Column
ALTER TABLE public.games 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 3. Document Vector Trigger Function
CREATE OR REPLACE FUNCTION public.games_search_vector_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', replace(coalesce(NEW.slug, ''), '-', ' ')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.category, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.metadata->>'tags', '')), 'C');
  RETURN NEW;
END;
$$;

-- 4. Create Trigger on Games Table
DROP TRIGGER IF EXISTS trg_games_search_vector ON public.games;
CREATE TRIGGER trg_games_search_vector
  BEFORE INSERT OR UPDATE OF title, slug, category, description, metadata
  ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION public.games_search_vector_trigger();

-- 5. Backfill Existing Records
UPDATE public.games
SET search_vector =
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', replace(coalesce(slug, ''), '-', ' ')), 'B') ||
  setweight(to_tsvector('english', coalesce(category, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(metadata->>'tags', '')), 'C')
WHERE search_vector IS NULL;

-- 6. GIN Performance Indexes
CREATE INDEX IF NOT EXISTS idx_games_search_vector 
ON public.games USING gin (search_vector);

CREATE INDEX IF NOT EXISTS idx_games_title_trgm 
ON public.games USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_games_slug_trgm 
ON public.games USING gin (slug gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_games_category_trgm 
ON public.games USING gin (category gin_trgm_ops);

-- 7. High-Performance Hybrid Stored Procedure
CREATE OR REPLACE FUNCTION public.search_games(
  search_query text DEFAULT '',
  category_filter text DEFAULT NULL,
  limit_val int DEFAULT 12,
  similarity_threshold real DEFAULT 0.2
)
RETURNS TABLE (
  id uuid,
  slug text,
  title text,
  category text,
  rating numeric,
  image_url text,
  total_plays integer,
  relevance real
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  clean_q text;
  ts_q tsquery;
  has_query boolean;
  has_cat boolean;
BEGIN
  clean_q := trim(coalesce(search_query, ''));
  has_query := (length(clean_q) > 0);
  has_cat := (category_filter IS NOT NULL AND length(trim(category_filter)) > 0 AND lower(trim(category_filter)) <> 'all');

  -- If empty query, return top active games (filtered by category if specified)
  IF NOT has_query THEN
    RETURN QUERY
    SELECT 
      g.id,
      g.slug,
      g.title,
      g.category,
      g.rating,
      g.image_url,
      g.total_plays,
      1.0::real AS relevance
    FROM public.games g
    WHERE g.status = 'active'
      AND (NOT has_cat OR g.category ILIKE ('%' || trim(category_filter) || '%'))
    ORDER BY g.total_plays DESC NULLS LAST
    LIMIT limit_val;
    RETURN;
  END IF;

  -- Build safe tsquery via websearch_to_tsquery (handles multi-word, quotes, operators safely)
  BEGIN
    ts_q := websearch_to_tsquery('english', clean_q);
  EXCEPTION WHEN OTHERS THEN
    ts_q := plainto_tsquery('english', clean_q);
  END;

  RETURN QUERY
  SELECT 
    g.id,
    g.slug,
    g.title,
    g.category,
    g.rating,
    g.image_url,
    g.total_plays,
    (
      -- Exact title match bonus
      (CASE WHEN lower(g.title) = lower(clean_q) THEN 12.0 ELSE 0.0 END) +
      -- Exact slug match bonus
      (CASE WHEN lower(g.slug) = lower(clean_q) THEN 10.0 ELSE 0.0 END) +
      -- Title starts with query bonus
      (CASE WHEN lower(g.title) LIKE (lower(clean_q) || '%') THEN 6.0 ELSE 0.0 END) +
      -- Title contains query as substring
      (CASE WHEN lower(g.title) LIKE ('%' || lower(clean_q) || '%') THEN 3.0 ELSE 0.0 END) +
      -- Trigram similarity on title (typo tolerance)
      (coalesce(similarity(g.title, clean_q), 0.0) * 5.0) +
      -- Word similarity on title (compound games like "Subway Surfers" vs "Subway")
      (coalesce(word_similarity(clean_q, g.title), 0.0) * 4.0) +
      -- Full-text search cover density rank
      (CASE WHEN ts_q IS NOT NULL AND g.search_vector @@ ts_q THEN coalesce(ts_rank_cd(g.search_vector, ts_q, 32), 0.0) * 4.0 ELSE 0.0 END)
    ) * (1.0 + ln(greatest(coalesce(g.total_plays, 0), 1) + 1.0) * 0.08)::real AS relevance
  FROM public.games g
  WHERE g.status = 'active'
    AND (NOT has_cat OR g.category ILIKE ('%' || trim(category_filter) || '%'))
    AND (
      -- Full-text search match
      (ts_q IS NOT NULL AND g.search_vector @@ ts_q)
      -- Substring match on title, slug, category
      OR lower(g.title) LIKE ('%' || lower(clean_q) || '%')
      OR lower(g.slug) LIKE ('%' || lower(clean_q) || '%')
      OR lower(g.category) LIKE ('%' || lower(clean_q) || '%')
      -- Trigram fuzzy match (typo tolerance)
      OR similarity(g.title, clean_q) >= similarity_threshold
      OR word_similarity(clean_q, g.title) >= 0.35
    )
  ORDER BY relevance DESC, g.total_plays DESC NULLS LAST
  LIMIT limit_val;
END;
$$;

-- 8. Grant Execution Permissions to Application Roles
GRANT EXECUTE ON FUNCTION public.search_games(text, text, int, real) TO anon;
GRANT EXECUTE ON FUNCTION public.search_games(text, text, int, real) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_games(text, text, int, real) TO service_role;
