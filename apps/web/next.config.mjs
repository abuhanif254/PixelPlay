import withPWAInit from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@games/snake"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
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
