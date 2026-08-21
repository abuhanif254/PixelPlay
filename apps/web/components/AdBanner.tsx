'use client';

import React from 'react';

interface AdBannerProps {
  id: string; // Adsterra Zone ID
  width: number;
  height: number;
  className?: string;
}

export default function AdBanner({ id, width, height, className = '' }: AdBannerProps) {
  // We use an iframe with srcDoc because Adsterra's invoke.js relies heavily 
  // on document.write(). In a modern React Single Page Application (SPA), 
  // document.write is blocked after the initial page load. 
  // The iframe creates an isolated document where document.write works perfectly!
  const adHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            overflow: hidden; 
            background-color: transparent; 
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            width: 100vw;
          }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '${id}',
            'format' : 'iframe',
            'height' : ${height},
            'width' : ${width},
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/${id}/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div 
      className={`flex items-center justify-center bg-[#111228] border border-white/5 rounded-xl overflow-hidden relative ${className}`}
      style={{ minWidth: width, minHeight: height }}
    >
      {/* Fallback/Placeholder UI visible before ad loads */}
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-500 uppercase tracking-widest z-0 pointer-events-none">
        Advertisement
      </div>
      
      <iframe
        title="Advertisement"
        width={width}
        height={height}
        frameBorder="0"
        scrolling="no"
        marginWidth={0}
        marginHeight={0}
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-top-navigation-by-user-activation"
        srcDoc={adHtml}
        className="z-10 relative"
      />
    </div>
  );
}
