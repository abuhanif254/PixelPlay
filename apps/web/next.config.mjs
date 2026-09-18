import withPWAInit from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@spielcade/games"],
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 420, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'spielcade.com',
      },
      {
        protocol: 'https',
        hostname: '*.spielcade.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'img.gamemonetize.com',
      },
      {
        protocol: 'https',
        hostname: '*.gamemonetize.com',
      },
      {
        protocol: 'https',
        hostname: 'img.gamedistribution.com',
      },
      {
        protocol: 'https',
        hostname: '*.gamedistribution.com',
      },
      {
        protocol: 'https',
        hostname: '*.gamepix.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  productionBrowserSourceMaps: false,
  webpack: (config) => {
    config.devtool = false;
    return config;
  },
  experimental: {
    ...(process.env.CF_PAGES === '1' ? { cpus: 1, memoryBasedWorkersCount: true } : {}),
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/(games|popular|categories|categories/:slug*|games/:slug*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/ads.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/sitemap/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Core Route Aliases & Singular/Plural Normalization
      {
        source: '/search',
        destination: '/games',
        permanent: true,
      },
      {
        source: '/leaderboards',
        destination: '/leaderboard',
        permanent: true,
      },
      {
        source: '/game/:slug',
        destination: '/games/:slug',
        permanent: true,
      },
      {
        source: '/game',
        destination: '/games',
        permanent: true,
      },
      {
        source: '/play/:slug',
        destination: '/games/:slug',
        permanent: true,
      },
      {
        source: '/play',
        destination: '/games',
        permanent: true,
      },
      {
        source: '/category',
        destination: '/categories',
        permanent: true,
      },
      {
        source: '/category/:slug',
        destination: '/categories/:slug',
        permanent: true,
      },
      {
        source: '/category-games/:slug',
        destination: '/categories/:slug',
        permanent: true,
      },
      {
        source: '/genres',
        destination: '/categories',
        permanent: true,
      },
      {
        source: '/genres/:slug',
        destination: '/categories/:slug',
        permanent: true,
      },
      {
        source: '/tag/:tag',
        destination: '/games/tags/:tag',
        permanent: true,
      },
      {
        source: '/tags/:tag',
        destination: '/games/tags/:tag',
        permanent: true,
      },
      {
        source: '/tags',
        destination: '/categories',
        permanent: true,
      },
      {
        source: '/developer',
        destination: '/developers',
        permanent: true,
      },
      {
        source: '/tournament',
        destination: '/tournaments',
        permanent: true,
      },
      {
        source: '/party-games',
        destination: '/party',
        permanent: true,
      },
      {
        source: '/playlist',
        destination: '/playlists',
        permanent: true,
      },

      // Short & Alternate Category Slugs
      {
        source: '/categories/board',
        destination: '/categories/board-games',
        permanent: true,
      },
      {
        source: '/categories/arcade',
        destination: '/categories/arcade-games',
        permanent: true,
      },
      {
        source: '/categories/puzzle',
        destination: '/categories/puzzle-games',
        permanent: true,
      },
      {
        source: '/categories/action',
        destination: '/categories/action-games',
        permanent: true,
      },
      {
        source: '/categories/racing',
        destination: '/categories/racing-games',
        permanent: true,
      },
      {
        source: '/categories/strategy',
        destination: '/categories/strategy-games',
        permanent: true,
      },
      {
        source: '/categories/sports',
        destination: '/categories/sports-games',
        permanent: true,
      },
      {
        source: '/categories/adventure',
        destination: '/categories/adventure-games',
        permanent: true,
      },
      {
        source: '/categories/car',
        destination: '/categories/car-games',
        permanent: true,
      },
      {
        source: '/categories/zombie',
        destination: '/categories/zombie-games',
        permanent: true,
      },
      {
        source: '/categories/shooting',
        destination: '/categories/shooting-games',
        permanent: true,
      },
      {
        source: '/categories/unblocked',
        destination: '/categories/unblocked-games',
        permanent: true,
      },
      {
        source: '/categories/multiplayer',
        destination: '/categories/2-player-games',
        permanent: true,
      },
      {
        source: '/categories/2-player',
        destination: '/categories/2-player-games',
        permanent: true,
      },
      {
        source: '/categories/stickman',
        destination: '/categories/stickman-games',
        permanent: true,
      },
      {
        source: '/categories/runner',
        destination: '/categories/runner-games',
        permanent: true,
      },
      {
        source: '/categories/escape',
        destination: '/categories/escape-games',
        permanent: true,
      },
    ];
  }
};

const withPWA = withPWAInit({
  dest: "public",
  disable: true,
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: "/offline",
  },
  buildExcludes: [/middleware-manifest\.json$/, /_buildManifest\.js$/],
  workboxOptions: {
    maximumFileSizeToCacheInBytes: 5000000,
  }
});

export default nextConfig;
