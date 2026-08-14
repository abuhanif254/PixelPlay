'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { View, Preload } from '@react-three/drei';

export default function ThreeGlobalCanvas() {
  const [eventSource, setEventSource] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Next.js app router main container or document body
    setEventSource(document.getElementById('main-scroll-container') || document.body);
  }, []);

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
