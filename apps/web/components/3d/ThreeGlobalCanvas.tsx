'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { View, Preload } from '@react-three/drei';

export default function ThreeGlobalCanvas() {
  const [eventSource, setEventSource] = useState<HTMLElement | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(true); // Default to true on initial mount to avoid flash of canvas on phones

  useEffect(() => {
    // Disable background WebGL context on mobile phones (< 768px) to conserve GPU memory and battery
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Next.js app router main container or document body
    setEventSource(document.getElementById('main-scroll-container') || document.body);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return null;
  }

  return (
    <Canvas
      className="!fixed inset-0 !pointer-events-none z-50"
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none' }}
      eventSource={eventSource || undefined}
      camera={{ position: [0, 0, 5], fov: 45 }}
    >
      <View.Port />
      <Preload all />
    </Canvas>
  );
}
