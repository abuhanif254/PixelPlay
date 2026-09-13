export const runtime = 'edge';
export const revalidate = 3600;

import { generateGameChunkXml } from '../sitemap-generator';
import { GET as getStaticSitemap } from '../static.xml/route';
import { GET as getCategoriesSitemap } from '../categories.xml/route';
import { GET as getTagsSitemap } from '../tags.xml/route';
import { GET as getBlogSitemap } from '../blog.xml/route';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cleanId = (params.id || '').replace(/\.xml$/, '');

  if (cleanId === 'static') {
    return getStaticSitemap();
  }

  if (cleanId === 'categories' || cleanId === '0') {
    return getCategoriesSitemap();
  }

  if (cleanId === 'tags') {
    return getTagsSitemap();
  }

  if (cleanId === 'blog') {
    return getBlogSitemap();
  }

  const pageNum = parseInt(cleanId, 10);
  if (!isNaN(pageNum) && pageNum > 0) {
    return generateGameChunkXml(pageNum);
  }

  return new Response('Not Found', { status: 404 });
}
