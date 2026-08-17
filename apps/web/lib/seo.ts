import { Metadata } from 'next';

// Use an environment variable for the site URL, fallback to the production domain
export const siteConfig = {
  name: 'Spielcade', 
  description: 'Play the best free online browser games.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://spielcade.com',
  ogImage: '/og-image.jpg',
};

/**
 * Helper to generate canonical URLs
 */
export function getCanonicalUrl(path: string): string {
  return `${siteConfig.url}${path === '/' ? '' : path}`;
}

/**
 * Shared metadata helper to ensure consistent SEO across pages
 */
export function constructMetadata({
  title = siteConfig.name,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  icons = '/favicon.ico',
  noIndex = false,
  path = '',
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
  path?: string;
} = {}): Metadata {
  return {
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    openGraph: {
      title,
      description,
      url: getCanonicalUrl(path),
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@Spielcade', // Update with actual twitter handle later
    },
    icons,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: getCanonicalUrl(path),
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
