-- =====================================================
-- Spielcade Achievements & Progression System Migration
-- =====================================================

-- 1. Create Achievements Table
CREATE TABLE IF NOT EXISTS public.achievements (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  gradient text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('novice', 'adept', 'master', 'grandmaster', 'secret')),
  condition_type text NOT NULL CHECK (condition_type IN ('games_played', 'total_score', 'single_score', 'streak', 'level', 'review', 'challenge')),
  condition_value integer NOT NULL,
  xp_reward integer NOT NULL DEFAULT 100,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for speedy queries
CREATE INDEX IF NOT EXISTS idx_achievements_tier ON public.achievements(tier);
CREATE INDEX IF NOT EXISTS idx_achievements_condition_type ON public.achievements(condition_type);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Everyone can read achievements
CREATE POLICY "Achievements are viewable by everyone"
  ON public.achievements FOR SELECT USING (true);

-- Only admins can modify achievements
CREATE POLICY "Admins can modify achievements"
  ON public.achievements FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- 2. Create User Achievements (Earned Badges) Table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id text REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, achievement_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON public.user_achievements(achievement_id);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for user_achievements
CREATE POLICY "User achievements are viewable by everyone"
  ON public.user_achievements FOR SELECT USING (true);

CREATE POLICY "System and users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Pre-seed Core Platform Achievements
INSERT INTO public.achievements (id, slug, title, description, icon, gradient, tier, condition_type, condition_value, xp_reward)
VALUES
  ('first-blood', 'first-blood', 'First Blood', 'Play your very first game on Spielcade', '🎮', 'from-emerald-500 to-teal-600', 'novice', 'games_played', 1, 50),
  ('century-club', 'century-club', 'Century Club', 'Score 100 points or more in any single game session', '⚡', 'from-blue-500 to-indigo-600', 'novice', 'single_score', 100, 100),
  ('game-explorer', 'game-explorer', 'Game Explorer', 'Play 5 different games from the Spielcade catalog', '🗺️', 'from-sky-500 to-cyan-600', 'novice', 'games_played', 5, 150),
  ('high-roller', 'high-roller', 'High Roller', 'Reach a score of 1,000 points in any game', '🎲', 'from-amber-500 to-yellow-600', 'adept', 'single_score', 1000, 250),
  ('level-up', 'level-up', 'Rising Star', 'Reach Player Level 5 through continuous gaming and achievements', '⭐', 'from-purple-500 to-indigo-600', 'adept', 'level', 5, 300),
  ('streak-starter', 'streak-starter', 'Streak Starter', 'Maintain a consecutive 3-day daily gaming streak', '🔥', 'from-orange-500 to-red-600', 'adept', 'streak', 3, 200),
  ('arcade-legend', 'arcade-legend', 'Arcade Legend', 'Score an epic 10,000 points in any arcade title', '🏆', 'from-amber-400 to-rose-600', 'master', 'single_score', 10000, 500),
  ('library-master', 'library-master', 'Library Master', 'Play 20 unique games across multiple genres', '📚', 'from-violet-500 to-purple-700', 'master', 'games_played', 20, 400),
  ('unstoppable', 'unstoppable', 'Unstoppable Gamer', 'Keep an active 7-day daily streak without missing a day', '🚀', 'from-rose-500 to-pink-600', 'master', 'streak', 7, 500),
  ('elite-veteran', 'elite-veteran', 'Elite Veteran', 'Reach Player Level 10 and join the top tier of Spielcade gamers', '👑', 'from-yellow-400 via-amber-500 to-orange-600', 'grandmaster', 'level', 10, 750),
  ('critic-choice', 'critic-choice', 'Critic''s Eye', 'Write your first community review helping fellow players', '✍️', 'from-fuchsia-500 to-pink-600', 'novice', 'review', 1, 100),
  ('friendly-rival', 'friendly-rival', 'Rivalry Ignited', 'Send a score challenge to a friend or rival', '⚔️', 'from-indigo-600 via-purple-600 to-pink-500', 'adept', 'challenge', 1, 150)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  gradient = EXCLUDED.gradient,
  tier = EXCLUDED.tier,
  condition_type = EXCLUDED.condition_type,
  condition_value = EXCLUDED.condition_value,
  xp_reward = EXCLUDED.xp_reward;
