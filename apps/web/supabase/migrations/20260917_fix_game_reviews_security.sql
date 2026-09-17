-- ============================================================================
-- Spielcade Production Schema Migration: 20260917_fix_game_reviews_security.sql
-- Task: P0 Security Remediation #2 — Anonymous Review Poisoning Prevention
-- Resolves: 
--   1. Creates public.game_reviews with mandatory NOT NULL user_id and UNIQUE(game_id, user_id).
--   2. Enforces strict RLS authentication (auth.uid() = user_id).
--   3. Adds DELETE RLS policy for user self-deletion and admin moderation.
--   4. Hardens handle_game_review_rating() trigger with search_path and 
--      adds DELETE trigger support so deleted reviews properly restore ratings.
-- ============================================================================

-- 1. Create Game Reviews Table (if not already created)
CREATE TABLE IF NOT EXISTS public.game_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id uuid REFERENCES public.games(id) ON DELETE CASCADE,
  game_slug text NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  author_name text DEFAULT 'Player',
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  helpful_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(game_id, user_id)
);

-- Index for speedy queries by game slug or game_id
CREATE INDEX IF NOT EXISTS idx_game_reviews_slug ON public.game_reviews(game_slug);
CREATE INDEX IF NOT EXISTS idx_game_reviews_game_id ON public.game_reviews(game_id);
CREATE INDEX IF NOT EXISTS idx_game_reviews_user_id ON public.game_reviews(user_id);

-- 2. Enable RLS on game_reviews (idempotent)
ALTER TABLE public.game_reviews ENABLE ROW LEVEL SECURITY;

-- 3. Ensure Public Read Access
DROP POLICY IF EXISTS "Game reviews are viewable by everyone" ON public.game_reviews;
CREATE POLICY "Game reviews are viewable by everyone"
  ON public.game_reviews FOR SELECT
  USING (true);

-- 4. Strict Authenticated Insert Policy (Eliminate Anonymous Review Insertion)
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.game_reviews;
CREATE POLICY "Authenticated users can insert reviews"
  ON public.game_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. User Self-Update Policy
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.game_reviews;
CREATE POLICY "Users can update their own reviews"
  ON public.game_reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Delete Policy (Authors can delete their own reviews; Admins can moderate any review)
DROP POLICY IF EXISTS "Users and admins can delete reviews" ON public.game_reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.game_reviews;
CREATE POLICY "Users and admins can delete reviews"
  ON public.game_reviews FOR DELETE
  USING (
    auth.uid() = user_id 
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- 7. Harden and Extend Game Rating Aggregation Trigger to Handle INSERT, UPDATE, and DELETE
CREATE OR REPLACE FUNCTION public.handle_game_review_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  target_game_id uuid;
  avg_rating numeric(3,2);
BEGIN
  -- Determine target game id depending on trigger operation
  IF TG_OP = 'DELETE' THEN
    target_game_id := OLD.game_id;
  ELSE
    target_game_id := NEW.game_id;
  END IF;

  IF target_game_id IS NOT NULL THEN
    -- Calculate average rating from active reviews for this game
    SELECT ROUND(AVG(rating)::numeric, 2) INTO avg_rating
    FROM public.game_reviews
    WHERE game_id = target_game_id;

    -- Update game rating (defaults to 5.00 if no reviews exist)
    UPDATE public.games
    SET rating = COALESCE(avg_rating, 5.00)
    WHERE id = target_game_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- 8. Re-attach Trigger to Fire on INSERT, UPDATE, AND DELETE
DROP TRIGGER IF EXISTS on_review_rating_change ON public.game_reviews;
CREATE TRIGGER on_review_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON public.game_reviews
  FOR EACH ROW EXECUTE PROCEDURE public.handle_game_review_rating();
