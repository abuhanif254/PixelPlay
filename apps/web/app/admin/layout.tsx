import React from 'react';
import { Metadata } from 'next';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Spielcade',
  description: 'Spielcade Administration and Management Panel',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05050F] text-gray-900 dark:text-white relative">
      
      {/* Ambient Admin Background Glows */}
      <div className="absolute top-[0%] left-[10%] w-[30vw] h-[30vw] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Sidebar (Fixed on left) */}
      <AdminSidebar />

      {/* Main Content Area (Offset by sidebar width) */}
      <div className="pl-64 flex flex-col min-h-screen relative z-10">
        <AdminTopBar />
        
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

    </div>
  );
}
