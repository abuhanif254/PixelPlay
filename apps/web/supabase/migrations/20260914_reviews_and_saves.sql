-- =====================================================
-- Spielcade Reviews & Cloud Saves Migration
-- =====================================================

-- 1. Create Game Reviews Table
CREATE TABLE IF NOT EXISTS public.game_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id uuid REFERENCES public.games(id) ON DELETE CASCADE,
  game_slug text NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
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

-- Enable RLS
ALTER TABLE public.game_reviews ENABLE ROW LEVEL SECURITY;

-- Policies for game_reviews
CREATE POLICY "Game reviews are viewable by everyone"
  ON public.game_reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON public.game_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own reviews"
  ON public.game_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- 2. Create Game Saves Table
CREATE TABLE IF NOT EXISTS public.game_saves (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  game_id text NOT NULL,
  save_data jsonb NOT NULL,
  slot integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, game_id)
);

-- Index for user game saves
CREATE INDEX IF NOT EXISTS idx_game_saves_user_game ON public.game_saves(user_id, game_id);

-- Enable RLS
ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;

-- Policies for game_saves
CREATE POLICY "Users can read own game saves"
  ON public.game_saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game saves"
  ON public.game_saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game saves"
  ON public.game_saves FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. Trigger to update games.rating on new review
CREATE OR REPLACE FUNCTION public.handle_game_review_rating()
RETURNS trigger AS $$
DECLARE
  avg_rating numeric(3,2);
BEGIN
  IF NEW.game_id IS NOT NULL THEN
    SELECT ROUND(AVG(rating)::numeric, 2) INTO avg_rating
    FROM public.game_reviews
    WHERE game_id = NEW.game_id;

    UPDATE public.games
    SET rating = COALESCE(avg_rating, 5.00)
    WHERE id = NEW.game_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_rating_change ON public.game_reviews;
CREATE TRIGGER on_review_rating_change
  AFTER INSERT OR UPDATE ON public.game_reviews
  FOR EACH ROW EXECUTE PROCEDURE public.handle_game_review_rating();
