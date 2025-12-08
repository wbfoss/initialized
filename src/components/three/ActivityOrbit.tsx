'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

interface MonthData {
  month: number;
  count: number;
}

interface ActivityOrbitProps {
  monthlyData: MonthData[];
  radius?: number;
}

export function ActivityOrbit({ monthlyData, radius = 8 }: ActivityOrbitProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Generate orbit ring points
  const orbitPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return points;
  }, [radius]);

  // Calculate max for scaling
  const maxCount = Math.max(...monthlyData.map((d) => d.count), 1);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Orbit ring */}
      <Line points={orbitPoints} color="#374151" lineWidth={1} transparent opacity={0.5} />

      {/* Month nodes */}
      {monthlyData.map((data, index) => {
        const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const scale = 0.2 + (data.count / maxCount) * 0.5;
        const intensity = data.count / maxCount;

        return (
          <group key={data.month} position={[x, 0, z]}>
            <Sphere args={[1, 16, 16]} scale={scale}>
              <meshStandardMaterial
                color={`hsl(${200 + intensity * 80}, 70%, ${50 + intensity * 30}%)`}
                emissive={`hsl(${200 + intensity * 80}, 70%, 30%)`}
                emissiveIntensity={intensity * 0.5}
                roughness={0.3}
                metalness={0.7}
              />
            </Sphere>
            {data.count > maxCount * 0.5 && (
              <pointLight
                color={`hsl(${200 + intensity * 80}, 70%, 60%)`}
                intensity={0.5}
                distance={3}
              />
            )}
          </group>
        );
      })}
    </group>
  );
}
