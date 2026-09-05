import withPWAInit from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@games/snake"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
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
    cpus: 1,
    memoryBasedWorkersCount: true
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
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/search',
        destination: '/games',
        permanent: true,
      },
      {
        source: '/category/:slug',
        destination: '/categories/:slug',
        permanent: true,
      },
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
      }
    ];
  }
};

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development" || process.env.CF_PAGES === "1" || !!process.env.CI,
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/, /_buildManifest\.js$/],
  workboxOptions: {
    maximumFileSizeToCacheInBytes: 5000000,
  }
});

export default withPWA(nextConfig);
