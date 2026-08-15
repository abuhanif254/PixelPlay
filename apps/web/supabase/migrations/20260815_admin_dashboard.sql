-- =====================================================
-- PixelPlay Admin Dashboard — Database Migrations
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =====================================================

-- ─────────────────────────────────────────────
-- 1. Extend blog_posts table with missing fields
-- ─────────────────────────────────────────────
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS excerpt text,
  ADD COLUMN IF NOT EXISTS cover_image text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS read_time integer DEFAULT 5;

-- ─────────────────────────────────────────────
-- 2. Fix games table RLS for admin modifications
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Only admins can insert/update games" ON games;
CREATE POLICY "Only admins can modify games"
  ON games FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- ─────────────────────────────────────────────
-- 3. Allow admins to update any user profile
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- ─────────────────────────────────────────────
-- 4. Analytics Events Table
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL CHECK (event_type IN ('page_view', 'game_play', 'game_complete')),
  page_path text,
  game_id uuid REFERENCES public.games(id) ON DELETE SET NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
  ON analytics_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view analytics"
  ON analytics_events FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- ─────────────────────────────────────────────
-- 5. Admin Notifications Table
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('new_user', 'new_score', 'new_post', 'game_error', 'system')),
  title text NOT NULL,
  message text,
  is_read boolean DEFAULT false,
  related_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  related_game_id uuid REFERENCES public.games(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access notifications"
  ON admin_notifications FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- ─────────────────────────────────────────────
-- 6. Auto-trigger: notification for new user registrations
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user_notification()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, related_user_id)
  VALUES (
    'new_user',
    'New User Registered',
    COALESCE(NEW.username, 'A new user') || ' just created an account',
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_profile_created ON public.profiles;
CREATE TRIGGER on_new_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_notification();

-- ─────────────────────────────────────────────
-- 7. Auto-trigger: notification for personal best scores
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_high_score()
RETURNS trigger AS $$
DECLARE
  game_title text;
  uname text;
  prev_best integer;
BEGIN
  SELECT title INTO game_title FROM games WHERE id = NEW.game_id;
  SELECT p.username INTO uname FROM profiles p WHERE p.id = NEW.user_id;
  SELECT MAX(score) INTO prev_best FROM scores
    WHERE user_id = NEW.user_id AND game_id = NEW.game_id AND id != NEW.id;

  IF prev_best IS NULL OR NEW.score > prev_best THEN
    INSERT INTO public.admin_notifications (type, title, message, related_user_id, related_game_id)
    VALUES (
      'new_score',
      'New High Score!',
      COALESCE(uname, 'A player') || ' scored ' || NEW.score || ' in ' || COALESCE(game_title, 'a game'),
      NEW.user_id,
      NEW.game_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_high_score ON public.scores;
CREATE TRIGGER on_new_high_score
  AFTER INSERT ON public.scores
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_high_score();

-- ─────────────────────────────────────────────
-- 8. get_admin_stats() RPC — dashboard aggregation
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS json AS $$
DECLARE
  result json;
  week_start date := (CURRENT_DATE - INTERVAL '7 days')::date;
  prev_week_start date := (CURRENT_DATE - INTERVAL '14 days')::date;
BEGIN
  SELECT json_build_object(
    'total_users',           (SELECT COUNT(*)::int FROM profiles),
    'users_this_week',       (SELECT COUNT(*)::int FROM profiles WHERE created_at >= week_start),
    'users_prev_week',       (SELECT COUNT(*)::int FROM profiles WHERE created_at >= prev_week_start AND created_at < week_start),
    'total_games',           (SELECT COUNT(*)::int FROM games),
    'active_games',          (SELECT COUNT(*)::int FROM games WHERE status = 'active'),
    'total_scores',          (SELECT COUNT(*)::int FROM scores),
    'scores_this_week',      (SELECT COUNT(*)::int FROM scores WHERE created_at >= week_start),
    'scores_prev_week',      (SELECT COUNT(*)::int FROM scores WHERE created_at >= prev_week_start AND created_at < week_start),
    'total_posts',           (SELECT COUNT(*)::int FROM blog_posts),
    'published_posts',       (SELECT COUNT(*)::int FROM blog_posts WHERE status = 'published'),
    'posts_this_week',       (SELECT COUNT(*)::int FROM blog_posts WHERE created_at >= week_start),
    'unread_notifications',  (SELECT COUNT(*)::int FROM admin_notifications WHERE is_read = false)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────
-- 9. get_traffic_data() RPC — analytics chart data
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_traffic_data(days_back integer DEFAULT 7)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'date', day::date,
      'views', COALESCE(pv.cnt, 0),
      'plays', COALESCE(gp.cnt, 0)
    ) ORDER BY day
  ) INTO result
  FROM generate_series(
    CURRENT_DATE - (days_back - 1) * INTERVAL '1 day',
    CURRENT_DATE,
    INTERVAL '1 day'
  ) AS day
  LEFT JOIN (
    SELECT DATE(created_at) as d, COUNT(*)::int as cnt
    FROM analytics_events WHERE event_type = 'page_view'
      AND created_at >= CURRENT_DATE - days_back * INTERVAL '1 day'
    GROUP BY DATE(created_at)
  ) pv ON pv.d = day::date
  LEFT JOIN (
    SELECT DATE(created_at) as d, COUNT(*)::int as cnt
    FROM analytics_events WHERE event_type = 'game_play'
      AND created_at >= CURRENT_DATE - days_back * INTERVAL '1 day'
    GROUP BY DATE(created_at)
  ) gp ON gp.d = day::date;

  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
