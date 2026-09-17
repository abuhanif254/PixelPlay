-- =====================================================================
-- Migration: 20260917_fix_gaming_integrity_anti_cheat.sql
-- Priority: P0 Critical / Gaming Integrity, Leaderboard & Anti-Cheat
-- Description:
--   1. Adds score value range constraints (0 to 10,000,000) on public.scores
--   2. Enforces active game status verification at the database level
--   3. Enforces a 2-second rate-limit cooldown per (user_id, game_id)
--      via a BEFORE INSERT database trigger to block direct PostgREST exploit bypasses
--   4. Adds compound indexes for high-speed leaderboard and cooldown queries
-- =====================================================================

-- 1. Ensure any legacy invalid scores are cleaned up or clamped before constraint
UPDATE public.scores
SET score = 0
WHERE score < 0;

UPDATE public.scores
SET score = 10000000
WHERE score > 10000000;

-- 2. Add score range check constraint
ALTER TABLE public.scores
DROP CONSTRAINT IF EXISTS chk_scores_range;

ALTER TABLE public.scores
ADD CONSTRAINT chk_scores_range
CHECK (score >= 0 AND score <= 10000000);

-- 3. Create high-performance indexes for leaderboard sorting and rate-limit lookups
CREATE INDEX IF NOT EXISTS idx_scores_user_game_created
ON public.scores (user_id, game_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scores_game_score
ON public.scores (game_id, score DESC);

-- 4. Create trigger function to enforce game status and anti-cheat rate-limiting
CREATE OR REPLACE FUNCTION public.validate_score_submission()
RETURNS TRIGGER AS $$
DECLARE
  v_game_status text;
  v_last_time timestamptz;
BEGIN
  -- Range sanity check (redundant with constraint, but provides clear error)
  IF NEW.score < 0 OR NEW.score > 10000000 THEN
    RAISE EXCEPTION 'Gaming Integrity Violation: Score must be between 0 and 10,000,000 (received: %)', NEW.score;
  END IF;

  -- Verify target game exists and is currently active
  SELECT status INTO v_game_status
  FROM public.games
  WHERE id = NEW.game_id;

  IF v_game_status IS NULL THEN
    RAISE EXCEPTION 'Gaming Integrity Violation: Referenced game does not exist';
  END IF;

  IF v_game_status != 'active' THEN
    RAISE EXCEPTION 'Gaming Integrity Violation: Scores can only be submitted for active games (game status: %)', v_game_status;
  END IF;

  -- Anti-bot / Anti-spam cooldown: Check most recent score for this user & game
  SELECT created_at INTO v_last_time
  FROM public.scores
  WHERE user_id = NEW.user_id AND game_id = NEW.game_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_last_time IS NOT NULL AND (now() - v_last_time) < INTERVAL '2 seconds' THEN
    RAISE EXCEPTION 'Rate Limit Exceeded: Score submissions must be at least 2 seconds apart';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach BEFORE INSERT trigger to public.scores
DROP TRIGGER IF EXISTS trg_validate_score_submission ON public.scores;
CREATE TRIGGER trg_validate_score_submission
  BEFORE INSERT ON public.scores
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_score_submission();
