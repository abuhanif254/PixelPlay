export const runtime = 'edge';
export const revalidate = 3600;

import { generateGameChunkXml } from '../../sitemap-generator';

export async function GET(
  request: Request,
  { params }: { params: { page: string } }
) {
  const pageParam = (params.page || '').replace(/\.xml$/, '');
  const pageNum = parseInt(pageParam, 10) || 1;
  return generateGameChunkXml(pageNum);
}

