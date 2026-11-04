'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AdBannerProps {
  id?: string;
  width: number;
  height: number;
  className?: string;
  gameId?: string;
  slotName?: string;
}

/**
 * Policy-Compliant Google AdSense Banner Component
 * Adheres to Google AdSense Programme Policies & Better Ads Standards:
 * - Clean "ADVERTISEMENT" neutral labeling
 * - No deceptive overlays or disruptive pop-unders
 * - Safe aspect ratio containment to prevent Cumulative Layout Shift (CLS)
 */
export default function AdBanner({ 
  id, 
  width, 
  height, 
  className = '', 
  gameId, 
  slotName 
}: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const adPushedRef = useRef(false);
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

  useEffect(() => {
    // Push ad request to Google AdSense when client script is ready
    if (adPushedRef.current) return;
    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        adPushedRef.current = true;
      }
    } catch (err) {
      // Gracefully handle adblocker or pre-approval initialization
    }
  }, []);

  const scale = containerWidth && containerWidth > 0 && containerWidth < width ? containerWidth / width : 1;
  const effectiveHeight = Math.round(height * scale);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center justify-center relative shrink-0 my-4 ${className}`}
      style={{
        maxWidth: '100%',
        contain: 'layout',
      }}
    >
      {/* Neutral, Policy-Compliant Ad Label (Google Policy: Only 'Advertisement' or 'Sponsored' permitted) */}
      <span className="text-[10px] tracking-widest uppercase font-semibold text-gray-400 dark:text-gray-500 mb-1 select-none pointer-events-none">
        Advertisement
      </span>

      <div
        className="flex items-center justify-center bg-gray-100/50 dark:bg-[#111228]/80 border border-gray-200/50 dark:border-white/5 rounded-xl overflow-hidden relative"
        style={{
          width: `${width}px`,
          height: `${effectiveHeight}px`,
          minHeight: `${effectiveHeight}px`,
          maxWidth: '100%',
        }}
      >
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
          {/* Google AdSense Display Unit */}
          <ins
            className="adsbygoogle"
            style={{
              display: 'inline-block',
              width: `${width}px`,
              height: `${height}px`,
            }}
            data-ad-client="ca-pub-9824094207004107"
            {...(id ? { 'data-ad-slot': id } : { 'data-ad-format': 'auto', 'data-full-width-responsive': 'true' })}
          />
        </div>
      </div>
    </div>
  );
}
