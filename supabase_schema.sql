-- PixelPlay Supabase Database Schema

-- 1. Create Profiles Table (extends auth.users)
CREATE TABLE public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  xp integer default 0,
  level integer default 1,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profile Policies
CREATE POLICY "Public profiles are viewable by everyone." 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
  ON profiles FOR UPDATE USING (auth.uid() = id);


-- 2. Create Games Table
CREATE TABLE public.games (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  description text,
  category text,
  image_url text,
  status text default 'draft' check (status in ('active', 'draft', 'maintenance')),
  rating numeric(3,2) default 5.00,
  total_plays integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Games
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Games Policies
CREATE POLICY "Active games are viewable by everyone." 
  ON games FOR SELECT USING (status = 'active' OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Only admins can insert/update games" 
  ON games FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));


-- 3. Create Scores Table
CREATE TABLE public.scores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  game_id uuid references public.games(id) on delete cascade not null,
  score integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Scores
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Scores Policies
CREATE POLICY "Scores are viewable by everyone." 
  ON scores FOR SELECT USING (true);

CREATE POLICY "Users can insert their own scores." 
  ON scores FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 4. Create Blog Posts Table
CREATE TABLE public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  content text,
  author_id uuid references public.profiles(id),
  status text default 'draft' check (status in ('published', 'draft')),
  views integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Blog Posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Blog Policies
CREATE POLICY "Published blogs are viewable by everyone." 
  ON blog_posts FOR SELECT USING (status = 'published' OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Only admins can modify blog posts" 
  ON blog_posts FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));


-- 5. Trigger to automatically create a profile when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username', 
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
