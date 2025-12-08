'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  GitCommit,
  GitPullRequest,
  AlertCircle,
  Star,
  Flame,
  Trophy,
  Settings,
  Share2,
  RefreshCw,
  LogOut,
  Check,
  ChevronLeft,
  ChevronRight,
  Radio,
  Zap,
  Maximize,
  Volume2,
  VolumeX,
  Camera,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const DashboardScene = dynamic(
  () => import('@/components/three/DashboardScene').then((mod) => mod.DashboardScene),
  { ssr: false, loading: () => <LcarsLoadingScreen /> }
);

// LCARS Loading Screen
function LcarsLoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => p >= 100 ? 100 : p + Math.random() * 15);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center">
        {/* LCARS Frame */}
        <div className="relative">
          {/* Top bar */}
          <div className="flex items-center gap-2 mb-8">
            <div className="h-3 w-20 rounded-l-full bg-amber-500 animate-pulse" />
            <div className="h-3 w-8 bg-cyan-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="h-3 w-12 rounded-r-full bg-amber-600 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>

          {/* Loading circles */}
          <div className="flex justify-center gap-4 mb-6">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-cyan-400 to-amber-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Status text */}
          <div className="font-mono text-cyan-400 text-sm uppercase tracking-widest animate-pulse">
            Initializing Stellar Cartography...
          </div>
          <div className="font-mono text-amber-500/50 text-xs mt-2">
            {progress.toFixed(0)}% COMPLETE
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <div className="h-3 w-12 rounded-l-full bg-amber-600 animate-pulse" style={{ animationDelay: '0.4s' }} />
            <div className="h-3 w-8 bg-cyan-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="h-3 w-20 rounded-r-full bg-amber-500 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface DashboardProps {
  user: {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string | null;
  };
  yearStats: {
    summaryJson: unknown;
    repos: Array<{
      fullName: string;
      description: string | null;
      starsGained2025: number;
      commitsByUser2025: number;
      role: string;
    }>;
    languages: Array<{
      language: string;
      contributionShare: number;
      color: string | null;
    }>;
    collaborators: Array<{
      username: string;
      avatarUrl: string | null;
      interactionScore: number;
    }>;
    lastFetchedAt: Date;
  } | null;
  achievements: Array<{
    code: string;
    name: string;
    description: string;
    icon: string | null;
    earnedAt: Date;
  }>;
  settings: {
    publicProfileEnabled: boolean;
    themeVariant: string;
  } | null;
}

interface SummaryStats {
  totalContributions: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalStarsEarned: number;
  longestStreak: number;
  currentStreak: number;
  contributionsByMonth: Array<{ month: number; count: number }>;
}

export function DashboardClient({ user, yearStats, achievements }: DashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [scanLine, setScanLine] = useState(0);

  const summary = yearStats?.summaryJson as SummaryStats | undefined;
  const needsRefresh = !yearStats;

  // Scanning animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanLine(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/stats/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: 2025 }),
      });
      window.location.reload();
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(`https://initialized.dev/u/${user.username}/2025`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const stardate = `${new Date().getFullYear()}.${Math.floor((Date.now() % 31536000000) / 86400000)}`;

  return (
    <div className="fixed inset-0 overflow-hidden bg-black font-mono">
      {/* Scan line effect */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)`
        }}
      />

      {/* Full-screen 3D Background */}
      {!needsRefresh && summary && (
        <div className="absolute inset-0">
          <DashboardScene
            totalContributions={summary.totalContributions}
            monthlyData={summary.contributionsByMonth || []}
            repos={yearStats?.repos || []}
            languages={yearStats?.languages || []}
            collaborators={yearStats?.collaborators || []}
            achievements={achievements.map((a) => ({
              code: a.code,
              name: a.name,
              description: a.description,
              icon: a.icon,
            }))}
          />
        </div>
      )}

      {needsRefresh ? (
        /* Initial Setup Screen - LCARS Style */
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="max-w-lg w-full mx-4">
            {/* LCARS Frame Top */}
            <div className="flex">
              <div className="w-24 h-16 bg-amber-500 rounded-tl-[40px]" />
              <div className="flex-1 flex flex-col">
                <div className="h-8 bg-amber-500" />
                <div className="flex-1 flex">
                  <div className="w-4 bg-amber-500" />
                  <div className="flex-1 bg-black border-t-4 border-l-4 border-amber-500" />
                </div>
              </div>
              <div className="w-8 flex flex-col">
                <div className="h-8 bg-cyan-400" />
                <div className="flex-1 bg-cyan-400/20" />
              </div>
            </div>

            {/* Content */}
            <div className="flex">
              <div className="w-24 bg-amber-500 flex flex-col gap-2 p-2">
                {['01', '02', '03', '04'].map(n => (
                  <div key={n} className="h-8 bg-amber-600 rounded-l-full flex items-center justify-end pr-2">
                    <span className="text-black text-xs font-bold">{n}</span>
                  </div>
                ))}
              </div>
              <div className="flex-1 bg-black border-l-4 border-amber-500 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Radio className="h-6 w-6 text-cyan-400 animate-pulse" />
                  <span className="text-cyan-400 uppercase tracking-widest text-sm">Awaiting Command Authorization</span>
                </div>

                <h2 className="text-2xl text-amber-500 uppercase tracking-wider mb-2">
                  Welcome, {user.name || user.username}
                </h2>
                <p className="text-cyan-400/70 text-sm mb-8">
                  Initialize stellar cartography subsystems to generate mission report for stardate {stardate}
                </p>

                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-widest rounded-r-full rounded-l-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isRefreshing ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      Engage
                    </>
                  )}
                </button>

                {/* Status indicators */}
                <div className="mt-6 grid grid-cols-3 gap-2">
                  {['WARP CORE', 'SENSORS', 'SHIELDS'].map((sys, i) => (
                    <div key={sys} className="text-center">
                      <div className={`h-1 rounded-full mb-1 ${i === 1 ? 'bg-cyan-400 animate-pulse' : 'bg-amber-600'}`} />
                      <span className="text-[10px] text-amber-500/50">{sys}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-8 bg-cyan-400/20" />
            </div>

            {/* LCARS Frame Bottom */}
            <div className="flex">
              <div className="w-24 h-16 bg-amber-500 rounded-bl-[40px]" />
              <div className="flex-1 flex flex-col">
                <div className="flex-1 flex">
                  <div className="w-4 bg-amber-500" />
                  <div className="flex-1 bg-black border-b-4 border-l-4 border-amber-500" />
                </div>
                <div className="h-8 bg-amber-600" />
              </div>
              <div className="w-8 flex flex-col">
                <div className="flex-1 bg-cyan-400/20" />
                <div className="h-8 bg-cyan-400" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* LCARS Top Frame */}
          <div className="absolute top-0 left-0 right-0 z-20">
            <div className="flex">
              {/* Left corner */}
              <div className="flex flex-col">
                <div className="h-10 w-32 bg-amber-500 rounded-br-[30px] flex items-center justify-end pr-4">
                  <span className="text-black text-xs font-bold">LCARS</span>
                </div>
                <div className="h-12 w-6 bg-amber-500" />
              </div>

              {/* Top bar with data */}
              <div className="flex-1">
                <div className="h-10 bg-gradient-to-r from-amber-500 via-amber-600 to-cyan-500 flex items-center px-4 gap-4">
                  <span className="text-black text-xs font-bold uppercase tracking-wider">
                    USS {user.username.toUpperCase()} // NCC-2025
                  </span>
                  <div className="flex-1" />
                  <span className="text-black text-xs font-bold">STARDATE {stardate}</span>
                </div>
                {/* Decorative bars */}
                <div className="flex h-3 gap-1 mt-1">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm ${i % 3 === 0 ? 'bg-cyan-400' : i % 3 === 1 ? 'bg-amber-500' : 'bg-amber-600'}`}
                      style={{ opacity: 0.3 + (i / 20) * 0.7 }}
                    />
                  ))}
                </div>
              </div>

              {/* Right corner */}
              <div className="flex flex-col items-end">
                <div className="h-10 w-32 bg-cyan-500 rounded-bl-[30px] flex items-center pl-4">
                  <span className="text-black text-xs font-bold">47-{Math.floor(Math.random() * 9000 + 1000)}</span>
                </div>
                <div className="h-12 w-6 bg-cyan-500" />
              </div>
            </div>
          </div>

          {/* Center HUD - Main Stats Display */}
          <div className="absolute top-28 left-1/2 -translate-x-1/2 z-10">
            <div className="relative">
              {/* Scanning effect */}
              <div
                className="absolute inset-0 bg-gradient-to-b from-cyan-400/20 via-transparent to-transparent pointer-events-none"
                style={{
                  height: '4px',
                  top: `${scanLine}%`,
                  transition: 'top 0.05s linear'
                }}
              />

              <div className="border-2 border-cyan-400/30 rounded-lg bg-black/70 backdrop-blur-md p-6">
                <div className="flex items-center gap-8">
                  {/* Contributions */}
                  <div className="text-center">
                    <div className="text-5xl font-bold text-amber-500 tabular-nums">
                      {(summary?.totalContributions || 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-cyan-400 uppercase tracking-[0.3em] mt-1">Contributions</div>
                    {/* Mini bar graph */}
                    <div className="flex gap-0.5 mt-2 justify-center">
                      {summary?.contributionsByMonth?.slice(-6).map((m, i) => (
                        <div
                          key={i}
                          className="w-2 bg-amber-500/60 rounded-t"
                          style={{ height: `${Math.max(4, (m.count / Math.max(...(summary?.contributionsByMonth?.map(x => x.count) || [1]))) * 20)}px` }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="w-px h-16 bg-cyan-400/30" />

                  {/* Streak */}
                  <div className="text-center">
                    <div className="text-5xl font-bold text-cyan-400 tabular-nums">
                      {summary?.longestStreak || 0}
                    </div>
                    <div className="text-[10px] text-amber-500 uppercase tracking-[0.3em] mt-1">Day Streak</div>
                    {/* Pulse indicator */}
                    <div className="flex gap-1 mt-2 justify-center">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status bar */}
                <div className="mt-4 pt-3 border-t border-cyan-400/20 flex items-center justify-center gap-4 text-[10px]">
                  <span className="text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    SYSTEMS ONLINE
                  </span>
                  <span className="text-cyan-400/50">|</span>
                  <span className="text-amber-500/70">QUANTUM SYNC: ACTIVE</span>
                </div>
              </div>
            </div>
          </div>

          {/* LEFT PANEL - Operations Data (Always Visible) */}
          <div className="absolute left-0 top-28 bottom-24 z-20">
            <div className="flex h-full">
              {/* LCARS Side frame */}
              <div className="w-6 bg-amber-500 flex flex-col">
                <div className="h-8 bg-amber-600 rounded-br-full" />
                <div className="flex-1" />
                <div className="h-8 bg-amber-600 rounded-tr-full" />
              </div>

              {/* Panel content */}
              <div className="w-56 bg-black/90 border-r-4 border-amber-500 backdrop-blur-md">
                <div className="bg-amber-500 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-black uppercase tracking-wider">Operations</span>
                  <span className="text-[10px] text-black/70">DECK 01</span>
                </div>

                <div className="p-3 space-y-2">
                  <LcarsDataRow icon={<GitCommit className="h-3 w-3" />} label="COMMITS" value={summary?.totalCommits || 0} color="amber" />
                  <LcarsDataRow icon={<GitPullRequest className="h-3 w-3" />} label="PULL REQ" value={summary?.totalPRs || 0} color="cyan" />
                  <LcarsDataRow icon={<AlertCircle className="h-3 w-3" />} label="ISSUES" value={summary?.totalIssues || 0} color="amber" />
                  <LcarsDataRow icon={<Star className="h-3 w-3" />} label="STARS" value={summary?.totalStarsEarned || 0} color="cyan" />
                  <LcarsDataRow icon={<Flame className="h-3 w-3" />} label="STREAK" value={summary?.currentStreak || 0} color="orange" />

                  {/* Languages */}
                  <div className="pt-3 mt-3 border-t border-amber-500/30">
                    <div className="text-[9px] text-amber-500 uppercase tracking-widest mb-2">Language Matrix</div>
                    <div className="space-y-1.5">
                      {yearStats?.languages.slice(0, 5).map((lang, i) => (
                        <div key={lang.language} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: lang.color || '#f59e0b' }} />
                          <span className="text-[10px] text-zinc-400 flex-1 truncate">{lang.language}</span>
                          <div className="w-12 h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000"
                              style={{
                                width: `${lang.contributionShare}%`,
                                backgroundColor: lang.color || '#f59e0b',
                                transitionDelay: `${i * 100}ms`
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Power levels visualization */}
                  <div className="pt-3 mt-3 border-t border-amber-500/30">
                    <div className="text-[9px] text-cyan-400 uppercase tracking-widest mb-2">Power Allocation</div>
                    <div className="grid grid-cols-4 gap-1">
                      {[...Array(16)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 rounded-sm ${i < 12 ? 'bg-cyan-400' : 'bg-gray-700'}`}
                          style={{ opacity: i < 12 ? 0.4 + (i / 16) * 0.6 : 0.3 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Mission Logs (Collapsible) */}
          <div className={`absolute right-0 top-28 bottom-24 z-20 transition-transform duration-300 ${rightPanelOpen ? 'translate-x-0' : 'translate-x-[calc(100%-3.5rem)]'}`}>
            <div className="flex h-full">
              {/* Toggle Button */}
              <button
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
                className="w-8 self-center bg-cyan-500 hover:bg-cyan-400 flex items-center justify-center py-8 rounded-l-lg transition-colors"
              >
                {rightPanelOpen ? <ChevronRight className="h-5 w-5 text-black" /> : <ChevronLeft className="h-5 w-5 text-black" />}
              </button>

              {/* Panel content */}
              <div className="w-56 bg-black/90 border-l-4 border-cyan-500 backdrop-blur-md">
                <div className="bg-cyan-500 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-black uppercase tracking-wider">Mission Log</span>
                  <span className="text-[10px] text-black/70">ALPHA</span>
                </div>

                <div className="p-3 space-y-3 max-h-[calc(100%-2.5rem)] overflow-y-auto">
                  {/* Achievements */}
                  <div>
                    <div className="text-[9px] text-cyan-400 uppercase tracking-widest mb-2">Commendations</div>
                    <div className="space-y-1.5">
                      {achievements.slice(0, 5).map((achievement) => (
                        <div key={achievement.code} className="flex items-center gap-2 p-1.5 rounded border border-amber-500/30 bg-amber-500/10">
                          <Trophy className="h-3 w-3 text-amber-500 flex-shrink-0" />
                          <span className="text-[10px] text-amber-400 truncate">{achievement.name}</span>
                        </div>
                      ))}
                      {achievements.length === 0 && (
                        <div className="text-[10px] text-zinc-600 italic">No commendations logged</div>
                      )}
                    </div>
                  </div>

                  {/* Repos */}
                  <div className="pt-3 border-t border-cyan-500/30">
                    <div className="text-[9px] text-cyan-400 uppercase tracking-widest mb-2">Fleet Registry</div>
                    <div className="space-y-1.5">
                      {yearStats?.repos.slice(0, 4).map((repo) => (
                        <div key={repo.fullName} className="p-1.5 rounded border border-cyan-500/30 bg-cyan-500/10">
                          <div className="text-[10px] text-cyan-400 truncate">{repo.fullName.split('/')[1]}</div>
                          <div className="flex items-center gap-2 mt-1 text-[9px] text-zinc-500">
                            <span className="flex items-center gap-0.5">
                              <Star className="h-2.5 w-2.5" /> {repo.starsGained2025}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <GitCommit className="h-2.5 w-2.5" /> {repo.commitsByUser2025}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* LCARS Side frame */}
              <div className="w-6 bg-cyan-500 flex flex-col">
                <div className="h-8 bg-cyan-600 rounded-bl-full" />
                <div className="flex-1" />
                <div className="h-8 bg-cyan-600 rounded-tl-full" />
              </div>
            </div>
          </div>

          {/* BOTTOM PANEL - Command Bar */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            {/* Top decorative bar */}
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
              {/* Left corner */}
              <div className="flex flex-col-reverse">
                <div className="h-12 w-32 bg-amber-600 rounded-tr-[30px]" />
                <div className="h-8 w-6 bg-amber-600" />
              </div>

              {/* Main bar */}
              <div className="flex-1 bg-black/90 border-t-4 border-amber-600 backdrop-blur-md">
                <div className="flex items-center justify-between px-4 py-2">
                  {/* Crew Section */}
                  <div className="flex items-center gap-3">
                    <div className="text-[9px] text-amber-500 uppercase tracking-widest">Crew</div>
                    <div className="flex -space-x-1.5">
                      {yearStats?.collaborators.slice(0, 6).map((collab) => (
                        <Avatar
                          key={collab.username}
                          className="h-7 w-7 border-2 border-amber-500 ring-1 ring-black"
                          title={`@${collab.username}`}
                        >
                          <AvatarImage src={collab.avatarUrl || undefined} />
                          <AvatarFallback className="bg-amber-500/20 text-amber-500 text-[8px]">
                            {collab.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {(yearStats?.collaborators.length || 0) > 6 && (
                        <div className="h-7 w-7 rounded-full border-2 border-amber-500 bg-black flex items-center justify-center text-[9px] text-amber-500">
                          +{(yearStats?.collaborators.length || 0) - 6}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    <LcarsBtn onClick={handleRefresh} disabled={isRefreshing} color="cyan" title="Refresh Data">
                      <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </LcarsBtn>
                    <LcarsBtn onClick={copyShareLink} color="amber" title="Share Profile">
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                    </LcarsBtn>
                    <LcarsBtn onClick={toggleFullscreen} color="amber" title="Toggle Fullscreen">
                      <Maximize className="h-3.5 w-3.5" />
                    </LcarsBtn>
                    <LcarsBtn onClick={() => setIsMuted(!isMuted)} color="cyan" title="Toggle Sound">
                      {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                    </LcarsBtn>
                    <LcarsBtn onClick={() => window.location.href = '/settings'} color="amber" title="Settings">
                      <Settings className="h-3.5 w-3.5" />
                    </LcarsBtn>
                    <div className="w-px h-6 bg-amber-500/30 mx-1" />
                    <LcarsBtn onClick={() => signOut({ callbackUrl: '/' })} color="orange" title="Logout">
                      <LogOut className="h-3.5 w-3.5" />
                    </LcarsBtn>
                  </div>

                  {/* User info */}
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-[10px] text-cyan-400">{user.username}</div>
                      <div className="text-[8px] text-amber-500/50">COMMAND LEVEL 7</div>
                    </div>
                    <Avatar className="h-8 w-8 border-2 border-cyan-500">
                      <AvatarImage src={user.avatarUrl || undefined} />
                      <AvatarFallback className="bg-cyan-500/20 text-cyan-500 text-xs">
                        {user.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>

              {/* Right corner */}
              <div className="flex flex-col-reverse items-end">
                <div className="h-12 w-32 bg-cyan-600 rounded-tl-[30px]" />
                <div className="h-8 w-6 bg-cyan-600" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LcarsDataRow({
  icon,
  label,
  value,
  color
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'amber' | 'cyan' | 'orange';
}) {
  const colors = {
    amber: 'bg-amber-500 text-amber-500 border-amber-500/30',
    cyan: 'bg-cyan-400 text-cyan-400 border-cyan-400/30',
    orange: 'bg-orange-500 text-orange-500 border-orange-500/30',
  };

  return (
    <div className={`flex items-center gap-2 p-1.5 rounded border ${colors[color].split(' ')[2]} bg-black/50`}>
      <div className={`p-1 rounded ${colors[color].split(' ')[0]}/20`}>
        <span className={colors[color].split(' ')[1]}>{icon}</span>
      </div>
      <span className="text-[9px] text-zinc-400 uppercase tracking-wider flex-1">{label}</span>
      <span className={`text-sm font-bold tabular-nums ${colors[color].split(' ')[1]}`}>
        {value.toLocaleString()}
      </span>
    </div>
  );
}

function LcarsBtn({
  children,
  onClick,
  disabled,
  color,
  title
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  color: 'amber' | 'cyan' | 'orange';
  title?: string;
}) {
  const colors = {
    amber: 'bg-amber-500 hover:bg-amber-400',
    cyan: 'bg-cyan-500 hover:bg-cyan-400',
    orange: 'bg-orange-500 hover:bg-orange-400',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-full text-black transition-all disabled:opacity-50 hover:scale-110 ${colors[color]}`}
    >
      {children}
    </button>
  );
}
