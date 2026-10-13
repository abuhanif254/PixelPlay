import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 0. Single-Hop Canonical Host (www.* -> apex) & Path Case Normalization
  // IMPORTANT: Exclude %XX percent-encoded hex sequences (e.g., %3A, %2C, %7C, %C3%A9) when checking/lowercasing
  // because RFC 3986 / WHATWG URL parsers normalize %XX hex digits to uppercase, which would otherwise cause an infinite 301 loop.
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host || ''
  const isWww = host.startsWith('www.')

  const isCaseNormalizedRoute =
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/embed')

  const pathnameWithoutPercent = pathname.replace(/%[0-9A-Fa-f]{2}/g, '')
  const hasUppercaseAscii = isCaseNormalizedRoute && /[A-Z]/.test(pathnameWithoutPercent)

  if (isWww || hasUppercaseAscii) {
    const url = request.nextUrl.clone()
    if (isWww) {
      url.host = host.replace(/^www\./, '')
      url.protocol = 'https:'
    }
    if (hasUppercaseAscii) {
      const normalizedPathname = pathname.replace(/%[0-9A-Fa-f]{2}|[A-Z]+/g, (match) =>
        match.startsWith('%') ? match.toUpperCase() : match.toLowerCase()
      )
      if (normalizedPathname === pathname && !isWww) {
        return NextResponse.next()
      }
      url.pathname = normalizedPathname
    }
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
      const cacheDirective = 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400'
      response.headers.set('Cache-Control', cacheDirective)
      response.headers.set('CDN-Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
      response.headers.set('Cloudflare-CDN-Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
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
     * - favicon.ico, sw.js, manifest.json, ads.txt, robots.txt, sitemap*, feed.xml
     * - static file extensions (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico, .js, .css, .txt, .xml, .json, .woff, .woff2)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|sw\\.js|manifest\\.json|ads\\.txt|robots\\.txt|sitemap\\.xml|sitemap/|feed\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|txt|xml|json|woff2?)$).*)',
  ],
}
