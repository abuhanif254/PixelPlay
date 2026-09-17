-- ============================================================================
-- Spielcade Master Supabase Database Schema
-- Complete, Idempotent Definition of All Platform Tables, Views, RLS & Functions
-- ============================================================================

-- 1. Create Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  bio text DEFAULT '',
  banner_url text,
  xp integer DEFAULT 0,
  level integer DEFAULT 1,
  streak integer DEFAULT 0,
  last_played_at timestamp with time zone,
  favorite_game_ids jsonb DEFAULT '[]'::jsonb,
  is_banned boolean DEFAULT false,
  ban_reason text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger: Prevent Non-Admins From Self-Escalating to 'admin'
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


-- 2. Create Games Table
CREATE TABLE IF NOT EXISTS public.games (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  category text,
  image_url text,
  source_url text,
  developer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'maintenance', 'pending', 'rejected')),
  rating numeric(3,2) DEFAULT 5.00,
  total_plays integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Games
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active games are viewable by everyone." ON public.games;
CREATE POLICY "Active games are viewable by everyone." 
  ON public.games FOR SELECT USING (status = 'active' OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Only admins can modify games" ON public.games;
CREATE POLICY "Only admins can modify games" 
  ON public.games FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Developers can insert games" ON public.games;
CREATE POLICY "Developers can insert games"
  ON public.games FOR INSERT
  WITH CHECK (
    (auth.uid() = developer_id AND status IN ('draft', 'pending'))
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

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

DROP POLICY IF EXISTS "Developers can delete own draft games" ON public.games;
CREATE POLICY "Developers can delete own draft games"
  ON public.games FOR DELETE
  USING (
    (auth.uid() = developer_id AND status IN ('draft', 'rejected'))
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- Defense-in-Depth Trigger: Protect against metrics tampering, status fraud & ownership hijacking
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


-- 3. Create Scores Table
CREATE TABLE IF NOT EXISTS public.scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  game_id uuid REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL CONSTRAINT chk_scores_range CHECK (score >= 0 AND score <= 10000000),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Scores are viewable by everyone." ON public.scores;
CREATE POLICY "Scores are viewable by everyone." 
  ON public.scores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own scores." ON public.scores;
CREATE POLICY "Users can insert their own scores." 
  ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_scores_user_game_created
  ON public.scores (user_id, game_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scores_game_score
  ON public.scores (game_id, score DESC);

-- Anti-Cheat Score Validation & Rate-Limit Trigger
CREATE OR REPLACE FUNCTION public.validate_score_submission()
RETURNS TRIGGER AS $$
DECLARE
  v_game_status text;
  v_last_time timestamptz;
BEGIN
  IF NEW.score < 0 OR NEW.score > 10000000 THEN
    RAISE EXCEPTION 'Gaming Integrity Violation: Score must be between 0 and 10,000,000 (received: %)', NEW.score;
  END IF;

  SELECT status INTO v_game_status
  FROM public.games
  WHERE id = NEW.game_id;

  IF v_game_status IS NULL THEN
    RAISE EXCEPTION 'Gaming Integrity Violation: Referenced game does not exist';
  END IF;

  IF v_game_status != 'active' THEN
    RAISE EXCEPTION 'Gaming Integrity Violation: Scores can only be submitted for active games (game status: %)', v_game_status;
  END IF;

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

DROP TRIGGER IF EXISTS trg_validate_score_submission ON public.scores;
CREATE TRIGGER trg_validate_score_submission
  BEFORE INSERT ON public.scores
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_score_submission();


-- 4. Create Blog Posts Table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  content text,
  excerpt text,
  cover_image text,
  tags text[] DEFAULT '{}',
  read_time integer DEFAULT 5,
  author_id uuid REFERENCES public.profiles(id),
  status text DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  views integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published blogs are viewable by everyone." ON public.blog_posts;
CREATE POLICY "Published blogs are viewable by everyone." 
  ON public.blog_posts FOR SELECT USING (status = 'published' OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Only admins can modify blog posts" ON public.blog_posts;
CREATE POLICY "Only admins can modify blog posts" 
  ON public.blog_posts FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));


-- 5. Create Site Config Table
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


-- 6. Create Contact Messages Table
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


-- 7. Create Newsletter Subscribers Table
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


-- 8. Create Blog Likes & Comments Tables
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


-- 9. Create User Notifications Table
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
DROP POLICY IF EXISTS "Authorized notification insert" ON public.user_notifications;
CREATE POLICY "Authorized notification insert" ON public.user_notifications FOR INSERT 
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR auth.uid() = user_id
  );


-- 10. Create User Follows Table
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

CREATE OR REPLACE FUNCTION public.handle_user_follow_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_follower_username text;
BEGIN
  SELECT username INTO v_follower_username
  FROM public.profiles
  WHERE id = NEW.follower_id;

  INSERT INTO public.user_notifications (user_id, type, message, link)
  VALUES (
    NEW.following_id,
    'follower',
    '@' || COALESCE(v_follower_username, 'Someone') || ' started following you!',
    '/profile/' || COALESCE(v_follower_username, '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_user_follow ON public.user_follows;
CREATE TRIGGER trg_on_user_follow
  AFTER INSERT ON public.user_follows
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_follow_notification();

CREATE OR REPLACE FUNCTION public.handle_user_unfollow_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_follower_username text;
BEGIN
  SELECT username INTO v_follower_username
  FROM public.profiles
  WHERE id = OLD.follower_id;

  DELETE FROM public.user_notifications
  WHERE user_id = OLD.following_id
    AND type = 'follower'
    AND link = '/profile/' || COALESCE(v_follower_username, '');
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_user_unfollow ON public.user_follows;
CREATE TRIGGER trg_on_user_unfollow
  AFTER DELETE ON public.user_follows
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_unfollow_notification();



-- 11. Create API Keys Table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  key_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Developers can manage own api keys" ON public.api_keys;
CREATE POLICY "Developers can manage own api keys" ON public.api_keys FOR ALL USING (auth.uid() = developer_id);


-- 12. Create Developer Revenue Table
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


-- 12b. Create Developer Payout Profiles Table (SEC-04)
CREATE TABLE IF NOT EXISTS public.developer_payout_profiles (
  developer_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  payout_method text NOT NULL CHECK (payout_method IN ('paypal', 'stripe', 'wire')),
  payout_account text NOT NULL,
  tax_certified boolean NOT NULL DEFAULT false,
  tax_certified_at timestamp with time zone,
  status text NOT NULL DEFAULT 'verified' CHECK (status IN ('pending', 'verified', 'suspended')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.developer_payout_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Developers and admins can view payout profiles" ON public.developer_payout_profiles;
CREATE POLICY "Developers and admins can view payout profiles"
ON public.developer_payout_profiles
FOR SELECT
USING (
  auth.uid() = developer_id 
  OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

DROP POLICY IF EXISTS "Developers can insert own payout profile" ON public.developer_payout_profiles;
CREATE POLICY "Developers can insert own payout profile"
ON public.developer_payout_profiles
FOR INSERT
WITH CHECK (
  auth.uid() = developer_id
  AND auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('developer', 'admin'))
);

DROP POLICY IF EXISTS "Developers and admins can update payout profile" ON public.developer_payout_profiles;
CREATE POLICY "Developers and admins can update payout profile"
ON public.developer_payout_profiles
FOR UPDATE
USING (
  auth.uid() = developer_id 
  OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
)
WITH CHECK (
  auth.uid() = developer_id 
  OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

DROP POLICY IF EXISTS "Only admins can delete payout profiles" ON public.developer_payout_profiles;
CREATE POLICY "Only admins can delete payout profiles"
ON public.developer_payout_profiles
FOR DELETE
USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

CREATE OR REPLACE FUNCTION public.handle_payout_profile_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_developer_payout_profiles_updated_at ON public.developer_payout_profiles;
CREATE TRIGGER trg_developer_payout_profiles_updated_at
  BEFORE UPDATE ON public.developer_payout_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_payout_profile_updated_at();


-- 13. Stored Procedures & RPC Functions
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

CREATE OR REPLACE FUNCTION public.increment_review_helpful(review_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.game_reviews
  SET helpful_count = COALESCE(helpful_count, 0) + 1
  WHERE id = review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- 14. Trigger to automatically create a profile when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    avatar_url,
    role
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', new.email),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    'user'
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- 15. Developer Revenue Settlement & Master API Key Subsystem (RFC-DEV-001)
-- ============================================================================
ALTER TABLE public.api_keys 
  ADD COLUMN IF NOT EXISTS name text DEFAULT 'Master API Key',
  ADD COLUMN IF NOT EXISTS last_used_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_developer_id ON public.api_keys(developer_id);

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

-- Ensure all columns exist even if developer_revenue was pre-created in earlier schemas
ALTER TABLE public.developer_revenue 
  ADD COLUMN IF NOT EXISTS game_id uuid REFERENCES public.games(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS impressions integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gross_revenue numeric(10,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS developer_share numeric(10,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_share numeric(10,4) DEFAULT 0;

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
    NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_developer_revenue_dev_date ON public.developer_revenue(developer_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_developer_revenue_game_date ON public.developer_revenue(game_id, date DESC);

DROP POLICY IF EXISTS "Developers can read own revenue" ON public.developer_revenue;
CREATE POLICY "Developers can read own revenue" 
  ON public.developer_revenue FOR SELECT 
  USING (auth.uid() = developer_id OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

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
  UPDATE public.api_keys
  SET last_used_at = timezone('utc'::text, now())
  WHERE key_hash = p_key_hash
  RETURNING id INTO v_key_id;

  IF v_key_id IS NULL THEN
    RETURN;
  END IF;

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

-- ==============================================================================
-- 17. RFC-SEARCH-001: Hybrid Full-Text & Trigram Fuzzy Search Engine Optimization
-- ==============================================================================

-- Enable Trigram Extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add Document Vector Column
ALTER TABLE public.games 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Document Vector Trigger Function
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

-- Trigger for Games Search Vector
DROP TRIGGER IF EXISTS trg_games_search_vector ON public.games;
CREATE TRIGGER trg_games_search_vector
  BEFORE INSERT OR UPDATE OF title, slug, category, description, metadata
  ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION public.games_search_vector_trigger();

-- GIN Performance Indexes for Full-Text and Trigrams
CREATE INDEX IF NOT EXISTS idx_games_search_vector 
ON public.games USING gin (search_vector);

CREATE INDEX IF NOT EXISTS idx_games_title_trgm 
ON public.games USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_games_slug_trgm 
ON public.games USING gin (slug gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_games_category_trgm 
ON public.games USING gin (category gin_trgm_ops);

-- High-Performance Hybrid Stored Procedure
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

  -- Build safe tsquery via websearch_to_tsquery
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
      (CASE WHEN lower(g.title) = lower(clean_q) THEN 12.0 ELSE 0.0 END) +
      (CASE WHEN lower(g.slug) = lower(clean_q) THEN 10.0 ELSE 0.0 END) +
      (CASE WHEN lower(g.title) LIKE (lower(clean_q) || '%') THEN 6.0 ELSE 0.0 END) +
      (CASE WHEN lower(g.title) LIKE ('%' || lower(clean_q) || '%') THEN 3.0 ELSE 0.0 END) +
      (coalesce(similarity(g.title, clean_q), 0.0) * 5.0) +
      (coalesce(word_similarity(clean_q, g.title), 0.0) * 4.0) +
      (CASE WHEN ts_q IS NOT NULL AND g.search_vector @@ ts_q THEN coalesce(ts_rank_cd(g.search_vector, ts_q, 32), 0.0) * 4.0 ELSE 0.0 END)
    ) * (1.0 + ln(greatest(coalesce(g.total_plays, 0), 1) + 1.0) * 0.08)::real AS relevance
  FROM public.games g
  WHERE g.status = 'active'
    AND (NOT has_cat OR g.category ILIKE ('%' || trim(category_filter) || '%'))
    AND (
      (ts_q IS NOT NULL AND g.search_vector @@ ts_q)
      OR lower(g.title) LIKE ('%' || lower(clean_q) || '%')
      OR lower(g.slug) LIKE ('%' || lower(clean_q) || '%')
      OR lower(g.category) LIKE ('%' || lower(clean_q) || '%')
      OR similarity(g.title, clean_q) >= similarity_threshold
      OR word_similarity(clean_q, g.title) >= 0.35
    )
  ORDER BY relevance DESC, g.total_plays DESC NULLS LAST
  LIMIT limit_val;
END;
$$;

-- Grant Execution Permissions
GRANT EXECUTE ON FUNCTION public.search_games(text, text, int, real) TO anon;
GRANT EXECUTE ON FUNCTION public.search_games(text, text, int, real) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_games(text, text, int, real) TO service_role;


