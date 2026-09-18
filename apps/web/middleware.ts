import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 0. Canonical Host Normalization (www.* -> apex domain 301 redirect for Googlebot & AdSense)
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host || ''
  if (host.startsWith('www.')) {
    const apexHost = host.replace(/^www\./, '')
    const url = request.nextUrl.clone()
    url.host = apexHost
    url.protocol = 'https:'
    return NextResponse.redirect(url, 301)
  }

  // 0.1 Canonical Path Case Normalization (Big Tech SEO Best Practice)
  // If the path contains uppercase characters and is not an API/asset route,
  // 301-redirect to lowercase to eliminate duplicate content & case-sensitive 404s.
  if (
    /[A-Z]/.test(pathname) &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/embed')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.toLowerCase()
    return NextResponse.redirect(url, 301)
  }

  // 1. Ultra Fast-Path: Static SEO, feeds, search APIs, public assets
  if (
    pathname.startsWith('/sitemap') ||
    pathname === '/robots.txt' ||
    pathname === '/ads.txt' ||
    pathname === '/feed.xml' ||
    pathname.startsWith('/api/search') ||
    pathname.startsWith('/api/og') ||
    pathname.startsWith('/api/indexnow')
  ) {
    return NextResponse.next()
  }

  const isAdminRoute = pathname.startsWith('/admin')
  const isProtectedProfile =
    pathname === '/profile' ||
    pathname.startsWith('/profile/achievements') ||
    pathname.startsWith('/profile/activity') ||
    pathname.startsWith('/profile/favorites') ||
    pathname.startsWith('/profile/history') ||
    pathname.startsWith('/profile/recent') ||
    pathname.startsWith('/profile/settings')
  const isProtectedRoute = isProtectedProfile || pathname.startsWith('/studio') || isAdminRoute

  // 2. Check if request has any Supabase auth session cookies
  const hasAuthCookie = request.cookies.getAll().some(
    (c) => c.name.includes('-auth-token') || c.name.startsWith('sb-')
  )

  // 3. If unauthenticated user tries to access protected route, redirect to /login immediately without hitting DB
  if (!hasAuthCookie && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 4. If request is on a public route and user has NO auth cookies (99%+ of visitors & Googlebot),
  // skip all middleware database roundtrips completely and inject Edge CDN SWR headers!
  if (!hasAuthCookie && !isProtectedRoute) {
    const response = NextResponse.next()
    
    // Inject Cloudflare / Edge CDN Stale-While-Revalidate caching on public content routes
    if (!pathname.startsWith('/api') && !pathname.startsWith('/auth')) {
      response.headers.set(
        'Cache-Control',
        'public, max-age=60, s-maxage=600, stale-while-revalidate=86400'
      )
    }
    return response
  }

  // 5. User has auth cookies or is accessing protected route: run session validation
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
