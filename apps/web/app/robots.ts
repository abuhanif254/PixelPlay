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
        '/profile/',
        '/favorites/',
        '/admin/',
        '/studio/',
        '/auth/',
        '/maintenance/',
        '/cdn-cgi/',
        '/search',
        '/*?*search=*',
        '/*?*category=*',
        '/*?*sort=*',
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
