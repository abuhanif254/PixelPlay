export const runtime = 'edge';
import React from 'react';
import { Metadata } from 'next';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import { requireAdmin } from '@/lib/admin';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Spielcade',
  description: 'Spielcade Administration and Management Panel',
};

export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
