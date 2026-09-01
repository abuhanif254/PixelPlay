export const runtime = 'edge';
import React from 'react';
import { requireAdmin } from '@/lib/admin';
import ImporterClient from './ImporterClient';

export const revalidate = 0;

export const metadata = {
  title: 'Import Games Feed | Spielcade Admin',
  description: 'Automated feed ingestion and SEO engine for Spielcade games.',
};

export default async function AdminImportGamesPage() {
  await requireAdmin();

  return <ImporterClient />;
}
