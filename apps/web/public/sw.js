// ============================================================================
// Spielcade Enterprise Progressive Web App Service Worker (v4)
// Standard: RFC-PWA-001
// Features: Offline Flagship Game Precache, Stale-While-Revalidate Static Assets,
//           Network-First Navigation with 2.5s Offline Fallback, Dynamic Cache Cleanup
// ============================================================================

const CACHE_NAME = 'spielcade-v4';

// Critical core assets and offline flagship games precached on install
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/games/snake',
  '/games/2048',
  '/games/flappy-bird',
  '/manifest.json',
  '/favicon.ico',
  '/logo.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/images/games/snake.svg',
  '/images/games/2048.svg',
  '/images/games/flappy-bird.svg',
];

// 1. Install: Precache offline core
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Use individual caching to prevent one 404 from breaking the entire precache
      await Promise.allSettled(
        PRECACHE_ASSETS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (response.ok) {
              await cache.put(url, response);
            }
          } catch (err) {
            console.warn('[SW] Precache item notice for', url, err);
          }
        })
      );
    })
  );
  // Do not automatically skip waiting; wait for user confirmation or activation
});

// 2. Activate: Prune legacy caches & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log('[SW] Pruning obsolete cache:', key);
              return caches.delete(key);
            }
          })
        )
      ),
    ])
  );
});

// 3. Message: Handle SKIP_WAITING from client update toast
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 4. Fetch: Tiered routing and caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests and browser extensions
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Bypass API routes, Supabase auth/data, IndexNow, and third-party ad networks
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('alwingulla.com') ||
    url.hostname.includes('monetag.com') ||
    url.hostname.includes('google-analytics.com')
  ) {
    return;
  }

  // A. Navigation Requests (HTML Pages): SWR for Catalog Routes, Network-First for Protected/Auth
  if (request.mode === 'navigate') {
    const isCatalogRoute =
      url.pathname === '/' ||
      url.pathname === '/games' ||
      url.pathname === '/popular' ||
      url.pathname === '/categories' ||
      url.pathname.startsWith('/categories/') ||
      url.pathname.startsWith('/games/');

    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);

        // For public catalog routes, serve from local cache immediately (5ms-10ms TTFB) with background SWR update
        if (isCatalogRoute) {
          const cachedResponse = await cache.match(request);

          // Background revalidation promise
          const networkUpdatePromise = fetch(request)
            .then((networkRes) => {
              if (networkRes && networkRes.status === 200) {
                cache.put(request, networkRes.clone());
              }
              return networkRes;
            })
            .catch(() => null);

          if (cachedResponse) {
            // Keep SW alive until background update completes
            event.waitUntil(networkUpdatePromise);
            return cachedResponse;
          }

          // First visit (cache miss): wait for network
          try {
            const freshResponse = await networkUpdatePromise;
            if (freshResponse && freshResponse.status === 200) {
              return freshResponse;
            }
          } catch {
            // Fall through to offline fallback
          }
        } else {
          // Protected/auth routes: Network-First with 2500ms timeout
          try {
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Network timeout')), 2500)
            );

            const networkResponse = await Promise.race([
              fetch(request),
              timeoutPromise,
            ]);

            if (networkResponse instanceof Response && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
              return networkResponse;
            }
          } catch {
            // Fall through to cache
          }

          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
        }

        // Fallback to offline hub if offline
        const offlineFallback = await cache.match('/offline');
        if (offlineFallback) {
          return offlineFallback;
        }

        return new Response(
          '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline - Spielcade</title></head><body style="background:#0A0B1A;color:#fff;font-family:sans-serif;text-align:center;padding:50px;"><h1>You are offline</h1><p>Connect to the internet or visit our cached offline games.</p><a href="/offline" style="color:#6366F1;">Go to Offline Hub</a></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      })()
    );
    return;
  }

  // B. Static Assets: Stale-While-Revalidate
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image'
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);

        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // C. Default: Network with Cache Fallback
  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      return cached || new Response(null, { status: 404, statusText: 'Not Found' });
    })
  );
});
