'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Github, Rocket, Star, Users, Radio, Zap } from 'lucide-react';

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (status === 'authenticated') {
      router.push('/2025');
    }
  }, [status, router]);

  const stardate = `${new Date().getFullYear()}.${Math.floor((Date.now() % 31536000000) / 86400000)}`;

  if (status === 'loading' || !mounted) {
    return <LcarsLoadingScreen />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-black font-mono">
      {/* Scan line effect */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
        style={{
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)`
        }}
      />

      {/* Animated starfield background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars" />
        <div className="stars2" />
        <div className="stars3" />
      </div>

      {/* LCARS Top Frame */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="flex">
          <div className="flex flex-col">
            <div className="h-10 w-32 bg-amber-500 rounded-br-[30px] flex items-center justify-end pr-4">
              <span className="text-black text-xs font-bold">LCARS</span>
            </div>
            <div className="h-8 w-6 bg-amber-500" />
          </div>
          <div className="flex-1">
            <div className="h-10 bg-gradient-to-r from-amber-500 via-amber-600 to-cyan-500 flex items-center px-4">
              <span className="text-black text-xs font-bold uppercase tracking-wider">
                INITIALIZED.DEV // STARFLEET COMMAND
              </span>
              <div className="flex-1" />
              <span className="text-black text-xs font-bold">STARDATE {stardate}</span>
            </div>
            <div className="flex h-2 gap-1 mt-1">
              {[...Array(25)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${i % 3 === 0 ? 'bg-cyan-400' : i % 3 === 1 ? 'bg-amber-500' : 'bg-amber-600'}`}
                  style={{ opacity: 0.2 + (i / 25) * 0.6, animationDelay: `${i * 50}ms` }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="h-10 w-32 bg-cyan-500 rounded-bl-[30px] flex items-center pl-4">
              <span className="text-black text-xs font-bold">2025</span>
            </div>
            <div className="h-8 w-6 bg-cyan-500" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          {/* LCARS Card Frame */}
          <div className="flex">
            <div className="w-20 h-12 bg-amber-500 rounded-tl-[30px]" />
            <div className="flex-1 flex flex-col">
              <div className="h-6 bg-amber-500" />
              <div className="flex-1 flex">
                <div className="w-3 bg-amber-500" />
                <div className="flex-1 bg-black border-t-4 border-l-4 border-amber-500" />
              </div>
            </div>
            <div className="w-6 flex flex-col">
              <div className="h-6 bg-cyan-400" />
              <div className="flex-1 bg-cyan-400/20" />
            </div>
          </div>

          {/* Content area */}
          <div className="flex">
            <div className="w-20 bg-amber-500 flex flex-col gap-1.5 p-1.5">
              {['01', '02', '03', '04', '05'].map(n => (
                <div key={n} className="h-6 bg-amber-600 rounded-l-full flex items-center justify-end pr-2">
                  <span className="text-black text-[10px] font-bold">{n}</span>
                </div>
              ))}
              <div className="flex-1" />
              <div className="h-10 bg-amber-600 rounded-l-full flex items-center justify-end pr-2">
                <span className="text-black text-[10px] font-bold">SYS</span>
              </div>
            </div>

            <div className="flex-1 bg-black border-l-4 border-amber-500 p-8">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <Radio className="h-5 w-5 text-cyan-400 animate-pulse" />
                <span className="text-cyan-400 uppercase tracking-widest text-xs">Incoming Transmission</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                <span className="text-amber-500">initialized</span>
                <span className="text-cyan-400">.dev</span>
              </h1>
              <p className="text-cyan-400/70 text-sm mb-8">
                GitHub Year in Review 2025 // Transform your contributions into a galactic star map
              </p>

              {/* Main action */}
              <button
                onClick={() => signIn('github')}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-widest rounded-r-full rounded-l-lg transition-all flex items-center justify-center gap-3 mb-6 cursor-pointer"
              >
                <Github className="h-5 w-5" />
                Sign in with GitHub
              </button>

              {/* Status */}
              <div className="flex items-center justify-center gap-4 text-[10px] mb-8">
                <span className="text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  SYSTEMS ONLINE
                </span>
                <span className="text-cyan-400/50">|</span>
                <span className="text-amber-500/70">FEDERATION DATABASE: CONNECTED</span>
              </div>

              {/* Features grid */}
              <div className="grid grid-cols-3 gap-4">
                <FeatureCard
                  icon={<Github className="h-4 w-4" />}
                  title="Connect"
                  desc="Link GitHub securely"
                  color="amber"
                />
                <FeatureCard
                  icon={<Star className="h-4 w-4" />}
                  title="Generate"
                  desc="3D galactic viz"
                  color="cyan"
                />
                <FeatureCard
                  icon={<Users className="h-4 w-4" />}
                  title="Share"
                  desc="Explore & share"
                  color="amber"
                />
              </div>

              {/* Power bars */}
              <div className="mt-6 pt-4 border-t border-amber-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-3 w-3 text-cyan-400" />
                  <span className="text-[9px] text-cyan-400 uppercase tracking-widest">System Status</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-sm transition-all duration-500 ${i < 14 ? 'bg-cyan-400' : 'bg-gray-700'}`}
                      style={{
                        opacity: i < 14 ? 0.4 + (i / 16) * 0.6 : 0.3,
                        animationDelay: `${i * 100}ms`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="w-6 bg-cyan-400/20" />
          </div>

          {/* LCARS Card Frame Bottom */}
          <div className="flex">
            <div className="w-20 h-12 bg-amber-500 rounded-bl-[30px]" />
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex">
                <div className="w-3 bg-amber-500" />
                <div className="flex-1 bg-black border-b-4 border-l-4 border-amber-500" />
              </div>
              <div className="h-6 bg-amber-600" />
            </div>
            <div className="w-6 flex flex-col">
              <div className="flex-1 bg-cyan-400/20" />
              <div className="h-6 bg-cyan-400" />
            </div>
          </div>
        </div>
      </main>

      {/* LCARS Bottom Frame */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="flex h-2 gap-1 mx-8 mb-1">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm ${i % 4 === 0 ? 'bg-amber-500' : i % 4 === 1 ? 'bg-cyan-400' : 'bg-gray-700'}`}
              style={{ opacity: Math.abs(15 - i) / 15 * 0.5 + 0.2 }}
            />
          ))}
        </div>
        <div className="flex">
          <div className="flex flex-col-reverse">
            <div className="h-10 w-32 bg-amber-600 rounded-tr-[30px]" />
            <div className="h-6 w-6 bg-amber-600" />
          </div>
          <div className="flex-1 bg-black/50 border-t-4 border-amber-600 backdrop-blur-md">
            <div className="flex items-center justify-center py-2 text-[10px] text-amber-500/50">
              <a
                href="https://github.com/wbfoss/initialized"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-500 transition-colors flex items-center gap-2"
              >
                <Github className="h-3 w-3" />
                OPEN SOURCE // GITHUB.COM/WBFOSS/INITIALIZED
              </a>
            </div>
          </div>
          <div className="flex flex-col-reverse items-end">
            <div className="h-10 w-32 bg-cyan-600 rounded-tl-[30px]" />
            <div className="h-6 w-6 bg-cyan-600" />
          </div>
        </div>
      </div>

      <style jsx>{`
        .stars, .stars2, .stars3 {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          background: transparent;
        }

        .stars {
          background-image:
            radial-gradient(2px 2px at 20px 30px, white, transparent),
            radial-gradient(2px 2px at 40px 70px, white, transparent),
            radial-gradient(1px 1px at 90px 40px, white, transparent),
            radial-gradient(2px 2px at 160px 120px, white, transparent),
            radial-gradient(1px 1px at 230px 80px, white, transparent),
            radial-gradient(2px 2px at 300px 150px, white, transparent),
            radial-gradient(1px 1px at 370px 50px, white, transparent),
            radial-gradient(2px 2px at 440px 180px, white, transparent);
          background-repeat: repeat;
          background-size: 500px 500px;
          animation: twinkle 5s ease-in-out infinite;
          opacity: 0.5;
        }

        .stars2 {
          background-image:
            radial-gradient(1px 1px at 50px 50px, #22d3ee, transparent),
            radial-gradient(1px 1px at 150px 130px, white, transparent),
            radial-gradient(2px 2px at 250px 80px, #f59e0b, transparent),
            radial-gradient(1px 1px at 350px 200px, white, transparent),
            radial-gradient(2px 2px at 450px 100px, #22d3ee, transparent);
          background-repeat: repeat;
          background-size: 600px 600px;
          animation: twinkle 7s ease-in-out infinite;
          animation-delay: 1s;
          opacity: 0.4;
        }

        .stars3 {
          background-image:
            radial-gradient(1px 1px at 100px 100px, #f59e0b, transparent),
            radial-gradient(2px 2px at 200px 200px, #22d3ee, transparent),
            radial-gradient(1px 1px at 300px 50px, white, transparent),
            radial-gradient(2px 2px at 400px 150px, #f59e0b, transparent);
          background-repeat: repeat;
          background-size: 700px 700px;
          animation: twinkle 9s ease-in-out infinite;
          animation-delay: 2s;
          opacity: 0.3;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

function LcarsLoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => p >= 100 ? 100 : p + Math.random() * 20);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center font-mono z-50">
      <div className="text-center">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="h-3 w-16 rounded-l-full bg-amber-500 animate-pulse" />
          <div className="h-3 w-6 bg-cyan-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="h-3 w-10 rounded-r-full bg-amber-600 animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>

        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        <div className="w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden mb-4 mx-auto">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-cyan-400 to-amber-500 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-cyan-400 text-xs uppercase tracking-widest animate-pulse">
          Establishing Subspace Link...
        </div>

        <div className="flex items-center gap-2 mt-8 justify-center">
          <div className="h-3 w-10 rounded-l-full bg-amber-600 animate-pulse" style={{ animationDelay: '0.4s' }} />
          <div className="h-3 w-6 bg-cyan-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="h-3 w-16 rounded-r-full bg-amber-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  color
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: 'amber' | 'cyan';
}) {
  const colors = {
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
    cyan: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-400',
  };

  return (
    <div className={`p-3 rounded border ${colors[color]} text-center`}>
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="text-[10px] font-bold uppercase tracking-wider">{title}</div>
      <div className="text-[8px] text-zinc-500 mt-0.5">{desc}</div>
    </div>
  );
}
