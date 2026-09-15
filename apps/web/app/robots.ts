import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/login/',
        '/profile/achievements/',
        '/profile/activity/',
        '/profile/favorites/',
        '/profile/history/',
        '/profile/recent/',
        '/profile/settings/',
        '/favorites/',
        '/admin/',
        '/studio/',
        '/auth/',
        '/maintenance/',
        '/cdn-cgi/',
        '/settings/',
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
