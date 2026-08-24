import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/login/', '/profile/', '/favorites/', '/cdn-cgi/', '/search'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
