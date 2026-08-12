-- Create a table for user profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Set up Row Level Security (RLS) for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Create a table for user game data (favorites and recents)
CREATE TABLE public.user_games (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  recent_games JSONB DEFAULT '[]'::jsonb,
  favorites JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Set up RLS for user games
ALTER TABLE public.user_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own game data."
  ON public.user_games FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert their own game data."
  ON public.user_games FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own game data."
  ON public.user_games FOR UPDATE
  USING ( auth.uid() = user_id );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.email, '');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
