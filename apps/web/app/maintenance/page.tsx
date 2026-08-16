import React from 'react';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Maintenance | Spielcade',
  description: 'Spielcade is currently undergoing scheduled maintenance.',
};

export default function MaintenancePage() {
  return (
    <div className={`${inter.className} bg-[#0A0B1A] text-white h-screen flex flex-col items-center justify-center text-center p-6 w-full fixed inset-0 z-[9999]`}>
      <div className="w-20 h-20 mb-6 bg-[#6366F1]/20 rounded-full flex items-center justify-center mx-auto text-[#6366F1] animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <path d="M12 9v4"/>
          <path d="M12 17h.01"/>
        </svg>
      </div>
      <h1 className="text-4xl font-black mb-4 font-outfit text-white">We'll be back soon!</h1>
      <p className="text-gray-400 max-w-md mx-auto">
        Spielcade is currently undergoing scheduled maintenance to bring you new games and features. Please check back later.
      </p>
    </div>
  );
}
