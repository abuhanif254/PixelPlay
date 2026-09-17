'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import { openConsentModal } from '@/lib/consent';

export default function CookiePreferencesButton({ className = '' }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => openConsentModal()}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer ${className}`}
    >
      <Settings size={15} />
      <span>Open Cookie Preferences</span>
    </button>
  );
}
