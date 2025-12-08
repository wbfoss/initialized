'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Ring } from '@react-three/drei';
import * as THREE from 'three';

interface RepoData {
  fullName: string;
  starsGained2025: number;
  commitsByUser2025: number;
  role: string;
}

interface RepoConstellationProps {
  repos: RepoData[];
}

const ROLE_COLORS: Record<string, string> = {
  FLAGSHIP: '#a855f7',
  PATROL: '#3b82f6',
  SHUTTLE: '#6b7280',
};

export function RepoConstellation({ repos }: RepoConstellationProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  // Calculate max for scaling
  const maxCommits = Math.max(...repos.map((r) => r.commitsByUser2025), 1);

  return (
    <group ref={groupRef}>
      {repos.slice(0, 6).map((repo, index) => {
        // Distribute in a spiral pattern
        const angle = (index / 6) * Math.PI * 2;
        const distance = 5 + index * 1.5;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        // Deterministic y position based on index
        const y = (Math.sin(index * 1.5) * 0.5) * 2;

        const scale = 0.3 + (repo.commitsByUser2025 / maxCommits) * 0.7;
        const color = ROLE_COLORS[repo.role] || ROLE_COLORS.SHUTTLE;

        return (
          <group key={repo.fullName} position={[x, y, z]}>
            {/* Planet */}
            <Sphere args={[1, 32, 32]} scale={scale}>
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.2}
                roughness={0.4}
                metalness={0.6}
              />
            </Sphere>

            {/* Ring for flagship repos */}
            {repo.role === 'FLAGSHIP' && (
              <Ring args={[1.3, 1.5, 32]} scale={scale} rotation={[Math.PI / 2, 0, 0]}>
                <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
              </Ring>
            )}

            {/* Glow for high-activity repos */}
            {repo.commitsByUser2025 > maxCommits * 0.5 && (
              <pointLight color={color} intensity={0.3} distance={5} />
            )}
          </group>
        );
      })}
    </group>
  );
}
