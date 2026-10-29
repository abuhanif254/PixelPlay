import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
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
        ],
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
