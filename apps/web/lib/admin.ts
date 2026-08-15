import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Server-side helper that verifies the current user is an admin.
 * Call this at the top of any admin Server Component or Server Action.
 * Returns the user object if authorized, otherwise redirects to login.
 */
export async function requireAdmin() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username, full_name, avatar_url')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/?error=unauthorized');
  }

  return { user, profile };
}

/**
 * Server action version of admin check (returns error instead of redirecting).
 * Use inside server actions where redirect() may not be appropriate.
 */
export async function verifyAdminAction(): Promise<
  | { success: false; error: string }
  | { success: true; userId: string }
> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized: not logged in' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return { success: false, error: 'Forbidden: admin access required' };
  }

  return { success: true, userId: user.id };
}
