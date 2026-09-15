-- ============================================================================
-- Spielcade Complete Production Schema Remediation Migration
-- Safe, Idempotent Migration for All Missing Tables, Columns, RPCs & Security
-- ============================================================================

-- ─────────────────────────────────────────────
-- 1. Extend profiles Table with Missing Operational Columns
-- ─────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ban_reason text,
  ADD COLUMN IF NOT EXISTS bio text DEFAULT '',
  ADD COLUMN IF NOT EXISTS banner_url text,
  ADD COLUMN IF NOT EXISTS streak integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_played_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS favorite_game_ids jsonb DEFAULT '[]'::jsonb;

-- ─────────────────────────────────────────────
-- 2. Security Fix: Prevent Non-Admins From Self-Escalating to 'admin'
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger AS $$
BEGIN
  IF NEW.role != OLD.role AND (auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )) THEN
    NEW.role = OLD.role;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.protect_profile_role();

-- ─────────────────────────────────────────────
-- 3. Extend games Table: Add developer_id, metadata & Expand Status Check
-- ─────────────────────────────────────────────
ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS developer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Drop old check constraint if it exists and replace with expanded one
DO $$
BEGIN
  ALTER TABLE public.games DROP CONSTRAINT IF EXISTS games_status_check;
  ALTER TABLE public.games ADD CONSTRAINT games_status_check 
    CHECK (status IN ('active', 'draft', 'maintenance', 'pending', 'rejected'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- RLS: Allow Developers to Submit & Update Games
DROP POLICY IF EXISTS "Developers can insert games" ON public.games;
CREATE POLICY "Developers can insert games"
  ON public.games FOR INSERT
  WITH CHECK (auth.uid() = developer_id OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Developers can update own pending games" ON public.games;
CREATE POLICY "Developers can update own pending games"
  ON public.games FOR UPDATE
  USING (auth.uid() = developer_id OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- ─────────────────────────────────────────────
-- 4. Create site_config Table
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_config (
  config_key text PRIMARY KEY,
  config_value text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site_config" ON public.site_config;
CREATE POLICY "Public read site_config" ON public.site_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write site_config" ON public.site_config;
CREATE POLICY "Admin write site_config" ON public.site_config FOR ALL 
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Seed maintenance mode default
INSERT INTO public.site_config (config_key, config_value)
VALUES ('maintenance_mode', 'false')
ON CONFLICT (config_key) DO NOTHING;

-- ─────────────────────────────────────────────
-- 5. Create contact_messages Table
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert contact message" ON public.contact_messages;
CREATE POLICY "Anyone can insert contact message" ON public.contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
CREATE POLICY "Admins can view contact messages" ON public.contact_messages FOR SELECT 
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- ─────────────────────────────────────────────
-- 6. Create newsletter_subscribers Table
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can view newsletter subscribers" ON public.newsletter_subscribers FOR SELECT 
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- ─────────────────────────────────────────────
-- 7. Create blog_likes and blog_comments Tables
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.blog_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id)
);
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read blog likes" ON public.blog_likes;
CREATE POLICY "Anyone can read blog likes" ON public.blog_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own blog likes" ON public.blog_likes;
CREATE POLICY "Users can manage own blog likes" ON public.blog_likes FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.blog_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.blog_posts(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read blog comments" ON public.blog_comments;
CREATE POLICY "Anyone can read blog comments" ON public.blog_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert blog comments" ON public.blog_comments;
CREATE POLICY "Users can insert blog comments" ON public.blog_comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- ─────────────────────────────────────────────
-- 8. Create user_notifications Table
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own notifications" ON public.user_notifications;
CREATE POLICY "Users can manage own notifications" ON public.user_notifications FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert notifications" ON public.user_notifications;
CREATE POLICY "Users can insert notifications" ON public.user_notifications FOR INSERT WITH CHECK (true);

-- ─────────────────────────────────────────────
-- 9. Create user_follows Table
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_follows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(follower_id, following_id)
);
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view follows" ON public.user_follows;
CREATE POLICY "Anyone can view follows" ON public.user_follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own follows" ON public.user_follows;
CREATE POLICY "Users can manage own follows" ON public.user_follows FOR ALL USING (auth.uid() = follower_id);

-- ─────────────────────────────────────────────
-- 10. Create api_keys Table
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  key_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Developers can manage own api keys" ON public.api_keys;
CREATE POLICY "Developers can manage own api keys" ON public.api_keys FOR ALL USING (auth.uid() = developer_id);

-- ─────────────────────────────────────────────
-- 11. Create developer_revenue Table
-- ─────────────────────────────────────────────
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

DROP POLICY IF EXISTS "Developers can read own revenue" ON public.developer_revenue;
CREATE POLICY "Developers can read own revenue" ON public.developer_revenue FOR SELECT USING (auth.uid() = developer_id);

-- ─────────────────────────────────────────────
-- 12. Create Missing RPC Functions
-- ─────────────────────────────────────────────

-- A. increment_blog_views
CREATE OR REPLACE FUNCTION public.increment_blog_views(post_id uuid)
RETURNS void AS $$
BEGIN
  BEGIN
    UPDATE public.blog_posts
    SET views = COALESCE(views, 0) + 1
    WHERE id = post_id;
  EXCEPTION WHEN undefined_column THEN
    NULL;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B. increment_review_helpful
CREATE OR REPLACE FUNCTION public.increment_review_helpful(review_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.game_reviews
  SET helpful_count = COALESCE(helpful_count, 0) + 1
  WHERE id = review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- C. check_and_award_achievements
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_distinct_games integer;
  v_max_score integer;
  v_level integer;
  v_streak integer;
  r RECORD;
BEGIN
  SELECT COUNT(DISTINCT game_id), COALESCE(MAX(score), 0)
  INTO v_distinct_games, v_max_score
  FROM public.scores
  WHERE user_id = p_user_id;

  SELECT COALESCE(level, 1), COALESCE(streak, 0)
  INTO v_level, v_streak
  FROM public.profiles
  WHERE id = p_user_id;

  FOR r IN 
    SELECT a.id, a.condition_type, a.condition_value
    FROM public.achievements a
    LEFT JOIN public.user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = p_user_id
    WHERE ua.id IS NULL
  LOOP
    IF (r.condition_type = 'games_played' AND v_distinct_games >= r.condition_value) OR
       (r.condition_type = 'single_score' AND v_max_score >= r.condition_value) OR
       (r.condition_type = 'level' AND v_level >= r.condition_value) OR
       (r.condition_type = 'streak' AND v_streak >= r.condition_value) THEN
      INSERT INTO public.user_achievements (user_id, achievement_id)
      VALUES (p_user_id, r.id)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
