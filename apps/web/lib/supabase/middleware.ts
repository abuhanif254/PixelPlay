import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // This will refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isProtectedProfile =
    request.nextUrl.pathname === '/profile' ||
    request.nextUrl.pathname.startsWith('/profile/achievements') ||
    request.nextUrl.pathname.startsWith('/profile/activity') ||
    request.nextUrl.pathname.startsWith('/profile/favorites') ||
    request.nextUrl.pathname.startsWith('/profile/history') ||
    request.nextUrl.pathname.startsWith('/profile/recent') ||
    request.nextUrl.pathname.startsWith('/profile/settings')
  const isProtectedRoute = isProtectedProfile || isAdminRoute

  // If user is NOT logged in and trying to access protected route, redirect to login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user IS logged in but accessing /admin, verify they have admin role
  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile || profile.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(url)
    }
  }

  // Check maintenance mode with timeout fallback to avoid stalling edge responses
  try {
    const timeoutPromise = new Promise<{ data: any }>((resolve) =>
      setTimeout(() => resolve({ data: null }), 1000)
    );
    const maintenancePromise = supabase
      .from('site_config')
      .select('config_value')
      .eq('config_key', 'maintenance_mode')
      .maybeSingle();

    const { data: config } = (await Promise.race([maintenancePromise, timeoutPromise])) as any;

    if (config?.config_value === 'true' && !request.nextUrl.pathname.startsWith('/maintenance')) {
      let isAdmin = false;
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        if (profile?.role === 'admin') {
          isAdmin = true;
        }
      }

      if (!isAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = '/maintenance';
        return NextResponse.rewrite(url);
      }
    }
  } catch (err) {
    // Non-fatal if site_config check fails
  }

  return supabaseResponse
}
