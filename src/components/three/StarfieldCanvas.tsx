'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Seeded random number generator for deterministic results
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function Stars({ count = 5000 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (seededRandom(i * 3) - 0.5) * 100;
      pos[i * 3 + 1] = (seededRandom(i * 3 + 1) - 0.5) * 100;
      pos[i * 3 + 2] = (seededRandom(i * 3 + 2) - 0.5) * 100;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.02;
      ref.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.1}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

function ColoredStars({ count = 1000, color = '#60a5fa', seed = 100 }: { count?: number; color?: string; seed?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (seededRandom(seed + i * 3) - 0.5) * 80;
      pos[i * 3 + 1] = (seededRandom(seed + i * 3 + 1) - 0.5) * 80;
      pos[i * 3 + 2] = (seededRandom(seed + i * 3 + 2) - 0.5) * 80;
    }
    return pos;
  }, [count, seed]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.015;
      ref.current.rotation.y = state.clock.elapsedTime * 0.025;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.15}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

export function StarfieldCanvas() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 20], fov: 75 }}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.5} />
        <Stars count={5000} />
        <ColoredStars count={500} color="#60a5fa" seed={100} />
        <ColoredStars count={500} color="#a855f7" seed={200} />
        <ColoredStars count={300} color="#ec4899" seed={300} />
      </Canvas>
    </div>
  );
}
