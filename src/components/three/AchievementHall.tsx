'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AchievementData {
  code: string;
  name: string;
  description: string;
  icon: string | null;
}

interface AchievementHallProps {
  achievements: AchievementData[];
}

// Badge/medal colors based on achievement type
const ACHIEVEMENT_COLORS: Record<string, string> = {
  COMMIT_STREAK: '#f59e0b', // Amber
  CENTURION: '#eab308', // Yellow
  POLYGLOT: '#8b5cf6', // Purple
  NIGHT_OWL: '#3b82f6', // Blue
  EARLY_BIRD: '#f97316', // Orange
  SOCIAL_BUTTERFLY: '#ec4899', // Pink
  STAR_COLLECTOR: '#fbbf24', // Gold
  default: '#a855f7', // Default purple
};

function Badge({ achievement, index, total }: {
  achievement: AchievementData;
  index: number;
  total: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const medalRef = useRef<THREE.Mesh>(null);

  // Arrange badges in a circular arc
  const position = useMemo(() => {
    const angle = ((index - (total - 1) / 2) / total) * Math.PI * 0.6;
    const radius = 12;
    return [
      Math.sin(angle) * radius,
      3 + Math.cos(index * 1.5) * 0.5,
      -Math.cos(angle) * radius - 5
    ] as [number, number, number];
  }, [index, total]);

  const color = ACHIEVEMENT_COLORS[achievement.code] || ACHIEVEMENT_COLORS.default;

  // Animate gentle float and rotation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + index * 2) * 0.15;
    }
    if (medalRef.current) {
      medalRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Medal/Badge base */}
      <mesh ref={medalRef}>
        {/* Outer ring */}
        <torusGeometry args={[0.6, 0.1, 16, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Inner disc */}
      <mesh>
        <circleGeometry args={[0.5, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          metalness={0.8}
          roughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Star decoration in center */}
      <mesh position={[0, 0, 0.05]}>
        <circleGeometry args={[0.2, 5]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>

      {/* Glow effect */}
      <pointLight color={color} intensity={0.5} distance={4} />

      {/* Ribbon/banner */}
      <mesh position={[0, -0.9, 0]}>
        <planeGeometry args={[0.3, 0.6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export function AchievementHall({ achievements }: AchievementHallProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Slow rotation of the hall
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  if (achievements.length === 0) {
    return null;
  }

  return (
    <group ref={groupRef}>
      {/* Ambient glow for the hall */}
      <pointLight position={[0, 5, -10]} color="#a855f7" intensity={0.3} distance={20} />

      {/* Achievement badges */}
      {achievements.slice(0, 8).map((achievement, index) => (
        <Badge
          key={achievement.code}
          achievement={achievement}
          index={index}
          total={Math.min(achievements.length, 8)}
        />
      ))}
    </group>
  );
}
