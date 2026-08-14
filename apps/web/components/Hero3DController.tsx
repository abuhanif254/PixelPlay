'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Stars, RoundedBox, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Stylized 3D Retro Gamepad
function RetroController() {
  const groupRef = useRef<THREE.Group>(null);

  // Slowly rotate the controller for a cinematic feel
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
      <group ref={groupRef} scale={1.5}>
        {/* Main Body */}
        <RoundedBox args={[4, 1.8, 0.4]} radius={0.2} smoothness={4}>
          <meshStandardMaterial color="#e5e7eb" roughness={0.3} metalness={0.1} />
        </RoundedBox>

        {/* D-Pad Background (Indent) */}
        <RoundedBox position={[-1.2, 0, 0.15]} args={[1.2, 1.2, 0.2]} radius={0.1} smoothness={4}>
          <meshStandardMaterial color="#d1d5db" />
        </RoundedBox>

        {/* D-Pad Horizontal */}
        <RoundedBox position={[-1.2, 0, 0.25]} args={[0.9, 0.3, 0.1]} radius={0.05} smoothness={4}>
          <meshStandardMaterial color="#1f2937" roughness={0.7} />
        </RoundedBox>

        {/* D-Pad Vertical */}
        <RoundedBox position={[-1.2, 0, 0.25]} args={[0.3, 0.9, 0.1]} radius={0.05} smoothness={4}>
          <meshStandardMaterial color="#1f2937" roughness={0.7} />
        </RoundedBox>

        {/* Action Buttons Background (Indent) */}
        <RoundedBox position={[1.2, 0, 0.15]} args={[1.2, 1.2, 0.2]} radius={0.1} smoothness={4}>
          <meshStandardMaterial color="#d1d5db" />
        </RoundedBox>

        {/* Button Y (Top) */}
        <mesh position={[1.2, 0.4, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
          <meshStandardMaterial color="#eab308" roughness={0.2} metalness={0.5} />
        </mesh>

        {/* Button A (Bottom) */}
        <mesh position={[1.2, -0.4, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
          <meshStandardMaterial color="#22c55e" roughness={0.2} metalness={0.5} />
        </mesh>

        {/* Button X (Left) */}
        <mesh position={[0.8, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.2} metalness={0.5} />
        </mesh>

        {/* Button B (Right) */}
        <mesh position={[1.6, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
          <meshStandardMaterial color="#ef4444" roughness={0.2} metalness={0.5} />
        </mesh>

        {/* Select Button */}
        <RoundedBox position={[-0.2, -0.3, 0.22]} args={[0.4, 0.12, 0.1]} radius={0.05} smoothness={4} rotation={[0, 0, -Math.PI / 8]}>
          <meshStandardMaterial color="#4b5563" roughness={0.6} />
        </RoundedBox>

        {/* Start Button */}
        <RoundedBox position={[0.4, -0.3, 0.22]} args={[0.4, 0.12, 0.1]} radius={0.05} smoothness={4} rotation={[0, 0, -Math.PI / 8]}>
          <meshStandardMaterial color="#4b5563" roughness={0.6} />
        </RoundedBox>
        
        {/* L1 Bumper */}
        <RoundedBox position={[-1.2, 0.95, -0.05]} args={[1.2, 0.2, 0.3]} radius={0.05} smoothness={4}>
          <meshStandardMaterial color="#9ca3af" roughness={0.5} />
        </RoundedBox>

        {/* R1 Bumper */}
        <RoundedBox position={[1.2, 0.95, -0.05]} args={[1.2, 0.2, 0.3]} radius={0.05} smoothness={4}>
          <meshStandardMaterial color="#9ca3af" roughness={0.5} />
        </RoundedBox>

      </group>
    </Float>
  );
}

// Floating game cartridges/disks in the background
function FloatingCartridge({ position, color, speed = 1 }: { position: [number, number, number], color: string, speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01 * speed;
      meshRef.current.rotation.y += 0.015 * speed;
    }
  });

  return (
    <Float speed={speed * 1.5} rotationIntensity={2} floatIntensity={3}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[1.2, 1.2, 0.15]} />
        <meshPhysicalMaterial 
          color={color} 
          metalness={0.8} 
          roughness={0.2} 
          clearcoat={1}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
}

export default function Hero3DController() {
  return (
    <div className="relative w-[120%] h-[120%] z-10 -mr-20 cursor-move">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" castShadow />
        <spotLight position={[-10, 10, 10]} angle={0.3} penumbra={1} intensity={2} color="#6366f1" />
        <spotLight position={[10, -10, 10]} angle={0.3} penumbra={1} intensity={2} color="#ec4899" />
        
        {/* Environment Map for realistic reflections */}
        <Environment preset="city" />

        {/* Deep space stars background behind the shapes */}
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        {/* Central 3D Controller */}
        <RetroController />

        {/* Orbiting Game Disks/Cartridges */}
        <FloatingCartridge position={[-4, 3, -2]} color="#8b5cf6" speed={1.2} />
        <FloatingCartridge position={[4, -3, 1]} color="#3b82f6" speed={0.8} />

        {/* Allows the user to rotate the scene with their mouse! */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate={false}
          maxPolarAngle={Math.PI / 2 + 0.3}
          minPolarAngle={Math.PI / 2 - 0.3}
          maxAzimuthAngle={Math.PI / 4}
          minAzimuthAngle={-Math.PI / 4}
        />
      </Canvas>
      
      {/* Edge blending */}
      <div className="absolute inset-0 rounded-full shadow-[inset_0_0_100px_100px_#f9fafb] dark:shadow-[inset_0_0_100px_100px_#0A0B1A] pointer-events-none" style={{mixBlendMode: 'multiply'}} />
    </div>
  );
}
