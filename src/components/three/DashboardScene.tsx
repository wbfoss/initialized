'use client';

import { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars as DreiStars, Float, Trail, Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface DashboardSceneProps {
  totalContributions: number;
  monthlyData: Array<{ month: number; count: number }>;
  repos: Array<{
    fullName: string;
    starsGained2025: number;
    commitsByUser2025: number;
    role: string;
  }>;
  languages?: Array<{
    language: string;
    contributionShare: number;
    color: string | null;
  }>;
  collaborators?: Array<{
    username: string;
    avatarUrl: string | null;
    interactionScore: number;
  }>;
  achievements?: Array<{
    code: string;
    name: string;
    description: string;
    icon: string | null;
  }>;
}

// Seeded random for deterministic results
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Epic multi-layered starfield
function EpicStarfield() {
  // Layer 1: Distant small stars
  const farStars = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (seededRandom(i * 3) - 0.5) * 200;
      positions[i * 3 + 1] = (seededRandom(i * 3 + 1) - 0.5) * 200;
      positions[i * 3 + 2] = (seededRandom(i * 3 + 2) - 0.5) * 200;

      // Varied star colors: white, blue, yellow, orange
      const colorType = seededRandom(i * 7);
      if (colorType < 0.6) {
        colors[i * 3] = 1; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1; // White
      } else if (colorType < 0.75) {
        colors[i * 3] = 0.7; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 1; // Blue
      } else if (colorType < 0.9) {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 0.8; // Yellow
      } else {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.6; colors[i * 3 + 2] = 0.3; // Orange
      }

      sizes[i] = seededRandom(i * 5) * 0.5 + 0.1;
    }
    return { positions, colors, sizes };
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[farStars.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[farStars.colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[farStars.sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial size={0.15} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

// Animated nebula clouds
function NebulaCloud({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.02;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.01;
      const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 + 1;
      meshRef.current.scale.setScalar(scale * pulse);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[8, 32, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.03} side={THREE.DoubleSide} />
    </mesh>
  );
}

// Floating label component
function GalacticLabel({
  position,
  label,
  sublabel,
  color = '#22d3ee'
}: {
  position: [number, number, number];
  label: string;
  sublabel?: string;
  color?: string;
}) {
  return (
    <Html position={position} center distanceFactor={15} sprite>
      <div className="pointer-events-none select-none whitespace-nowrap">
        <div
          className="text-[10px] font-bold tracking-widest uppercase"
          style={{
            color,
            textShadow: `0 0 10px ${color}, 0 0 20px ${color}50`
          }}
        >
          {label}
        </div>
        {sublabel && (
          <div className="text-[8px] text-white/50 tracking-wider text-center">
            {sublabel}
          </div>
        )}
      </div>
    </Html>
  );
}

// Epic central star with corona and flares
function CentralStar({ contributions }: { contributions: number }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const flareRef = useRef<THREE.Group>(null);

  const scale = Math.min(2.5, Math.max(0.8, contributions / 800));

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.3;
      coreRef.current.rotation.x = t * 0.1;
    }

    if (coronaRef.current) {
      coronaRef.current.rotation.y = -t * 0.2;
      const pulse = Math.sin(t * 3) * 0.15 + 1;
      coronaRef.current.scale.setScalar(scale * 2 * pulse);
    }

    if (flareRef.current) {
      flareRef.current.rotation.z = t * 0.1;
    }
  });

  return (
    <group>
      {/* Label */}
      <GalacticLabel
        position={[0, scale * 3 + 1, 0]}
        label="Core Star"
        sublabel={`${contributions.toLocaleString()} contributions`}
        color="#f59e0b"
      />

      {/* Outer corona glow */}
      <mesh ref={coronaRef} scale={scale * 2}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.05} />
      </mesh>

      {/* Corona rays */}
      <mesh scale={scale * 1.8}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#fb923c" transparent opacity={0.08} />
      </mesh>

      {/* Main star surface */}
      <mesh ref={coreRef} scale={scale}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f97316"
          emissiveIntensity={2}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* White hot core */}
      <mesh scale={scale * 0.7}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>

      {/* Solar flares */}
      <group ref={flareRef}>
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((angle * Math.PI) / 180) * scale * 1.2,
              Math.sin((angle * Math.PI) / 180) * scale * 1.2,
              0
            ]}
            scale={[0.3, 0.8 + seededRandom(i * 100) * 0.5, 0.1]}
            rotation={[0, 0, (angle * Math.PI) / 180]}
          >
            <planeGeometry />
            <meshBasicMaterial color="#fcd34d" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>

      {/* Light sources */}
      <pointLight color="#f97316" intensity={5} distance={50} />
      <pointLight color="#fbbf24" intensity={3} distance={30} />
    </group>
  );
}

// Glowing orbit ring with particles
function GlowingOrbit({ radius, color, speed = 1 }: { radius: number; color: string; speed?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const ringGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [radius]);

  const particlePositions = useMemo(() => {
    const count = 50;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (seededRandom(i * 10) - 0.5) * 0.5;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, [radius]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.02 * speed;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05 * speed;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={new THREE.Line(ringGeometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.4 }))} />
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.15} color={color} transparent opacity={0.6} sizeAttenuation />
      </points>
    </group>
  );
}

// Monthly activity nodes on orbit
function ActivityNodes({ monthlyData, radius }: { monthlyData: Array<{ month: number; count: number }>; radius: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const maxCount = Math.max(...monthlyData.map((d) => d.count), 1);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Orbit label */}
      <GalacticLabel
        position={[radius + 2, 2, 0]}
        label="Activity Orbit"
        sublabel="Monthly patterns"
        color="#22d3ee"
      />

      {monthlyData.map((data, index) => {
        const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const intensity = data.count / maxCount;
        const nodeScale = 0.15 + intensity * 0.4;

        return (
          <Float key={data.month} speed={2} floatIntensity={0.5}>
            <group position={[x, 0, z]}>
              {/* Month label for high activity months */}
              {intensity > 0.6 && (
                <Html position={[0, nodeScale + 0.8, 0]} center distanceFactor={12} sprite>
                  <div className="pointer-events-none select-none text-center">
                    <div className="text-[8px] font-bold text-[#22d3ee]" style={{ textShadow: '0 0 8px #22d3ee' }}>
                      {monthNames[index]}
                    </div>
                    <div className="text-[7px] text-white/40">{data.count}</div>
                  </div>
                </Html>
              )}
              {/* Glow */}
              <mesh scale={nodeScale * 2}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.1 + intensity * 0.1} />
              </mesh>
              {/* Core */}
              <mesh scale={nodeScale}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial
                  color="#0ea5e9"
                  emissive="#0284c7"
                  emissiveIntensity={intensity}
                  roughness={0.2}
                  metalness={0.8}
                />
              </mesh>
              {intensity > 0.5 && <pointLight color="#38bdf8" intensity={intensity} distance={5} />}
            </group>
          </Float>
        );
      })}
    </group>
  );
}

// Floating repo crystals
function RepoCrystals({ repos }: { repos: DashboardSceneProps['repos'] }) {
  return (
    <group>
      {/* Section label */}
      <GalacticLabel
        position={[14, 4, 0]}
        label="Repo Crystals"
        sublabel={`${repos.length} repositories`}
        color="#a78bfa"
      />

      {repos.slice(0, 8).map((repo, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 12 + (i % 3) * 2;
        const height = (seededRandom(i * 50) - 0.5) * 4;
        const scale = 0.3 + (repo.commitsByUser2025 / 100) * 0.3;
        const repoName = repo.fullName.split('/')[1] || repo.fullName;

        return (
          <Float key={repo.fullName} speed={1 + seededRandom(i) * 2} floatIntensity={0.3}>
            <group position={[Math.cos(angle) * distance, height, Math.sin(angle) * distance]}>
              {/* Repo name label */}
              <Html position={[0, scale + 0.6, 0]} center distanceFactor={12} sprite>
                <div className="pointer-events-none select-none text-center">
                  <div
                    className="text-[7px] font-bold text-[#a78bfa] truncate max-w-[60px]"
                    style={{ textShadow: '0 0 6px #a78bfa' }}
                  >
                    {repoName.length > 10 ? repoName.slice(0, 10) + '…' : repoName}
                  </div>
                  <div className="text-[6px] text-white/30">{repo.commitsByUser2025} commits</div>
                </div>
              </Html>
              {/* Crystal glow */}
              <mesh scale={scale * 1.5}>
                <octahedronGeometry args={[1]} />
                <meshBasicMaterial color="#a78bfa" transparent opacity={0.1} />
              </mesh>
              {/* Crystal */}
              <mesh scale={scale} rotation={[0, i * 0.5, 0]}>
                <octahedronGeometry args={[1]} />
                <meshStandardMaterial
                  color="#8b5cf6"
                  emissive="#7c3aed"
                  emissiveIntensity={0.5}
                  roughness={0.1}
                  metalness={0.9}
                  transparent
                  opacity={0.8}
                />
              </mesh>
            </group>
          </Float>
        );
      })}
    </group>
  );
}

// Ambient dust particles
function SpaceDust() {
  const dustRef = useRef<THREE.Points>(null);

  const dustPositions = useMemo(() => {
    const count = 1000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (seededRandom(i * 11) - 0.5) * 80;
      positions[i * 3 + 1] = (seededRandom(i * 13) - 0.5) * 80;
      positions[i * 3 + 2] = (seededRandom(i * 17) - 0.5) * 80;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (dustRef.current) {
      dustRef.current.rotation.y = state.clock.elapsedTime * 0.005;
      dustRef.current.rotation.x = state.clock.elapsedTime * 0.003;
    }
  });

  return (
    <points ref={dustRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[dustPositions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#6366f1" transparent opacity={0.3} sizeAttenuation />
    </points>
  );
}

// Shooting star
function ShootingStar() {
  const ref = useRef<THREE.Mesh>(null);
  const startPos = useMemo(() => ({
    x: (Math.random() - 0.5) * 60,
    y: 20 + Math.random() * 20,
    z: -30 + Math.random() * 20,
  }), []);

  useFrame((state) => {
    if (ref.current) {
      const t = (state.clock.elapsedTime * 0.5) % 5;
      ref.current.position.x = startPos.x + t * 15;
      ref.current.position.y = startPos.y - t * 8;
      ref.current.position.z = startPos.z + t * 10;
      ref.current.visible = t < 1;
    }
  });

  return (
    <Trail width={0.5} length={8} color="#ffffff" attenuation={(t) => t * t}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.05]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </Trail>
  );
}

// Language nebula clouds with actual colors
function LanguageNebulas({ languages }: { languages?: DashboardSceneProps['languages'] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.015;
    }
  });

  if (!languages || languages.length === 0) return null;

  return (
    <group ref={groupRef}>
      {/* Section label */}
      <GalacticLabel
        position={[-18, 6, 0]}
        label="Language Nebulas"
        sublabel={`${languages.length} languages`}
        color="#ec4899"
      />

      {languages.slice(0, 6).map((lang, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const distance = 18 + (i % 2) * 5;
        const height = (seededRandom(i * 77) - 0.5) * 8;
        const color = lang.color || '#f59e0b';
        const scale = 0.5 + (lang.contributionShare / 100) * 2;

        return (
          <group key={lang.language} position={[Math.cos(angle) * distance, height, Math.sin(angle) * distance]}>
            {/* Language name label */}
            <Html position={[0, scale * 2 + 1, 0]} center distanceFactor={15} sprite>
              <div className="pointer-events-none select-none text-center">
                <div
                  className="text-[8px] font-bold"
                  style={{ color, textShadow: `0 0 8px ${color}` }}
                >
                  {lang.language}
                </div>
                <div className="text-[6px] text-white/40">{lang.contributionShare.toFixed(0)}%</div>
              </div>
            </Html>
            {/* Outer glow */}
            <mesh scale={scale * 3}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshBasicMaterial color={color} transparent opacity={0.03} />
            </mesh>
            {/* Middle cloud */}
            <mesh scale={scale * 2}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshBasicMaterial color={color} transparent opacity={0.06} />
            </mesh>
            {/* Core */}
            <Float speed={1.5} floatIntensity={0.3}>
              <mesh scale={scale}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.3}
                  transparent
                  opacity={0.4}
                />
              </mesh>
            </Float>
            {/* Sparkles around language */}
            <Sparkles count={20} scale={scale * 4} size={2} speed={0.4} color={color} />
          </group>
        );
      })}
    </group>
  );
}

// Achievement constellation - floating badge stars
function AchievementConstellation({ achievements }: { achievements?: DashboardSceneProps['achievements'] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = -state.clock.elapsedTime * 0.02;
    }
  });

  if (!achievements || achievements.length === 0) return null;

  const achievementColors: Record<string, string> = {
    NIGHT_OWL: '#6366f1',
    EARLY_BIRD: '#fbbf24',
    STREAK_MASTER: '#ef4444',
    CENTURY: '#10b981',
    POLYGLOT: '#8b5cf6',
    GALAXY_WANDERER: '#06b6d4',
    TEAM_PLAYER: '#f59e0b',
    CONSISTENT: '#22c55e',
    THOUSAND_CLUB: '#f97316',
    PR_MACHINE: '#3b82f6',
    STAR_COLLECTOR: '#eab308',
    BUG_HUNTER: '#dc2626',
    OPEN_SOURCERER: '#14b8a6',
    FIRST_CONTACT: '#a855f7',
    WARP_SPEED: '#0ea5e9',
    WEEKEND_WARRIOR: '#ec4899',
  };

  return (
    <group ref={groupRef} position={[0, 8, 0]}>
      {/* Section label */}
      <GalacticLabel
        position={[0, 6, 0]}
        label="Achievement Stars"
        sublabel={`${achievements.length} earned`}
        color="#fbbf24"
      />

      {achievements.slice(0, 12).map((achievement, i) => {
        const angle = (i / Math.min(achievements.length, 12)) * Math.PI * 2;
        const radius = 14 + (i % 3) * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(i * 1.5) * 3;
        const color = achievementColors[achievement.code] || '#f59e0b';

        return (
          <Float key={achievement.code} speed={2} floatIntensity={0.5}>
            <group position={[x, y, z]}>
              {/* Achievement name label */}
              <Html position={[0, 1.2, 0]} center distanceFactor={12} sprite>
                <div className="pointer-events-none select-none text-center">
                  <div
                    className="text-[7px] font-bold"
                    style={{ color, textShadow: `0 0 6px ${color}` }}
                  >
                    {achievement.name}
                  </div>
                </div>
              </Html>
              {/* Star glow */}
              <mesh scale={0.8}>
                <octahedronGeometry args={[1]} />
                <meshBasicMaterial color={color} transparent opacity={0.15} />
              </mesh>
              {/* Star core */}
              <mesh scale={0.4} rotation={[0, i * 0.5, Math.PI / 4]}>
                <octahedronGeometry args={[1]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={1}
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>
              <pointLight color={color} intensity={0.5} distance={5} />
            </group>
          </Float>
        );
      })}
    </group>
  );
}

// Warp speed lines effect
function WarpLines() {
  const linesRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = seededRandom(i * 23) * Math.PI * 2;
      const radius = 5 + seededRandom(i * 29) * 30;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (seededRandom(i * 31) - 0.5) * 40;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (linesRef.current) {
      const positions = linesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 2] += 0.3;
        if (positions[i * 3 + 2] > 40) {
          positions[i * 3 + 2] = -40;
        }
      }
      linesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#22d3ee" transparent opacity={0.3} sizeAttenuation />
    </points>
  );
}

// Pulsing energy rings around central star
function EnergyRings({ contributions }: { contributions: number }) {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.5;
      ring1Ref.current.rotation.y = t * 0.3;
      const scale = 3 + Math.sin(t * 2) * 0.3;
      ring1Ref.current.scale.setScalar(scale);
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -t * 0.4;
      ring2Ref.current.rotation.z = t * 0.2;
      const scale = 4 + Math.sin(t * 1.5 + 1) * 0.4;
      ring2Ref.current.scale.setScalar(scale);
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = t * 0.3;
      ring3Ref.current.rotation.z = -t * 0.25;
      const scale = 5 + Math.sin(t * 1.2 + 2) * 0.5;
      ring3Ref.current.scale.setScalar(scale);
    }
  });

  return (
    <group>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1, 0.02, 16, 100]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.4} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1, 0.015, 16, 100]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.3} />
      </mesh>
      <mesh ref={ring3Ref}>
        <torusGeometry args={[1, 0.01, 16, 100]} />
        <meshBasicMaterial color="#9370db" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function Scene({ totalContributions, monthlyData, repos, languages, achievements }: DashboardSceneProps) {
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.15} />

      {/* Nebula background clouds */}
      <NebulaCloud position={[-40, 20, -60]} color="#7c3aed" scale={3} />
      <NebulaCloud position={[50, -10, -50]} color="#0ea5e9" scale={2.5} />
      <NebulaCloud position={[0, 30, -70]} color="#f97316" scale={2} />
      <NebulaCloud position={[-30, -20, -40]} color="#ec4899" scale={1.5} />
      <NebulaCloud position={[30, 15, -55]} color="#22d3ee" scale={2} />

      {/* Central star with energy rings */}
      <CentralStar contributions={totalContributions} />
      <EnergyRings contributions={totalContributions} />

      {/* Multiple orbit rings */}
      <GlowingOrbit radius={5} color="#f97316" speed={1.2} />
      <GlowingOrbit radius={8} color="#38bdf8" speed={0.8} />
      <GlowingOrbit radius={11} color="#a78bfa" speed={0.5} />
      <GlowingOrbit radius={15} color="#22d3ee" speed={0.3} />

      {/* Activity nodes */}
      <ActivityNodes monthlyData={monthlyData} radius={8} />

      {/* Repository crystals */}
      <RepoCrystals repos={repos} />

      {/* Language nebulas */}
      <LanguageNebulas languages={languages} />

      {/* Achievement constellation */}
      <AchievementConstellation achievements={achievements} />

      {/* Warp lines effect */}
      <WarpLines />

      {/* Ambient dust */}
      <SpaceDust />

      {/* Shooting stars */}
      <ShootingStar />
      <ShootingStar />
      <ShootingStar />
      <ShootingStar />
      <ShootingStar />

      {/* Global sparkles */}
      <Sparkles count={100} scale={50} size={1} speed={0.2} color="#ffffff" opacity={0.3} />

      {/* Camera controls - more interactive */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        autoRotate
        autoRotateSpeed={0.2}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 6}
        maxDistance={50}
        minDistance={10}
        panSpeed={0.5}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
      />
    </>
  );
}

export function DashboardScene({
  totalContributions,
  monthlyData,
  repos,
  languages,
  collaborators,
  achievements,
}: DashboardSceneProps) {
  return (
    <div className="h-full w-full">
      <Canvas gl={{ antialias: true, alpha: false }} dpr={[1, 2]}>
        <color attach="background" args={['#030712']} />
        <PerspectiveCamera makeDefault position={[0, 12, 28]} fov={50} />
        <fog attach="fog" args={['#030712', 30, 80]} />

        <Suspense fallback={null}>
          {/* Epic starfield */}
          <EpicStarfield />
          <DreiStars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

          <Scene
            totalContributions={totalContributions}
            monthlyData={monthlyData}
            repos={repos}
            languages={languages}
            collaborators={collaborators}
            achievements={achievements}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
