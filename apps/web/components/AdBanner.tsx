'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Heart, ShieldCheck, HelpCircle, X, Sparkles } from 'lucide-react';

interface AdBannerProps {
  id: string; // Adsterra Zone ID
  width: number;
  height: number;
  className?: string;
}

export default function AdBanner({ id, width, height, className = '' }: AdBannerProps) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const scale = containerWidth && containerWidth > 0 && containerWidth < width ? containerWidth / width : 1;
  const effectiveHeight = Math.round(height * scale);

  useEffect(() => {
    const handleAdMessage = (event: MessageEvent) => {
      if (event.data?.source === 'SPIELCADE_AD' && event.data?.id === id) {
        if (event.data?.event === 'BLOCKED') {
          setIsBlocked(true);
        }
      }
    };
    window.addEventListener('message', handleAdMessage);
    return () => window.removeEventListener('message', handleAdMessage);
  }, [id]);

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
        <script>
          window.addEventListener('error', function(e) {
            try {
              window.parent.postMessage({ source: 'SPIELCADE_AD', event: 'BLOCKED', id: '${id}' }, '*');
            } catch(err) {}
          }, true);
          setTimeout(function() {
            var iframes = document.querySelectorAll('iframe');
            var hasContent = iframes.length > 0 || (document.body && document.body.innerText.trim().length > 0);
            if (!hasContent) {
              try {
                window.parent.postMessage({ source: 'SPIELCADE_AD', event: 'BLOCKED', id: '${id}' }, '*');
              } catch(err) {}
            }
          }, 3500);
        </script>
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
    <>
      <div 
        ref={containerRef}
        className={`flex items-center justify-center bg-[#111228] border border-white/5 rounded-xl overflow-hidden relative shrink-0 ${className}`}
        style={{ width: `${width}px`, height: `${effectiveHeight}px`, minHeight: `${effectiveHeight}px`, maxWidth: '100%', contain: 'layout size' }}
      >
        {isBlocked ? (
          /* High-Conversion, Respectful Support Spielcade Banner */
          <div className="w-full h-full p-2 sm:p-3 bg-gradient-to-r from-indigo-950/70 via-purple-950/60 to-slate-900/80 flex items-center justify-between gap-3 text-left relative z-20 overflow-hidden">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
                <Heart size={16} className="fill-pink-500/30" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate flex items-center gap-1.5 font-outfit">
                  <span>Support Free Gaming</span>
                  <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-white/10 text-indigo-300 hidden sm:inline">10,000+ Free Games</span>
                </p>
                <p className="text-[11px] text-gray-400 truncate max-w-md">
                  Whitelisting Spielcade in your ad blocker keeps all games 100% free with no downloads!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer flex items-center gap-1"
            >
              <HelpCircle size={12} />
              <span className="hidden sm:inline">How to Whitelist</span>
              <span className="sm:hidden">Whitelist</span>
            </button>
          </div>
        ) : (
          <div
            style={{
              width: `${width}px`,
              height: `${height}px`,
              transform: scale < 1 ? `scale(${scale})` : undefined,
              transformOrigin: 'top center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            {/* Fallback/Placeholder UI visible before ad loads */}
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-500 uppercase tracking-widest z-0 pointer-events-none">
              Advertisement
            </div>
            
            <iframe
              title="Advertisement"
              width={width}
              height={height}
              loading="lazy"
              frameBorder="0"
              scrolling="no"
              marginWidth={0}
              marginHeight={0}
              sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-top-navigation-by-user-activation"
              srcDoc={adHtml}
              className="z-10 relative"
            />
          </div>
        )}
      </div>

      {/* Whitelist Instructions Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
                  How to Whitelist Spielcade
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Keep indie browser games thriving
                </p>
              </div>
            </div>

            <ol className="space-y-3 text-xs text-gray-600 dark:text-gray-300 mb-6 list-decimal list-inside">
              <li className="p-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <strong className="text-gray-900 dark:text-white">Click your ad blocker icon</strong> in your browser toolbar (uBlock Origin, AdBlock Plus, Brave Shields).
              </li>
              <li className="p-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <strong className="text-gray-900 dark:text-white">Toggle protection off</strong> for <code className="text-indigo-400 font-mono">spielcade.com</code> or select &quot;Don&apos;t run on pages on this site&quot;.
              </li>
              <li className="p-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <strong className="text-gray-900 dark:text-white">Refresh the page</strong> to enjoy unlimited free gameplay with zero restrictions!
              </li>
            </ol>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-98 transition-all shadow-md shadow-indigo-600/30"
            >
              Got It, Thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
