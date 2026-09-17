-- ============================================================================
-- Migration: 20260917_developer_revenue_and_api_system.sql
-- Description: Developer Revenue Settlement Engine & Master API Key Subsystem
-- RFC: RFC-DEV-001 / SEC-11 / DEV-01
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Extend public.api_keys Table
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.api_keys 
  ADD COLUMN IF NOT EXISTS name text DEFAULT 'Master API Key',
  ADD COLUMN IF NOT EXISTS last_used_at timestamp with time zone;

-- Index for high-throughput sub-millisecond API authentication lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_developer_id ON public.api_keys(developer_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Extend & Harden public.developer_revenue Table
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.developer_revenue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  game_id uuid REFERENCES public.games(id) ON DELETE CASCADE,
  date date NOT NULL,
  impressions integer DEFAULT 0,
  gross_revenue numeric(10,4) DEFAULT 0,
  developer_share numeric(10,4) DEFAULT 0,
  platform_share numeric(10,4) DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.developer_revenue ENABLE ROW LEVEL SECURITY;

-- Uniqueness constraint for daily idempotent settlement per developer & game
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'uq_developer_revenue_daily'
  ) THEN
    ALTER TABLE public.developer_revenue 
      ADD CONSTRAINT uq_developer_revenue_daily UNIQUE (developer_id, game_id, date);
  END IF;
EXCEPTION
  WHEN others THEN
    -- Fallback if duplicate rows exist
    NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_developer_revenue_dev_date ON public.developer_revenue(developer_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_developer_revenue_game_date ON public.developer_revenue(game_id, date DESC);

-- RLS Policies
DROP POLICY IF EXISTS "Developers can read own revenue" ON public.developer_revenue;
CREATE POLICY "Developers can read own revenue" 
  ON public.developer_revenue FOR SELECT 
  USING (auth.uid() = developer_id OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Stored Procedure: authenticate_api_key
-- Server-side atomic key lookup & last_used_at tracker
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.authenticate_api_key(p_key_hash text)
RETURNS TABLE (
  developer_id uuid,
  key_id uuid,
  key_name text,
  username text,
  full_name text,
  avatar_url text,
  email text,
  role text,
  is_banned boolean,
  created_at timestamp with time zone,
  last_used_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_key_id uuid;
BEGIN
  -- 1. Locate key and update last_used_at atomically
  UPDATE public.api_keys
  SET last_used_at = timezone('utc'::text, now())
  WHERE key_hash = p_key_hash
  RETURNING id INTO v_key_id;

  IF v_key_id IS NULL THEN
    RETURN;
  END IF;

  -- 2. Return developer and key details
  RETURN QUERY
  SELECT 
    k.developer_id,
    k.id AS key_id,
    COALESCE(k.name, 'Master API Key') AS key_name,
    p.username,
    p.full_name,
    p.avatar_url,
    COALESCE(u.email::text, ''::text) AS email,
    COALESCE(p.role, 'user'::text) AS role,
    COALESCE(p.is_banned, false) AS is_banned,
    k.created_at,
    timezone('utc'::text, now()) AS last_used_at
  FROM public.api_keys k
  JOIN public.profiles p ON p.id = k.developer_id
  LEFT JOIN auth.users u ON u.id = k.developer_id
  WHERE k.id = v_key_id;
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Stored Procedure: settle_daily_developer_revenue
-- Calculates and records 70% publisher share based on verified gameplay
-- Formula:
--   impressions = plays * 2.4
--   gross = (impressions / 1000.0) * 1.20
--   developer_share = gross * 0.70
--   platform_share = gross * 0.30
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.settle_daily_developer_revenue(target_date date DEFAULT (CURRENT_DATE - 1))
RETURNS TABLE (
  settled_count integer,
  total_gross numeric(10,4),
  total_developer_share numeric(10,4)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_settled integer := 0;
  v_gross numeric(10,4) := 0;
  v_dev numeric(10,4) := 0;
BEGIN
  -- Aggregate activity per game from analytics_events for target_date
  WITH daily_plays AS (
    SELECT 
      g.developer_id,
      g.id AS game_id,
      COUNT(ae.id) AS plays
    FROM public.games g
    JOIN public.analytics_events ae ON ae.game_id = g.id
    WHERE ae.event_type IN ('game_play', 'game_complete')
      AND (ae.created_at AT TIME ZONE 'UTC')::date = target_date
      AND g.developer_id IS NOT NULL
      AND g.status = 'active'
    GROUP BY g.developer_id, g.id
    HAVING COUNT(ae.id) > 0
  ),
  computed AS (
    SELECT 
      developer_id,
      game_id,
      target_date AS date,
      ROUND(plays * 2.4)::integer AS impressions,
      ROUND(((plays * 2.4) / 1000.0 * 1.20)::numeric, 4) AS gross_revenue,
      ROUND(((plays * 2.4) / 1000.0 * 1.20 * 0.70)::numeric, 4) AS developer_share,
      ROUND(((plays * 2.4) / 1000.0 * 1.20 * 0.30)::numeric, 4) AS platform_share
    FROM daily_plays
  ),
  upserted AS (
    INSERT INTO public.developer_revenue (
      developer_id,
      game_id,
      date,
      impressions,
      gross_revenue,
      developer_share,
      platform_share
    )
    SELECT 
      developer_id,
      game_id,
      date,
      impressions,
      gross_revenue,
      developer_share,
      platform_share
    FROM computed
    ON CONFLICT (developer_id, game_id, date) 
    DO UPDATE SET 
      impressions = EXCLUDED.impressions,
      gross_revenue = EXCLUDED.gross_revenue,
      developer_share = EXCLUDED.developer_share,
      platform_share = EXCLUDED.platform_share,
      created_at = timezone('utc'::text, now())
    RETURNING gross_revenue, developer_share
  )
  SELECT 
    COUNT(*)::integer,
    COALESCE(SUM(gross_revenue), 0)::numeric(10,4),
    COALESCE(SUM(developer_share), 0)::numeric(10,4)
  INTO v_settled, v_gross, v_dev
  FROM upserted;

  RETURN QUERY SELECT v_settled, v_gross, v_dev;
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- 5. Stored Procedure: sync_developer_accrued_revenue
-- Bootstrap procedure: creates historical settlement rows from total_plays
-- for games that have plays but 0 historical developer_revenue records.
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_developer_accrued_revenue(p_developer_id uuid DEFAULT NULL)
RETURNS TABLE (
  synced_count integer,
  total_accrued_share numeric(10,4)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count integer := 0;
  v_share numeric(10,4) := 0;
BEGIN
  WITH unseeded_games AS (
    SELECT 
      g.developer_id,
      g.id AS game_id,
      g.total_plays AS plays
    FROM public.games g
    LEFT JOIN public.developer_revenue dr ON dr.game_id = g.id
    WHERE g.status = 'active'
      AND g.developer_id IS NOT NULL
      AND (p_developer_id IS NULL OR g.developer_id = p_developer_id)
      AND g.total_plays > 0
    GROUP BY g.developer_id, g.id, g.total_plays
    HAVING COUNT(dr.id) = 0
  ),
  computed AS (
    SELECT 
      developer_id,
      game_id,
      (CURRENT_DATE - 1) AS date,
      ROUND(plays * 2.4)::integer AS impressions,
      ROUND(((plays * 2.4) / 1000.0 * 1.20)::numeric, 4) AS gross_revenue,
      ROUND(((plays * 2.4) / 1000.0 * 1.20 * 0.70)::numeric, 4) AS developer_share,
      ROUND(((plays * 2.4) / 1000.0 * 1.20 * 0.30)::numeric, 4) AS platform_share
    FROM unseeded_games
  ),
  inserted AS (
    INSERT INTO public.developer_revenue (
      developer_id,
      game_id,
      date,
      impressions,
      gross_revenue,
      developer_share,
      platform_share
    )
    SELECT 
      developer_id,
      game_id,
      date,
      impressions,
      gross_revenue,
      developer_share,
      platform_share
    FROM computed
    ON CONFLICT (developer_id, game_id, date) 
    DO NOTHING
    RETURNING developer_share
  )
  SELECT 
    COUNT(*)::integer,
    COALESCE(SUM(developer_share), 0)::numeric(10,4)
  INTO v_count, v_share
  FROM inserted;

  RETURN QUERY SELECT v_count, v_share;
END;
$$;
