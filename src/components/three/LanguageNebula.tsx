'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LanguageData {
  language: string;
  contributionShare: number;
  color: string | null;
}

interface LanguageNebulaProps {
  languages: LanguageData[];
}

// Seeded random for deterministic particle positions
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Default colors for common languages
const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#239120',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Scala: '#c22d40',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  default: '#6b7280',
};

function LanguageCloud({ share, color, index }: {
  share: number;
  color: string;
  index: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const particleCount = Math.max(50, Math.floor(share * 20));

  // Generate deterministic particle positions based on language index
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const baseAngle = (index / 8) * Math.PI * 2;
    const distance = 8 + index * 2;
    const centerX = Math.cos(baseAngle) * distance;
    const centerZ = Math.sin(baseAngle) * distance;
    const centerY = (seededRandom(index * 100) - 0.5) * 4;

    for (let i = 0; i < particleCount; i++) {
      const seed = index * 1000 + i;
      const spreadX = (seededRandom(seed) - 0.5) * (2 + share * 0.05);
      const spreadY = (seededRandom(seed + 1) - 0.5) * (2 + share * 0.05);
      const spreadZ = (seededRandom(seed + 2) - 0.5) * (2 + share * 0.05);

      pos[i * 3] = centerX + spreadX;
      pos[i * 3 + 1] = centerY + spreadY;
      pos[i * 3 + 2] = centerZ + spreadZ;
    }
    return pos;
  }, [particleCount, index, share]);

  // Animate gentle drift
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.02 + index * 0.5;
    }
  });

  const threeColor = new THREE.Color(color);

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <float32BufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          color={threeColor}
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* Core glow */}
      <mesh position={[
        Math.cos((index / 8) * Math.PI * 2) * (8 + index * 2),
        (seededRandom(index * 100) - 0.5) * 4,
        Math.sin((index / 8) * Math.PI * 2) * (8 + index * 2)
      ]}>
        <sphereGeometry args={[0.3 + share * 0.02, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

export function LanguageNebula({ languages }: LanguageNebulaProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      {languages.slice(0, 8).map((lang, index) => {
        const color = lang.color || LANGUAGE_COLORS[lang.language] || LANGUAGE_COLORS.default;
        return (
          <LanguageCloud
            key={lang.language}
            share={lang.contributionShare}
            color={color}
            index={index}
          />
        );
      })}
    </group>
  );
}
