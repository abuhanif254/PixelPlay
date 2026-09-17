-- ============================================================================
-- Spielcade Production Schema Migration: 20260917_fix_signup_role_escalation.sql
-- Task: P0 Security Remediation #1 — Signup Privilege Escalation
-- Resolves: Hardcodes role = 'user' in public.handle_new_user(), preventing
--           untrusted client-provided metadata from setting privileged roles.
-- Hardens: Explicit search_path = public, pg_temp on SECURITY DEFINER function.
-- ============================================================================

-- 1. Redefine handle_new_user() to unconditionally assign role = 'user'
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

-- 2. Ensure trigger attachment on auth.users is idempotent and active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
