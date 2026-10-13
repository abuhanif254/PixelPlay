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
          '/profile',
          '/profile/',
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
          '/search',
          '/search/',
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
