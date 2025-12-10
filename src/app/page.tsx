'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Github, Rocket, Star, Users, Zap, Volume2, VolumeX, Maximize, Database, Cpu, Wifi, Shield, Activity, Radio, Terminal, Globe, Server, HardDrive, Network, Gauge, BarChart3 } from 'lucide-react';

type BootPhase = 'init' | 'systems' | 'database' | 'network' | 'ready';

interface BootMessage {
  text: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
}

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [bootPhase, setBootPhase] = useState<BootPhase>('init');
  const [bootComplete, setBootComplete] = useState(false);
  const [bootMessages, setBootMessages] = useState<BootMessage[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [smoothCursorPos, setSmoothCursorPos] = useState({ x: 0, y: 0 });
  const [showRipple, setShowRipple] = useState(false);
  const [ripplePos, setRipplePos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Smooth cursor interpolation
  useEffect(() => {
    if (isMobile) return;

    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const animate = () => {
      setSmoothCursorPos(prev => ({
        x: lerp(prev.x, cursorPos.x, 0.15),
        y: lerp(prev.y, cursorPos.y, 0.15)
      }));
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [cursorPos, isMobile]);

  const stardate = `${new Date().getFullYear()}.${Math.floor((Date.now() % 31536000000) / 86400000).toString().padStart(3, '0')}`;
  const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

  // Boot sequence
  useEffect(() => {
    setMounted(true);

    const bootSequence = async () => {
      const phases: { phase: BootPhase; messages: string[]; delay: number }[] = [
        { phase: 'init', messages: ['Initializing LCARS interface...', 'Loading core modules...', 'Establishing quantum link...'], delay: 400 },
        { phase: 'systems', messages: ['Activating sensor arrays...', 'Calibrating neural gel packs...', 'Engaging isolinear processors...'], delay: 350 },
        { phase: 'database', messages: ['Connecting to Federation database...', 'Synchronizing temporal buffers...', 'Loading user manifests...'], delay: 300 },
        { phase: 'network', messages: ['Establishing subspace connection...', 'Verifying security protocols...', 'Initializing GitHub interface...'], delay: 250 },
      ];

      for (const { phase, messages, delay } of phases) {
        setBootPhase(phase);
        for (const msg of messages) {
          setBootMessages(prev => [...prev, { text: msg, status: 'loading' }]);
          await new Promise(r => setTimeout(r, delay));
          setBootMessages(prev =>
            prev.map((m, i) => i === prev.length - 1 ? { ...m, status: 'complete' } : m)
          );
        }
      }

      setBootPhase('ready');
      await new Promise(r => setTimeout(r, 500));
      setBootComplete(true);
    };

    const timer = setTimeout(bootSequence, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/2025');
    }
  }, [status, router]);

  // Cursor tracking
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  }, []);

  // Ripple effect on click
  const handleClick = useCallback((e: React.MouseEvent) => {
    setRipplePos({ x: e.clientX, y: e.clientY });
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 600);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen]);

  if (status === 'loading' || !mounted || !bootComplete) {
    return <LcarsBootSequence bootPhase={bootPhase} bootMessages={bootMessages} />;
  }

  // Mobile layout
  if (isMobile) {
    return <MobileHomePage stardate={stardate} />;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden bg-black font-mono cursor-none select-none"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* Custom cursor - smooth interpolated */}
      <div
        className="pointer-events-none fixed z-[100]"
        style={{
          left: smoothCursorPos.x - 12,
          top: smoothCursorPos.y - 12,
        }}
      >
        <div className="w-6 h-6 border-2 border-cyan-400 rounded-full opacity-80" />
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
        {/* Trailing effect */}
        <div
          className="absolute top-1/2 left-1/2 w-4 h-4 border border-cyan-400/30 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{
            transform: `translate(-50%, -50%) scale(${1 + Math.abs(cursorPos.x - smoothCursorPos.x) / 50})`
          }}
        />
      </div>

      {/* Click ripple effect */}
      {showRipple && (
        <div
          className="pointer-events-none fixed z-[99]"
          style={{ left: ripplePos.x - 30, top: ripplePos.y - 30 }}
        >
          <div className="w-15 h-15 border-2 border-amber-500 rounded-full animate-ping opacity-60" />
          <div className="absolute inset-2 border border-cyan-400 rounded-full animate-ping opacity-40" style={{ animationDelay: '100ms' }} />
        </div>
      )}

      {/* Scan line effect */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.15) 2px, rgba(0,255,255,0.15) 4px)`
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
            <div className="h-12 w-40 bg-amber-500 rounded-br-[40px] flex items-center justify-end pr-4 gap-2">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-1.5 h-4 bg-black/30 rounded-sm animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                ))}
              </div>
              <span className="text-black text-xs font-bold tracking-wider">LCARS</span>
            </div>
            <div className="h-10 w-8 bg-amber-500" />
          </div>
          <div className="flex-1">
            <div className="h-12 bg-gradient-to-r from-amber-500 via-amber-600 to-cyan-500 flex items-center px-6">
              <span className="text-black text-xs font-bold uppercase tracking-widest">
                INITIALIZED.DEV // STARFLEET DEVELOPER COMMAND
              </span>
              <div className="flex-1" />
              <div className="flex items-center gap-4">
                <span className="text-black/70 text-[10px] font-bold">{currentTime}</span>
                <span className="text-black text-xs font-bold">STARDATE {stardate}</span>
              </div>
            </div>
            {/* Animated indicator bars */}
            <div className="flex h-3 gap-1 mt-1 px-2">
              {[...Array(40)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm transition-all duration-300 ${
                    i % 5 === 0 ? 'bg-cyan-400' :
                    i % 5 === 1 ? 'bg-amber-500' :
                    i % 5 === 2 ? 'bg-amber-600' :
                    i % 5 === 3 ? 'bg-cyan-600' : 'bg-amber-400'
                  }`}
                  style={{
                    opacity: 0.3 + Math.sin((Date.now() / 500 + i) * 0.5) * 0.3,
                    height: `${8 + Math.sin((Date.now() / 300 + i) * 0.3) * 4}px`,
                    animationDelay: `${i * 30}ms`
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="h-12 w-40 bg-cyan-500 rounded-bl-[40px] flex items-center pl-4 gap-2">
              <span className="text-black text-xs font-bold tracking-wider">2025</span>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-1.5 h-4 bg-black/30 rounded-sm animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                ))}
              </div>
            </div>
            <div className="h-10 w-8 bg-cyan-500" />
          </div>
        </div>
      </div>

      {/* Control buttons */}
      <div className="absolute top-28 right-4 z-30 flex flex-col gap-2">
        <button
          onClick={toggleFullscreen}
          className="w-10 h-10 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/50 rounded flex items-center justify-center transition-all cursor-pointer"
        >
          <Maximize className="w-4 h-4 text-amber-500" />
        </button>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="w-10 h-10 bg-cyan-400/20 hover:bg-cyan-400/40 border border-cyan-400/50 rounded flex items-center justify-center transition-all cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>

      {/* Main content - Three column layout */}
      <main className="relative z-10 h-full pt-28 pb-20 px-4">
        <div className="h-full max-w-7xl mx-auto flex gap-4">

          {/* Left Panel - System Status */}
          <div className="w-64 flex flex-col gap-3">
            <LcarsPanel title="SYSTEM STATUS" color="amber">
              <SystemStatusGrid />
            </LcarsPanel>

            <LcarsPanel title="POWER ALLOCATION" color="cyan">
              <PowerAllocationBars />
            </LcarsPanel>

            <LcarsPanel title="SENSOR ARRAY" color="amber">
              <SensorArray />
            </LcarsPanel>
          </div>

          {/* Center Panel - Main Interface */}
          <div className="flex-1 flex flex-col gap-3">
            {/* Main card */}
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm border border-amber-500/30 rounded-lg overflow-hidden">
                {/* Warp core visualization */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <WarpCoreVisualization />
                </div>

                {/* Content overlay */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
                  {/* Transmission header */}
                  <div className="flex items-center gap-3 mb-4">
                    <Radio className="h-5 w-5 text-cyan-400 animate-pulse" />
                    <span className="text-cyan-400 uppercase tracking-[0.3em] text-xs">Incoming Transmission</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-5xl md:text-6xl font-bold mb-3 tracking-tight">
                    <span className="text-amber-500">initialized</span>
                    <span className="text-cyan-400">.dev</span>
                  </h1>

                  <p className="text-cyan-400/70 text-sm mb-2 tracking-wide">
                    GITHUB YEAR IN REVIEW 2025
                  </p>
                  <p className="text-amber-500/50 text-xs mb-8 tracking-widest">
                    TRANSFORM YOUR CONTRIBUTIONS INTO A GALACTIC STAR MAP
                  </p>

                  {/* Main action button */}
                  <button
                    onClick={() => signIn('github')}
                    className="group relative px-12 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-widest rounded-r-full rounded-l-lg transition-all cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <div className="flex items-center gap-3">
                      <Github className="h-5 w-5" />
                      <span>Sign in with GitHub</span>
                    </div>
                  </button>

                  {/* Status indicators */}
                  <div className="flex items-center gap-6 mt-8 text-[10px]">
                    <StatusIndicator label="SYSTEMS" status="online" />
                    <StatusIndicator label="DATABASE" status="connected" />
                    <StatusIndicator label="SHIELDS" status="active" />
                  </div>

                  {/* Data stream visualization */}
                  <div className="mt-8 w-full max-w-md">
                    <DataStreamVisualization />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom stats bar */}
            <div className="h-20 bg-black/60 backdrop-blur-sm border border-amber-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between h-full">
                <QuickStat icon={<Users className="w-4 h-4" />} label="DEVELOPERS" value="10K+" color="cyan" />
                <QuickStat icon={<Star className="w-4 h-4" />} label="STARS MAPPED" value="1M+" color="amber" />
                <QuickStat icon={<Activity className="w-4 h-4" />} label="COMMITS" value="50M+" color="cyan" />
                <QuickStat icon={<Globe className="w-4 h-4" />} label="SECTORS" value="195" color="amber" />
              </div>
            </div>
          </div>

          {/* Right Panel - Features & Info */}
          <div className="w-64 flex flex-col gap-3">
            <LcarsPanel title="MISSION BRIEFING" color="cyan">
              <MissionBriefing />
            </LcarsPanel>

            <LcarsPanel title="ACTIVE SUBSYSTEMS" color="amber">
              <SubsystemList />
            </LcarsPanel>

            <LcarsPanel title="COMM FREQUENCY" color="cyan">
              <CommFrequency />
            </LcarsPanel>
          </div>
        </div>
      </main>

      {/* LCARS Bottom Frame */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* Animated data bar */}
        <div className="flex h-2 gap-0.5 mx-8 mb-1">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm transition-all duration-200"
              style={{
                backgroundColor: i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? '#22d3ee' : '#404040',
                opacity: 0.3 + Math.sin((Date.now() / 200 + i * 0.5)) * 0.4,
                transform: `scaleY(${0.5 + Math.sin((Date.now() / 150 + i * 0.3)) * 0.5})`
              }}
            />
          ))}
        </div>
        <div className="flex">
          <div className="flex flex-col-reverse">
            <div className="h-12 w-40 bg-amber-600 rounded-tr-[40px] flex items-center justify-end pr-4">
              <span className="text-black text-[10px] font-bold">NCC-2025</span>
            </div>
            <div className="h-8 w-8 bg-amber-600" />
          </div>
          <div className="flex-1 bg-black/50 border-t-4 border-amber-600 backdrop-blur-md">
            <div className="flex items-center justify-between py-2 px-4 text-[10px]">
              <div className="flex items-center gap-4">
                <span className="text-amber-500/50">FEDERATION STANDARD TIME: {currentTime}</span>
                <span className="text-cyan-400/50">SECTOR 001</span>
              </div>
              <a
                href="https://github.com/wbfoss/initialized"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-500 text-amber-500/50 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Github className="h-3 w-3" />
                OPEN SOURCE // GITHUB.COM/WBFOSS/INITIALIZED
              </a>
              <div className="flex items-center gap-4">
                <span className="text-cyan-400/50">PRESS F FOR FULLSCREEN</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col-reverse items-end">
            <div className="h-12 w-40 bg-cyan-600 rounded-tl-[40px] flex items-center pl-4">
              <span className="text-black text-[10px] font-bold">INITIALIZED</span>
            </div>
            <div className="h-8 w-8 bg-cyan-600" />
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

// Boot Sequence Component
function LcarsBootSequence({ bootPhase, bootMessages }: { bootPhase: BootPhase; bootMessages: BootMessage[] }) {
  const [progress, setProgress] = useState(0);
  const phaseProgress: Record<BootPhase, number> = {
    init: 25,
    systems: 50,
    database: 75,
    network: 90,
    ready: 100,
  };

  useEffect(() => {
    const target = phaseProgress[bootPhase];
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= target) return target;
        return p + 1;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [bootPhase]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col font-mono z-50 overflow-hidden">
      {/* Scan lines */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.05]"
        style={{
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.2) 2px, rgba(0,255,255,0.2) 4px)`
        }}
      />

      {/* Top LCARS bar */}
      <div className="flex h-16">
        <div className="w-48 bg-amber-500 rounded-br-[40px] flex items-center justify-end pr-6">
          <span className="text-black font-bold text-sm tracking-wider">LCARS 47</span>
        </div>
        <div className="flex-1 bg-gradient-to-r from-amber-500 via-amber-600 to-cyan-500 flex items-center px-6">
          <span className="text-black font-bold text-sm tracking-widest">SYSTEM INITIALIZATION</span>
        </div>
        <div className="w-48 bg-cyan-500 rounded-bl-[40px] flex items-center pl-6">
          <span className="text-black font-bold text-sm">{progress}%</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Left sidebar */}
        <div className="w-20 bg-amber-500 flex flex-col gap-2 p-2 items-end">
          {['01', '02', '03', '04', '05', '06', '07', '08'].map((n, i) => (
            <div
              key={n}
              className={`h-8 w-full rounded-l-full flex items-center justify-end pr-3 transition-all duration-300 ${
                i < Math.floor(progress / 12.5) ? 'bg-cyan-400' : 'bg-amber-600'
              }`}
            >
              <span className="text-black text-[10px] font-bold">{n}</span>
            </div>
          ))}
          <div className="flex-1" />
        </div>

        {/* Center content */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center">
          {/* Animated circles */}
          <div className="relative w-40 h-40 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 border-2 border-cyan-400 rounded-full animate-ping"
                style={{
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '1.5s',
                  opacity: 0.3 - i * 0.05
                }}
              />
            ))}
            <div className="absolute inset-4 border-4 border-amber-500 rounded-full animate-pulse" />
            <div className="absolute inset-8 border-2 border-cyan-400 rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-500">{progress}%</div>
                <div className="text-[10px] text-cyan-400 uppercase tracking-widest mt-1">Loading</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-96 mb-8">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-cyan-400 to-amber-500 transition-all duration-300 relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-cyan-400/50">
              <span>INIT</span>
              <span>SYSTEMS</span>
              <span>DATABASE</span>
              <span>NETWORK</span>
              <span>READY</span>
            </div>
          </div>

          {/* Boot messages */}
          <div className="w-96 h-48 bg-black/50 border border-amber-500/30 rounded p-4 overflow-hidden font-mono text-xs">
            <div className="flex flex-col gap-1">
              {bootMessages.slice(-8).map((msg, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    msg.status === 'complete' ? 'bg-green-400' :
                    msg.status === 'loading' ? 'bg-amber-500 animate-pulse' :
                    'bg-gray-600'
                  }`} />
                  <span className={msg.status === 'complete' ? 'text-green-400' : 'text-cyan-400'}>
                    {msg.text}
                  </span>
                  {msg.status === 'complete' && (
                    <span className="text-green-400 ml-auto">[OK]</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Status text */}
          <div className="mt-8 text-cyan-400 text-sm uppercase tracking-[0.3em] animate-pulse">
            {bootPhase === 'init' && 'Initializing Core Systems...'}
            {bootPhase === 'systems' && 'Activating Subsystems...'}
            {bootPhase === 'database' && 'Connecting to Database...'}
            {bootPhase === 'network' && 'Establishing Network Link...'}
            {bootPhase === 'ready' && 'Systems Online'}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-20 bg-cyan-500 flex flex-col gap-2 p-2">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`h-8 w-full rounded-r-full flex items-center pl-3 transition-all duration-300 ${
                i < Math.floor(progress / 12.5) ? 'bg-amber-500' : 'bg-cyan-600'
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
          <div className="flex-1" />
        </div>
      </div>

      {/* Bottom LCARS bar */}
      <div className="flex h-12">
        <div className="w-48 bg-amber-600 rounded-tr-[40px]" />
        <div className="flex-1 bg-gradient-to-r from-amber-600 via-cyan-600 to-amber-600 flex items-center justify-center">
          <span className="text-black font-bold text-[10px] tracking-widest">
            INITIALIZED.DEV // FEDERATION DEVELOPER NETWORK // STARFLEET COMMAND
          </span>
        </div>
        <div className="w-48 bg-cyan-600 rounded-tl-[40px]" />
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
}

// LCARS Panel Component
function LcarsPanel({ title, color, children }: { title: string; color: 'amber' | 'cyan'; children: React.ReactNode }) {
  const colors = {
    amber: { bg: 'bg-amber-500', accent: 'bg-amber-600', border: 'border-amber-500/30', text: 'text-amber-500' },
    cyan: { bg: 'bg-cyan-500', accent: 'bg-cyan-600', border: 'border-cyan-400/30', text: 'text-cyan-400' },
  };
  const c = colors[color];

  return (
    <div className={`bg-black/60 backdrop-blur-sm ${c.border} border rounded-lg overflow-hidden`}>
      <div className={`${c.bg} px-3 py-1.5 flex items-center gap-2`}>
        <div className={`w-8 h-4 ${c.accent} rounded-l-full`} />
        <span className="text-black text-[10px] font-bold tracking-wider flex-1">{title}</span>
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-1 h-3 bg-black/30 rounded-sm" />
          ))}
        </div>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

// System Status Grid
function SystemStatusGrid() {
  const systems = [
    { icon: <Cpu className="w-3 h-3" />, name: 'CORE', status: 98 },
    { icon: <Database className="w-3 h-3" />, name: 'DATA', status: 100 },
    { icon: <Shield className="w-3 h-3" />, name: 'SHIELD', status: 95 },
    { icon: <Wifi className="w-3 h-3" />, name: 'COMM', status: 87 },
    { icon: <Server className="w-3 h-3" />, name: 'SERVER', status: 100 },
    { icon: <Network className="w-3 h-3" />, name: 'NET', status: 92 },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {systems.map((sys, i) => (
        <div key={i} className="flex items-center gap-2 bg-black/30 rounded p-2">
          <div className="text-cyan-400">{sys.icon}</div>
          <div className="flex-1">
            <div className="text-[9px] text-amber-500/70">{sys.name}</div>
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${sys.status > 90 ? 'bg-green-400' : sys.status > 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${sys.status}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-cyan-400">{sys.status}%</span>
        </div>
      ))}
    </div>
  );
}

// Power Allocation Bars
function PowerAllocationBars() {
  const [powers, setPowers] = useState([65, 45, 80, 55, 70, 40]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPowers(p => p.map(v => Math.max(20, Math.min(100, v + (Math.random() - 0.5) * 10))));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const labels = ['WARP', 'PHASER', 'SHIELD', 'SENSOR', 'LIFE', 'AUX'];

  return (
    <div className="space-y-2">
      {powers.map((power, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-[9px] text-amber-500/70 w-12">{labels[i]}</span>
          <div className="flex-1 h-3 bg-gray-800/50 rounded overflow-hidden flex gap-0.5 p-0.5">
            {[...Array(10)].map((_, j) => (
              <div
                key={j}
                className={`flex-1 rounded-sm transition-all duration-300 ${
                  j < power / 10 ? (i % 2 === 0 ? 'bg-cyan-400' : 'bg-amber-500') : 'bg-gray-700'
                }`}
                style={{ opacity: j < power / 10 ? 0.5 + (j / 20) : 0.2 }}
              />
            ))}
          </div>
          <span className="text-[10px] text-cyan-400 w-8 text-right">{Math.round(power)}%</span>
        </div>
      ))}
    </div>
  );
}

// Sensor Array
function SensorArray() {
  return (
    <div className="relative h-32">
      {/* Radar sweep */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-28 h-28">
          {/* Concentric circles */}
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-cyan-400/20"
              style={{
                inset: `${i * 14}px`,
              }}
            />
          ))}
          {/* Sweep line */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
            <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent origin-left" />
          </div>
          {/* Blips */}
          {[
            { x: 30, y: 20 },
            { x: 70, y: 40 },
            { x: 45, y: 75 },
          ].map((pos, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-amber-500 rounded-full animate-pulse"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, animationDelay: `${i * 200}ms` }}
            />
          ))}
          {/* Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Mission Briefing
function MissionBriefing() {
  const missions = [
    { icon: <Github className="w-3 h-3" />, title: 'CONNECT', desc: 'Link GitHub account securely' },
    { icon: <Star className="w-3 h-3" />, title: 'GENERATE', desc: 'Create 3D galactic visualization' },
    { icon: <Users className="w-3 h-3" />, title: 'SHARE', desc: 'Explore and share your stats' },
    { icon: <Rocket className="w-3 h-3" />, title: 'ACHIEVE', desc: 'Unlock unique achievements' },
  ];

  return (
    <div className="space-y-2">
      {missions.map((m, i) => (
        <div key={i} className="flex items-start gap-2 p-2 bg-black/30 rounded hover:bg-cyan-400/10 transition-colors cursor-pointer">
          <div className="text-amber-500 mt-0.5">{m.icon}</div>
          <div>
            <div className="text-[10px] text-cyan-400 font-bold">{m.title}</div>
            <div className="text-[9px] text-gray-500">{m.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Subsystem List
function SubsystemList() {
  const subsystems = [
    { name: 'GitHub API', status: 'online' },
    { name: '3D Renderer', status: 'online' },
    { name: 'OAuth Service', status: 'online' },
    { name: 'Stats Engine', status: 'standby' },
    { name: 'Achievement Sys', status: 'online' },
  ];

  return (
    <div className="space-y-1.5">
      {subsystems.map((s, i) => (
        <div key={i} className="flex items-center justify-between text-[10px]">
          <span className="text-amber-500/70">{s.name}</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              s.status === 'online' ? 'bg-green-400' : 'bg-amber-500'
            }`} />
            <span className={s.status === 'online' ? 'text-green-400' : 'text-amber-500'}>
              {s.status.toUpperCase()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Comm Frequency
function CommFrequency() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-amber-500/70">FREQUENCY</span>
        <span className="text-[10px] text-cyan-400">47.125 GHz</span>
      </div>
      <div className="h-12 bg-black/30 rounded overflow-hidden flex items-end gap-0.5 p-1">
        {[...Array(20)].map((_, i) => {
          const height = 20 + Math.sin(Date.now() / 200 + i * 0.5) * 30 + Math.random() * 20;
          return (
            <div
              key={i}
              className="flex-1 bg-cyan-400 rounded-t transition-all duration-150"
              style={{ height: `${height}%`, opacity: 0.4 + (height / 100) * 0.6 }}
            />
          );
        })}
      </div>
      <div className="text-[9px] text-center text-amber-500/50">SUBSPACE CHANNEL ACTIVE</div>
    </div>
  );
}

// Warp Core Visualization
function WarpCoreVisualization() {
  return (
    <div className="relative w-96 h-96">
      {/* Outer rings */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-cyan-400/10"
          style={{
            inset: `${i * 30}px`,
            animation: `spin ${10 + i * 2}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
          }}
        />
      ))}
      {/* Core glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 bg-cyan-400/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute w-16 h-16 bg-amber-500/30 rounded-full blur-lg animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute w-8 h-8 bg-white/40 rounded-full blur-md animate-pulse" />
      </div>
    </div>
  );
}

// Data Stream Visualization
function DataStreamVisualization() {
  return (
    <div className="h-16 bg-black/30 rounded border border-cyan-400/20 overflow-hidden relative">
      <div className="absolute inset-0 flex items-center">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="h-full w-1 mx-0.5"
            style={{
              background: `linear-gradient(to top, transparent, ${i % 3 === 0 ? '#22d3ee' : '#f59e0b'}, transparent)`,
              height: `${30 + Math.sin(Date.now() / 100 + i * 0.3) * 40}%`,
              opacity: 0.3 + Math.sin(Date.now() / 150 + i * 0.5) * 0.3,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[9px] text-cyan-400/70 tracking-widest">DATA STREAM ACTIVE</span>
      </div>
    </div>
  );
}

// Status Indicator
function StatusIndicator({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full animate-pulse ${
        status === 'online' || status === 'connected' || status === 'active' ? 'bg-green-400' : 'bg-amber-500'
      }`} />
      <span className="text-amber-500/70">{label}:</span>
      <span className="text-green-400 uppercase">{status}</span>
    </div>
  );
}

// Quick Stat
function QuickStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: 'amber' | 'cyan' }) {
  const colors = {
    amber: 'text-amber-500',
    cyan: 'text-cyan-400',
  };

  return (
    <div className="flex items-center gap-3 px-4">
      <div className={colors[color]}>{icon}</div>
      <div>
        <div className="text-[9px] text-gray-500 tracking-wider">{label}</div>
        <div className={`text-lg font-bold ${colors[color]}`}>{value}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MOBILE HOME PAGE
// ═══════════════════════════════════════════════════════════════════════════

function MobileHomePage({ stardate }: { stardate: string }) {
  const [showDesktopTip, setShowDesktopTip] = useState(true);

  return (
    <div className="fixed inset-0 overflow-auto bg-black font-mono">
      {/* Scan lines */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
        style={{
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)`
        }}
      />

      {/* Starfield background */}
      <div className="fixed inset-0 overflow-hidden opacity-30">
        <div className="stars" />
      </div>

      {/* Desktop recommendation banner */}
      {showDesktopTip && (
        <div className="sticky top-0 z-40 bg-gradient-to-r from-amber-500 via-cyan-500 to-amber-500 py-2 px-3 flex items-center justify-between">
          <span className="text-black text-[9px] font-bold tracking-wide flex-1 text-center">
            BEST VIEWED ON DESKTOP FOR FULL 3D EXPERIENCE
          </span>
          <button
            onClick={() => setShowDesktopTip(false)}
            className="text-black/70 hover:text-black text-xs font-bold px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top LCARS bar */}
      <div className={`sticky ${showDesktopTip ? 'top-8' : 'top-0'} z-30 flex h-14`}>
        <div className="w-20 bg-amber-500 rounded-br-[30px] flex items-center justify-end pr-3">
          <span className="text-black text-[10px] font-bold">LCARS</span>
        </div>
        <div className="flex-1 bg-gradient-to-r from-amber-500 to-cyan-500 flex items-center justify-center">
          <span className="text-black text-[10px] font-bold tracking-widest">INITIALIZED.DEV</span>
        </div>
        <div className="w-20 bg-cyan-500 rounded-bl-[30px] flex items-center pl-3">
          <span className="text-black text-[10px] font-bold">2025</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 py-6">
        {/* Status bar */}
        <div className="flex justify-between items-center mb-6 text-[9px]">
          <span className="text-amber-500/60">STARDATE {stardate}</span>
          <span className="text-cyan-400/60 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            ONLINE
          </span>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>

          <h1 className="text-4xl font-bold mb-2">
            <span className="text-amber-500">initialized</span>
            <span className="text-cyan-400">.dev</span>
          </h1>

          <p className="text-cyan-400/70 text-xs mb-1">GITHUB YEAR IN REVIEW 2025</p>
          <p className="text-amber-500/50 text-[10px] tracking-wider mb-6">
            YOUR CONTRIBUTIONS AS A GALACTIC MAP
          </p>

          {/* Sign in button */}
          <button
            onClick={() => signIn('github')}
            className="w-full max-w-xs mx-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-widest rounded-r-full rounded-l-lg transition-all cursor-pointer flex items-center justify-center gap-3"
          >
            <Github className="h-5 w-5" />
            <span>Sign in with GitHub</span>
          </button>
        </div>

        {/* Status indicators */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <MobileStatusCard label="SYSTEMS" status="ONLINE" color="green" />
          <MobileStatusCard label="DATABASE" status="READY" color="cyan" />
          <MobileStatusCard label="SHIELDS" status="ACTIVE" color="amber" />
        </div>

        {/* Features */}
        <div className="bg-black/60 border border-amber-500/30 rounded-lg overflow-hidden mb-6">
          <div className="bg-amber-500 px-3 py-2">
            <span className="text-black text-[10px] font-bold tracking-widest">MISSION BRIEFING</span>
          </div>
          <div className="p-3 space-y-3">
            <MobileFeatureRow icon={<Github className="w-4 h-4" />} title="CONNECT" desc="Link your GitHub account" />
            <MobileFeatureRow icon={<Star className="w-4 h-4" />} title="GENERATE" desc="Create 3D visualization" />
            <MobileFeatureRow icon={<Users className="w-4 h-4" />} title="SHARE" desc="Share your stats" />
            <MobileFeatureRow icon={<Rocket className="w-4 h-4" />} title="ACHIEVE" desc="Unlock achievements" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <MobileStatCard icon={<Users className="w-4 h-4" />} label="DEVELOPERS" value="10K+" />
          <MobileStatCard icon={<Star className="w-4 h-4" />} label="STARS" value="1M+" />
          <MobileStatCard icon={<Activity className="w-4 h-4" />} label="COMMITS" value="50M+" />
          <MobileStatCard icon={<Globe className="w-4 h-4" />} label="SECTORS" value="195" />
        </div>

        {/* Power bars animation */}
        <div className="bg-black/60 border border-cyan-400/30 rounded-lg overflow-hidden mb-6">
          <div className="bg-cyan-500 px-3 py-2">
            <span className="text-black text-[10px] font-bold tracking-widest">SYSTEM STATUS</span>
          </div>
          <div className="p-3">
            <MobilePowerBars />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="sticky bottom-0 z-30 flex h-12">
        <div className="w-16 bg-amber-600 rounded-tr-[25px]" />
        <div className="flex-1 bg-gradient-to-r from-amber-600 to-cyan-600 flex items-center justify-center">
          <a
            href="https://github.com/wbfoss/initialized"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black text-[9px] font-bold flex items-center gap-2"
          >
            <Github className="w-3 h-3" />
            OPEN SOURCE
          </a>
        </div>
        <div className="w-16 bg-cyan-600 rounded-tl-[25px]" />
      </div>

      <style jsx>{`
        .stars {
          position: absolute;
          width: 200%;
          height: 200%;
          background-image:
            radial-gradient(2px 2px at 20px 30px, white, transparent),
            radial-gradient(2px 2px at 40px 70px, white, transparent),
            radial-gradient(1px 1px at 90px 40px, white, transparent),
            radial-gradient(2px 2px at 160px 120px, white, transparent);
          background-size: 200px 200px;
          animation: twinkle 5s ease-in-out infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

function MobileStatusCard({ label, status, color }: { label: string; status: string; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-400',
    cyan: 'bg-cyan-400',
    amber: 'bg-amber-500',
  };

  return (
    <div className="bg-black/60 border border-amber-500/20 rounded p-2 text-center">
      <div className="flex items-center justify-center gap-1 mb-1">
        <span className={`w-1.5 h-1.5 rounded-full ${colors[color]} animate-pulse`} />
        <span className="text-[8px] text-gray-500">{label}</span>
      </div>
      <span className={`text-[10px] font-bold ${color === 'green' ? 'text-green-400' : color === 'cyan' ? 'text-cyan-400' : 'text-amber-500'}`}>
        {status}
      </span>
    </div>
  );
}

function MobileFeatureRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-amber-500">{icon}</div>
      <div>
        <div className="text-[10px] text-cyan-400 font-bold">{title}</div>
        <div className="text-[9px] text-gray-500">{desc}</div>
      </div>
    </div>
  );
}

function MobileStatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-black/60 border border-cyan-400/20 rounded p-3 text-center">
      <div className="text-cyan-400 mb-1 flex justify-center">{icon}</div>
      <div className="text-lg font-bold text-amber-500">{value}</div>
      <div className="text-[8px] text-gray-500">{label}</div>
    </div>
  );
}

function MobilePowerBars() {
  const systems = ['WARP', 'SHIELD', 'SENSOR', 'COMM'];
  const values = [85, 95, 70, 100];

  return (
    <div className="space-y-2">
      {systems.map((sys, i) => (
        <div key={sys} className="flex items-center gap-2">
          <span className="text-[9px] text-amber-500/70 w-14">{sys}</span>
          <div className="flex-1 flex gap-[2px]">
            {[...Array(10)].map((_, j) => (
              <div
                key={j}
                className={`flex-1 h-2 rounded-sm ${
                  j < values[i] / 10 ? (i % 2 === 0 ? 'bg-cyan-400' : 'bg-amber-500') : 'bg-gray-700'
                }`}
                style={{ opacity: j < values[i] / 10 ? 0.5 + (j / 20) : 0.2 }}
              />
            ))}
          </div>
          <span className="text-[10px] text-cyan-400 w-8 text-right">{values[i]}%</span>
        </div>
      ))}
    </div>
  );
}
