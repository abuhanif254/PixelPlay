-- 20260918_anti_cheat_ad_impressions.sql
-- RFC-AD-001 / RFC-BEACON-001: Anti-Cheat Ad Impression Verification & Real-Time Beacon Analytics

-- 1. Create Verified Ad Impressions Table
CREATE TABLE IF NOT EXISTS public.ad_impressions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id uuid REFERENCES public.games(id) ON DELETE SET NULL,
  slot_id text NOT NULL,
  session_id text,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  nonce text UNIQUE NOT NULL,
  viewability_ms integer NOT NULL CHECK (viewability_ms >= 1000),
  verified boolean DEFAULT true NOT NULL,
  ip_hash text,
  user_agent text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;

-- 3. RLS Security Policies
DROP POLICY IF EXISTS "Admins can view ad impressions" ON public.ad_impressions;
CREATE POLICY "Admins can view ad impressions"
  ON public.ad_impressions FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

DROP POLICY IF EXISTS "Service role can insert ad impressions" ON public.ad_impressions;
CREATE POLICY "Service role can insert ad impressions"
  ON public.ad_impressions FOR INSERT
  WITH CHECK (true);

-- 4. High-Performance B-Tree & Anti-Replay Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_ad_impressions_nonce 
ON public.ad_impressions(nonce);

CREATE INDEX IF NOT EXISTS idx_ad_impressions_game_date 
ON public.ad_impressions(game_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ad_impressions_slot_date 
ON public.ad_impressions(slot_id, created_at DESC);

-- 5. Stored Procedure: record_verified_ad_impression
-- Atomic check-and-set preventing replay attacks and enforcing viewability bounds
CREATE OR REPLACE FUNCTION public.record_verified_ad_impression(
  p_game_id uuid DEFAULT NULL,
  p_slot_id text DEFAULT '',
  p_session_id text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL,
  p_nonce text DEFAULT '',
  p_viewability_ms integer DEFAULT 1000,
  p_ip_hash text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing_id uuid;
  v_new_id uuid;
BEGIN
  -- 1. Validate clean input parameters
  IF p_nonce IS NULL OR length(trim(p_nonce)) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Missing anti-replay nonce token.');
  END IF;

  IF p_viewability_ms < 1000 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Viewability duration too short. Minimum 1000ms required.');
  END IF;

  -- 2. Replay check: check if nonce has already been claimed
  SELECT id INTO v_existing_id
  FROM public.ad_impressions
  WHERE nonce = trim(p_nonce);

  IF v_existing_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'replay_detected', true,
      'error', 'Replay detected: this impression nonce has already been claimed.'
    );
  END IF;

  -- 3. Atomic Insertion
  INSERT INTO public.ad_impressions (
    game_id,
    slot_id,
    session_id,
    user_id,
    nonce,
    viewability_ms,
    verified,
    ip_hash,
    user_agent,
    created_at
  ) VALUES (
    p_game_id,
    trim(p_slot_id),
    p_session_id,
    p_user_id,
    trim(p_nonce),
    p_viewability_ms,
    true,
    p_ip_hash,
    p_user_agent,
    timezone('utc'::text, now())
  )
  RETURNING id INTO v_new_id;

  RETURN jsonb_build_object(
    'success', true,
    'impression_id', v_new_id,
    'replay_detected', false,
    'verified', true
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'replay_detected', true,
      'error', 'Replay detected: duplicate nonce constraint violated.'
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- 6. Grant Execution Permissions
GRANT EXECUTE ON FUNCTION public.record_verified_ad_impression(uuid, text, text, uuid, text, integer, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.record_verified_ad_impression(uuid, text, text, uuid, text, integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_verified_ad_impression(uuid, text, text, uuid, text, integer, text, text) TO service_role;
