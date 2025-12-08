'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CollaboratorData {
  username: string;
  avatarUrl: string | null;
  interactionScore: number;
}

interface SquadronFormationProps {
  collaborators: CollaboratorData[];
}

// Ship component representing a collaborator
function Ship({ collaborator, index }: {
  collaborator: CollaboratorData;
  index: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  // Calculate position in formation (V-shape or diamond pattern)
  const position = useMemo(() => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const offset = row % 2 === 0 ? 0 : 1.5;

    return [
      (col - 1) * 3 + offset,
      -row * 2 + 2,
      -row * 4 - 15
    ] as [number, number, number];
  }, [index]);

  // Ship color based on interaction score
  const color = useMemo(() => {
    const score = collaborator.interactionScore;
    if (score > 50) return '#a855f7'; // Purple - high interaction
    if (score > 20) return '#3b82f6'; // Blue - medium
    return '#6b7280'; // Gray - low
  }, [collaborator.interactionScore]);

  // Animate ship hover and engine glow
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle hover effect
      const seed = index * 100;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + seed) * 0.1;
      meshRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 1.5 + seed) * 0.05;
    }
    if (glowRef.current) {
      // Pulsing engine glow
      glowRef.current.intensity = 0.3 + Math.sin(state.clock.elapsedTime * 3 + index) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Ship body - simplified spacecraft shape */}
      <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
        {/* Main hull */}
        <coneGeometry args={[0.3, 1, 4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Wings */}
      <mesh position={[0, 0, 0.2]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.8, 0.05, 0.3]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Engine glow */}
      <pointLight
        ref={glowRef}
        position={[0, 0, 0.6]}
        color="#60a5fa"
        intensity={0.3}
        distance={3}
      />

      {/* Engine trail particles */}
      <mesh position={[0, 0, 0.7]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

export function SquadronFormation({ collaborators }: SquadronFormationProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Slow rotation of entire formation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {collaborators.slice(0, 9).map((collab, index) => (
        <Ship
          key={collab.username}
          collaborator={collab}
          index={index}
        />
      ))}
    </group>
  );
}
