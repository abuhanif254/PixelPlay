export const runtime = 'edge';
import React from 'react';
import Link from 'next/link';
import { Gamepad2, FileText, Send, PieChart, Shield } from 'lucide-react';

export const metadata = {
  title: 'Developer Studio - Spielcade',
  description: 'Manage and submit your browser games.',
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05050F] pt-24 pb-12 transition-colors text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold font-outfit tracking-wide flex items-center gap-3">
            <Gamepad2 className="text-[#6366F1]" size={32} />
            Developer Studio
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Submit games, manage your portfolio, and read the SDK docs.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 shrink-0">
            <nav className="flex flex-col gap-2 bg-white dark:bg-[#111228] p-4 rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl">
              
              <Link href="/studio" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[#6366F1] dark:hover:text-[#6366F1] transition-all">
                <PieChart size={18} />
                Dashboard
              </Link>

              <Link href="/studio/submit" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[#6366F1] dark:hover:text-[#6366F1] transition-all">
                <Send size={18} />
                Submit Game
              </Link>

              <Link href="/studio/revenue" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-green-500 dark:hover:text-green-400 transition-all">
                <PieChart size={18} />
                Revenue
              </Link>

              <Link href="/studio/keys" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-yellow-500 dark:hover:text-yellow-400 transition-all">
                <Shield size={18} />
                API Keys
              </Link>

              <Link href="/studio/docs" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[#6366F1] dark:hover:text-[#6366F1] transition-all">
                <FileText size={18} />
                SDK Documentation
              </Link>

              <div className="h-px w-full bg-gray-100 dark:bg-white/5 my-2"></div>

              <Link href="/admin/games" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                <Shield size={18} />
                Admin Queue
              </Link>

            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}
