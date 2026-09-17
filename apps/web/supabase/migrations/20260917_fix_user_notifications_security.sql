-- Migration: 20260917_fix_user_notifications_security.sql
-- Description: Enforce least-privilege authorization on user_notifications and automate follow alerts (SEC-06).
-- Prevents unauthenticated spam injection and phishing attacks in user inboxes.

-- 1. Drop open INSERT policy on public.user_notifications
DROP POLICY IF EXISTS "Users can insert notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Authorized notification insert" ON public.user_notifications;

-- 2. Create least-privilege INSERT policy
-- Only admins can dispatch cross-account notifications (game reviews, moderation notices)
-- Authenticated users can only insert notifications for themselves (personal milestones, streaks)
CREATE POLICY "Authorized notification insert"
ON public.user_notifications
FOR INSERT
WITH CHECK (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR auth.uid() = user_id
);

-- 3. Stored Procedure & Trigger for Follow Notifications
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

-- 4. Clean up follow notification on unfollow
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
