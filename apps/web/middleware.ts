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

  // 0.1 Non-HTML OpenGraph / Twitter Image Preview Endpoints: attach X-Robots-Tag: noindex
  if (pathname.endsWith('/opengraph-image') || pathname.endsWith('/twitter-image')) {
    const res = NextResponse.next()
    res.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return res
  }

  // 0.2 Canonical Query-Param Normalization on /games and /search (?category=..., ?page=1)
  const CATEGORY_QUERY_MAP: Record<string, string> = {
    action: '/categories/action-games',
    adventure: '/categories/adventure-games',
    arcade: '/categories/arcade-games',
    board: '/categories/board-games',
    puzzle: '/categories/puzzle-games',
    racing: '/categories/racing-games',
    sports: '/categories/sports-games',
    strategy: '/categories/strategy-games',
    skill: '/categories/arcade-games',
    endless: '/categories/runner-games',
    runner: '/categories/runner-games',
    running: '/categories/runner-games',
    car: '/categories/car-games',
    shooting: '/categories/shooting-games',
    stickman: '/categories/stickman-games',
    zombie: '/categories/zombie-games',
    unblocked: '/categories/unblocked-games',
    multiplayer: '/categories/2-player-games',
    'multiplayer games': '/categories/2-player-games',
    '2 player': '/categories/2-player-games',
    '2-player': '/categories/2-player-games',
    '3 player': '/categories/3-player-games',
    '3-player': '/categories/3-player-games',
    '4 player': '/categories/4-player-games',
    '4-player': '/categories/4-player-games',
    retro: '/categories/retro-arcade-games',
    'retro-arcade': '/categories/retro-arcade-games',
    platformer: '/categories/arcade-games',
    platformers: '/categories/arcade-games',
    escape: '/categories/escape-games',
    tank: '/categories/tank-games',
    war: '/categories/war-games',
    horror: '/categories/horror-games',
    fps: '/categories/fps-games',
    cricket: '/categories/cricket-games',
    boxing: '/categories/boxing-games',
    bowling: '/categories/bowling-games',
    pool: '/categories/pool-games',
    golf: '/categories/golf-games',
    tennis: '/categories/tennis-games',
    casual: '/categories/casual-games',
    physics: '/categories/physics-games',
    'tower-defense': '/categories/tower-defense-games',
    'tower defense': '/categories/tower-defense-games',
    io: '/categories/io-games',
    chromebook: '/categories/chromebook-games',
    clicker: '/categories/clicker-games',
    moto: '/categories/moto-games',
    drift: '/categories/drift-games',
    'battle-royale': '/categories/battle-royale-games',
    '3d': '/categories/3d-games',
  }

  if (pathname === '/search') {
    const q = request.nextUrl.searchParams.get('q')?.trim().toLowerCase() || ''
    const url = request.nextUrl.clone()
    url.search = ''
    url.pathname = CATEGORY_QUERY_MAP[q] || '/games'
    return NextResponse.redirect(url, 301)
  }

  if (pathname === '/games') {
    const searchParams = request.nextUrl.searchParams
    const rawCat = searchParams.get('category')?.trim()
    const rawPage = searchParams.get('page')?.trim()
    const hasSearch = Boolean(searchParams.get('q') || searchParams.get('search'))

    if (rawCat && !hasSearch) {
      const catKey = rawCat.toLowerCase()
      const targetHub = CATEGORY_QUERY_MAP[catKey] || `/categories/${catKey.replace(/\s+/g, '-')}-games`
      const url = request.nextUrl.clone()
      url.pathname = targetHub
      url.searchParams.delete('category')
      if (rawPage === '1') {
        url.searchParams.delete('page')
      }
      return NextResponse.redirect(url, 301)
    }

    if (rawPage === '1') {
      const url = request.nextUrl.clone()
      url.searchParams.delete('page')
      return NextResponse.redirect(url, 301)
    }
  }

  // 0.3 Single-Hop Category Slug Normalization (/category/:slug & /categories/:shortSlug -> /categories/:slug-games)
  if (pathname.startsWith('/category/') || pathname.startsWith('/categories/')) {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 2) {
      const rawSlug = segments[1].toLowerCase()
      const mappedHub = CATEGORY_QUERY_MAP[rawSlug]
      if (mappedHub && pathname !== mappedHub) {
        const url = request.nextUrl.clone()
        url.pathname = mappedHub
        return NextResponse.redirect(url, 301)
      }
      if (segments[0] === 'category') {
        const url = request.nextUrl.clone()
        url.pathname = `/categories/${rawSlug.endsWith('-games') ? rawSlug : `${rawSlug}-games`}`
        return NextResponse.redirect(url, 301)
      }
    }
  }

  // 0.4 Synthetic Per-Game & Category Tag Consolidation (/games/tags/...)
  if (pathname.startsWith('/games/tags/')) {
    const rawSegment = pathname.slice('/games/tags/'.length)
    let decodedTag = rawSegment
    try {
      decodedTag = decodeURIComponent(rawSegment)
    } catch {
      decodedTag = rawSegment
    }

    const cleanedTag = decodedTag
      .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, '')
      .toLowerCase()
      .trim()

    // 1. Direct category hub match (e.g., /games/tags/2-player -> /categories/2-player-games)
    const targetCategoryHub = CATEGORY_QUERY_MAP[cleanedTag]
    if (targetCategoryHub) {
      const url = request.nextUrl.clone()
      url.pathname = targetCategoryHub
      url.search = ''
      return NextResponse.redirect(url, 301)
    }

    // 2. Synthetic per-game SEO modifier tags (free-*, *-unblocked, *-online, *-for-chromebook, *-no-download)
    const hasSyntheticAffix =
      cleanedTag.startsWith('free-') ||
      cleanedTag.endsWith('-unblocked') ||
      cleanedTag.endsWith('-online') ||
      cleanedTag.endsWith('-for-chromebook') ||
      cleanedTag.endsWith('-no-download')

    if (hasSyntheticAffix) {
      let baseSlug = cleanedTag
        .replace(/^free-/, '')
        .replace(/-(unblocked|for-chromebook|no-download)$/, '')
      // Handle "-online-online" where the base game slug itself ends with "-online" (e.g. chess-multiplayer-online-online)
      if (baseSlug.endsWith('-online-online')) {
        baseSlug = baseSlug.replace(/-online$/, '')
      } else {
        baseSlug = baseSlug.replace(/-online$/, '')
      }
      baseSlug = baseSlug
        .replace(/[:|,!?'"]+/g, '')
        .replace(/\.io\b/g, 'io')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

      if (baseSlug) {
        const url = request.nextUrl.clone()
        url.pathname = `/games/${baseSlug}`
        url.search = ''
        return NextResponse.redirect(url, 301)
      }
    }
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
