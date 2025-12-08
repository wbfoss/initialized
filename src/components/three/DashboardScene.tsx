'use client';

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { OverviewStar } from './OverviewStar';
import { ActivityOrbit } from './ActivityOrbit';
import { RepoConstellation } from './RepoConstellation';
import { LanguageNebula } from './LanguageNebula';
import { SquadronFormation } from './SquadronFormation';
import { AchievementHall } from './AchievementHall';

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

function Scene({ totalContributions, monthlyData, repos, languages, collaborators, achievements }: DashboardSceneProps) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />

      {/* Central star */}
      <OverviewStar contributions={totalContributions} position={[0, 0, 0]} />

      {/* Monthly activity orbit */}
      <ActivityOrbit monthlyData={monthlyData} radius={6} />

      {/* Repository constellation */}
      <RepoConstellation repos={repos} />

      {/* Language nebula clouds */}
      {languages && languages.length > 0 && (
        <LanguageNebula languages={languages} />
      )}

      {/* Collaborator squadron */}
      {collaborators && collaborators.length > 0 && (
        <SquadronFormation collaborators={collaborators} />
      )}

      {/* Achievement hall */}
      {achievements && achievements.length > 0 && (
        <AchievementHall achievements={achievements} />
      )}

      {/* Camera controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
      />
    </>
  );
}

// Seeded random number generator for deterministic results
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function Stars() {
  const count = 3000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (seededRandom(i * 3 + 1000) - 0.5) * 100;
      pos[i * 3 + 1] = (seededRandom(i * 3 + 1001) - 0.5) * 100;
      pos[i * 3 + 2] = (seededRandom(i * 3 + 1002) - 0.5) * 100;
    }
    return pos;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <float32BufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#ffffff" transparent opacity={0.6} sizeAttenuation />
    </points>
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
    <div className="absolute inset-0 -z-10">
      <Canvas>
        <color attach="background" args={['#000000']} />
        <PerspectiveCamera makeDefault position={[0, 8, 25]} fov={60} />
        <fog attach="fog" args={['#000000', 25, 70]} />

        <Suspense fallback={null}>
          <Stars />
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
