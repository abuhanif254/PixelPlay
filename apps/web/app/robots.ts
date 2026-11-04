import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const privateDisallowPaths = [
    '/api/',
    '/login',
    '/login/',
    '/profile/achievements/',
    '/profile/activity/',
    '/profile/favorites/',
    '/profile/history/',
    '/profile/recent/',
    '/profile/settings/',
    '/studio',
    '/studio/',
    '/admin',
    '/admin/',
    '/auth',
    '/auth/',
    '/maintenance',
    '/maintenance/',
    '/cdn-cgi',
    '/cdn-cgi/',
    '/settings',
    '/settings/',
    '/favorites',
    '/favorites/',
    '/embed',
    '/embed/',
  ];

  return {
    rules: [
      {
        // Google AdSense Review & Ad Delivery Crawler: Unrestricted access
        userAgent: 'Mediapartners-Google',
        allow: '/',
      },
      {
        // Googlebot Primary Search Indexer
        userAgent: 'Googlebot',
        allow: '/',
        disallow: privateDisallowPaths,
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: privateDisallowPaths,
      },
      {
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'DotBot',
          'MJ12bot',
          'Bytespider',
          'PetalBot',
          'BLEXBot',
          'DataForSeoBot',
          'GPTBot',
          'ClaudeBot',
          'CCBot',
        ],
        disallow: '/',
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
