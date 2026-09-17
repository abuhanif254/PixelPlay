-- Migration: 20260917_fix_developer_payout_security.sql
-- Description: Isolate developer payout profiles into a dedicated secure table with strict RLS (SEC-04).
-- Prevents plaintext storage of banking/payout details in contact_messages.

-- 1. Create dedicated developer_payout_profiles table
CREATE TABLE IF NOT EXISTS public.developer_payout_profiles (
    developer_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    payout_method TEXT NOT NULL CHECK (payout_method IN ('paypal', 'stripe', 'wire')),
    payout_account TEXT NOT NULL,
    tax_certified BOOLEAN NOT NULL DEFAULT false,
    tax_certified_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'verified' CHECK (status IN ('pending', 'verified', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.developer_payout_profiles ENABLE ROW LEVEL SECURITY;

-- 3. SELECT Policy: Developers can read own profile; Admins can read all profiles
DROP POLICY IF EXISTS "Developers and admins can view payout profiles" ON public.developer_payout_profiles;
CREATE POLICY "Developers and admins can view payout profiles"
ON public.developer_payout_profiles
FOR SELECT
USING (
    auth.uid() = developer_id 
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- 4. INSERT Policy: Developers can insert their own payout profile
DROP POLICY IF EXISTS "Developers can insert own payout profile" ON public.developer_payout_profiles;
CREATE POLICY "Developers can insert own payout profile"
ON public.developer_payout_profiles
FOR INSERT
WITH CHECK (
    auth.uid() = developer_id
    AND auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('developer', 'admin'))
);

-- 5. UPDATE Policy: Developers can update their own profile; Admins can update any
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

-- 6. DELETE Policy: Only admins can delete payout profiles
DROP POLICY IF EXISTS "Only admins can delete payout profiles" ON public.developer_payout_profiles;
CREATE POLICY "Only admins can delete payout profiles"
ON public.developer_payout_profiles
FOR DELETE
USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- 7. Trigger to automatically update updated_at on record changes
CREATE OR REPLACE FUNCTION public.handle_payout_profile_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_developer_payout_profiles_updated_at ON public.developer_payout_profiles;
CREATE TRIGGER trg_developer_payout_profiles_updated_at
    BEFORE UPDATE ON public.developer_payout_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_payout_profile_updated_at();

-- 8. Purge legacy sensitive banking records from public.contact_messages
DELETE FROM public.contact_messages 
WHERE subject LIKE '[Payout Settings]%';
