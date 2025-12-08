'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars as DreiStars, Float, Trail } from '@react-three/drei';
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

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      {monthlyData.map((data, index) => {
        const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const intensity = data.count / maxCount;
        const nodeScale = 0.15 + intensity * 0.4;

        return (
          <Float key={data.month} speed={2} floatIntensity={0.5}>
            <group position={[x, 0, z]}>
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
      {repos.slice(0, 8).map((repo, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 12 + (i % 3) * 2;
        const height = (seededRandom(i * 50) - 0.5) * 4;
        const scale = 0.3 + (repo.commitsByUser2025 / 100) * 0.3;

        return (
          <Float key={repo.fullName} speed={1 + seededRandom(i) * 2} floatIntensity={0.3}>
            <group position={[Math.cos(angle) * distance, height, Math.sin(angle) * distance]}>
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

function Scene({ totalContributions, monthlyData, repos }: DashboardSceneProps) {
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.1} />

      {/* Nebula background clouds */}
      <NebulaCloud position={[-40, 20, -60]} color="#7c3aed" scale={3} />
      <NebulaCloud position={[50, -10, -50]} color="#0ea5e9" scale={2.5} />
      <NebulaCloud position={[0, 30, -70]} color="#f97316" scale={2} />
      <NebulaCloud position={[-30, -20, -40]} color="#ec4899" scale={1.5} />

      {/* Central star */}
      <CentralStar contributions={totalContributions} />

      {/* Multiple orbit rings */}
      <GlowingOrbit radius={5} color="#f97316" speed={1.2} />
      <GlowingOrbit radius={8} color="#38bdf8" speed={0.8} />
      <GlowingOrbit radius={11} color="#a78bfa" speed={0.5} />

      {/* Activity nodes */}
      <ActivityNodes monthlyData={monthlyData} radius={8} />

      {/* Repository crystals */}
      <RepoCrystals repos={repos} />

      {/* Ambient dust */}
      <SpaceDust />

      {/* Shooting stars */}
      <ShootingStar />
      <ShootingStar />
      <ShootingStar />

      {/* Camera controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 4}
        maxDistance={40}
        minDistance={15}
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
