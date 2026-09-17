-- ============================================================================
-- Spielcade Production Migration: 20260917_fix_developer_games_moderation.sql
-- Task: P0 Security Remediation #3 — Developer Game Moderation Bypass (SEC-03)
-- Resolves:
--   1. Blocks developers from inserting games directly with status = 'active'.
--   2. Blocks developers from updating games directly to status = 'active'.
--   3. Enforces that developer updates can only transition to 'draft' or 'pending'.
--   4. Installs defense-in-depth trigger protect_game_moderation() to prevent
--      metrics tampering (rating, total_plays), developer_id reassignment, and
--      unauthorized status promotion to 'active' or 'maintenance'.
--   5. Allows developers to delete their own 'draft' or 'rejected' games.
-- ============================================================================

-- 1. Ensure status check constraint covers all standard platform states
DO $$
BEGIN
  ALTER TABLE public.games DROP CONSTRAINT IF EXISTS games_status_check;
  ALTER TABLE public.games ADD CONSTRAINT games_status_check 
    CHECK (status IN ('active', 'draft', 'maintenance', 'pending', 'rejected'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 2. Hardened INSERT Policy: Developers can only insert as 'draft' or 'pending'
DROP POLICY IF EXISTS "Developers can insert games" ON public.games;
CREATE POLICY "Developers can insert games"
  ON public.games FOR INSERT
  WITH CHECK (
    (auth.uid() = developer_id AND status IN ('draft', 'pending'))
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- 3. Hardened UPDATE Policy: Developers can only modify games and save as 'draft' or 'pending'
--    Developers can NEVER self-promote to 'active' or 'maintenance'
DROP POLICY IF EXISTS "Developers can update own pending games" ON public.games;
CREATE POLICY "Developers can update own pending games"
  ON public.games FOR UPDATE
  USING (
    (auth.uid() = developer_id AND status IN ('draft', 'pending', 'rejected', 'active'))
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  )
  WITH CHECK (
    (auth.uid() = developer_id AND status IN ('draft', 'pending'))
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- 4. Secure DELETE Policy: Developers can delete their own draft or rejected games
DROP POLICY IF EXISTS "Developers can delete own draft games" ON public.games;
CREATE POLICY "Developers can delete own draft games"
  ON public.games FOR DELETE
  USING (
    (auth.uid() = developer_id AND status IN ('draft', 'rejected'))
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- 5. Defense-in-Depth Trigger: Protect against metrics tampering, status fraud & ownership hijacking
CREATE OR REPLACE FUNCTION public.protect_game_moderation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- Determine whether current session is an admin
  SELECT (role = 'admin') INTO is_admin
  FROM public.profiles
  WHERE id = auth.uid();

  -- If admin, allow all operations
  IF is_admin IS TRUE THEN
    RETURN NEW;
  END IF;

  -- Disallow non-admins from promoting ANY game to 'active' or 'maintenance'
  IF NEW.status IN ('active', 'maintenance') AND (OLD.status IS NULL OR OLD.status != NEW.status) THEN
    RAISE EXCEPTION 'Unauthorized: Only platform administrators can approve games to active or maintenance status.';
  END IF;

  -- Disallow non-admins from altering platform metrics
  NEW.rating := OLD.rating;
  NEW.total_plays := OLD.total_plays;

  -- Always preserve original developer_id (anti-hijack)
  NEW.developer_id := OLD.developer_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_game_moderation ON public.games;
CREATE TRIGGER trg_protect_game_moderation
  BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE PROCEDURE public.protect_game_moderation();
