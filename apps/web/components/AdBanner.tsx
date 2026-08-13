'use client';

import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  id: string; // Adsterra Zone ID
  width: number;
  height: number;
  className?: string;
}

export default function AdBanner({ id, width, height, className = '' }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client and if container exists
    if (!containerRef.current) return;
    
    // Clear any previous ads on re-render/navigation
    containerRef.current.innerHTML = '';

    // Create the config script
    const confScript = document.createElement('script');
    confScript.type = 'text/javascript';
    confScript.innerHTML = `
      atOptions = {
        'key' : '${id}',
        'format' : 'iframe',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
      };
    `;
    
    // Create the invoke script
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = `//www.highperformanceformat.com/${id}/invoke.js`;
    invokeScript.async = true;

    // Append both to the container
    containerRef.current.appendChild(confScript);
    containerRef.current.appendChild(invokeScript);

    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [id, width, height]);

  return (
    <div 
      className={`flex items-center justify-center bg-[#111228] border border-white/5 rounded-xl overflow-hidden relative ${className}`}
      style={{ minWidth: width, minHeight: height }}
    >
      {/* Fallback/Placeholder UI before ad loads */}
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-500 uppercase tracking-widest z-0 pointer-events-none">
        Advertisement
      </div>
      
      {/* Container for the actual injected ad script */}
      <div ref={containerRef} className="z-10" />
    </div>
  );
}
