'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Icosahedron, Box, Torus } from '@react-three/drei';
import * as THREE from 'three';

// Shared lighting for the mini portals
function MiniLighting({ color }: { color: string }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[-5, -5, -5]} intensity={2} color={color} />
    </>
  );
}

// 🔥 Trending Games - Fire / Crystal
export function FireIcon() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.8;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.4;
    }
  });

  return (
    <>
      <MiniLighting color="#ef4444" />
      <Float speed={3} rotationIntensity={1} floatIntensity={2}>
        <Icosahedron ref={meshRef} args={[1.5, 0]}>
          <MeshDistortMaterial
            color="#ef4444"
            emissive="#b91c1c"
            emissiveIntensity={0.5}
            clearcoat={1}
            roughness={0.1}
            distort={0.4}
            speed={3}
          />
        </Icosahedron>
      </Float>
    </>
  );
}

// 🕹️ Categories - Rubik's Cube / Geometric
export function CubeIcon() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      groupRef.current.rotation.x = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <>
      <MiniLighting color="#3b82f6" />
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <group ref={groupRef}>
          <Box args={[1.2, 1.2, 1.2]}>
            <meshStandardMaterial color="#3b82f6" roughness={0.2} metalness={0.8} />
          </Box>
          {/* Orbiting small box */}
          <Box args={[0.4, 0.4, 0.4]} position={[1.5, 1, 0]}>
            <meshStandardMaterial color="#ec4899" roughness={0.2} metalness={0.8} />
          </Box>
        </group>
      </Float>
    </>
  );
}

// 🆕 New Games - Rocket / Diamond
export function RocketIcon() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 1.5;
    }
  });

  return (
    <>
      <MiniLighting color="#10b981" />
      <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
        <mesh ref={meshRef}>
          <octahedronGeometry args={[1.5, 0]} />
          <meshPhysicalMaterial
            color="#10b981"
            emissive="#047857"
            emissiveIntensity={0.2}
            roughness={0.1}
            metalness={0.9}
            clearcoat={1}
          />
        </mesh>
      </Float>
    </>
  );
}

// 📰 Latest News / Articles - Data Rings
export function RingsIcon() {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ring1.current && ring2.current) {
      ring1.current.rotation.x = state.clock.elapsedTime * 1;
      ring1.current.rotation.y = state.clock.elapsedTime * 0.5;
      
      ring2.current.rotation.x = -state.clock.elapsedTime * 0.8;
      ring2.current.rotation.z = state.clock.elapsedTime * 0.6;
    }
  });

  return (
    <>
      <MiniLighting color="#a855f7" />
      <Float speed={1.5} rotationIntensity={1} floatIntensity={1}>
        <Torus ref={ring1} args={[1, 0.1, 16, 64]}>
          <meshStandardMaterial color="#a855f7" roughness={0.1} metalness={0.8} />
        </Torus>
        <Torus ref={ring2} args={[1.4, 0.05, 16, 64]}>
          <meshStandardMaterial color="#eab308" roughness={0.1} metalness={0.8} />
        </Torus>
      </Float>
    </>
  );
}
