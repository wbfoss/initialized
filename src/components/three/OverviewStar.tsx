'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface OverviewStarProps {
  contributions: number;
  position?: [number, number, number];
}

export function OverviewStar({ contributions, position = [0, 0, 0] }: OverviewStarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Scale based on contributions (min 0.5, max 2)
  const scale = Math.min(2, Math.max(0.5, contributions / 1000));

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y = -state.clock.elapsedTime * 0.1;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
      glowRef.current.scale.setScalar(scale * 1.5 * pulse);
    }
  });

  return (
    <group position={position}>
      {/* Outer glow */}
      <Sphere ref={glowRef} args={[1, 32, 32]} scale={scale * 1.5}>
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.1} />
      </Sphere>

      {/* Main star */}
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={scale}>
        <MeshDistortMaterial
          color="#a855f7"
          emissive="#7c3aed"
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.8}
          distort={0.3}
          speed={2}
        />
      </Sphere>

      {/* Inner core */}
      <Sphere args={[0.5, 32, 32]} scale={scale}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </Sphere>

      {/* Point light from star */}
      <pointLight color="#a855f7" intensity={2} distance={20} />
    </group>
  );
}
