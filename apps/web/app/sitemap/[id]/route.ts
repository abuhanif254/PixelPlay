export const runtime = 'edge';
export const revalidate = 3600;

import { NextResponse } from 'next/server';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spielcade.com';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cleanId = (params.id || '').replace(/\.xml$/, '');

  if (cleanId === 'static') {
    return NextResponse.redirect(`${baseUrl}/sitemap/static.xml`, 301);
  }

  if (cleanId === 'categories' || cleanId === '0') {
    return NextResponse.redirect(`${baseUrl}/sitemap/categories.xml`, 301);
  }

  if (cleanId === 'tags') {
    return NextResponse.redirect(`${baseUrl}/sitemap/tags.xml`, 301);
  }

  if (cleanId === 'blog') {
    return NextResponse.redirect(`${baseUrl}/sitemap/blog.xml`, 301);
  }

  const pageNum = parseInt(cleanId, 10);
  if (!isNaN(pageNum) && pageNum > 0) {
    return NextResponse.redirect(`${baseUrl}/sitemap/games/${pageNum}.xml`, 301);
  }

  return new Response('Not Found', { status: 404 });
}
