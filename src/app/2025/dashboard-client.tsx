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
  Radio,
  Zap,
  Maximize,
  Volume2,
  VolumeX,
  Database,
  Cpu,
  Shield,
  Globe,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const DashboardScene = dynamic(
  () => import('@/components/three/DashboardScene').then((mod) => mod.DashboardScene),
  { ssr: false, loading: () => null }
);

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
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [mounted, setMounted] = useState(false);

  const summary = yearStats?.summaryJson as SummaryStats | undefined;
  const needsRefresh = !yearStats;

  const stardate = `${new Date().getFullYear()}.${Math.floor((Date.now() % 31536000000) / 86400000).toString().padStart(3, '0')}`;
  const shipRegistry = `NCC-${user.username.length * 1000 + 2025}`;

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) {
    return <LcarsLoadingScreen username={user.username} />;
  }

  if (needsRefresh) {
    return <LcarsSetupScreen user={user} isRefreshing={isRefreshing} onRefresh={handleRefresh} stardate={stardate} />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-black font-mono select-none">
      {/* 3D Background */}
      {summary && (
        <div className="absolute inset-0 z-0">
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

      {/* Scan line effect */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
        style={{
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,235,184,0.1) 2px, rgba(255,235,184,0.1) 4px)`
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          TOP LCARS FRAME
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <div className="flex">
          {/* Top-Left Corner Elbow */}
          <div className="flex flex-col">
            <div className="h-16 w-48 bg-[#f59e0b] rounded-br-[50px] flex items-center justify-end pr-6">
              <span className="text-black text-sm font-bold tracking-widest">LCARS 47</span>
            </div>
            <div className="h-16 w-8 bg-[#f59e0b]" />
          </div>

          {/* Top Header Bar */}
          <div className="flex-1 flex flex-col">
            <div className="h-16 bg-gradient-to-r from-[#f59e0b] via-[#cc6666] to-[#9370db] flex items-center px-8">
              <div className="flex items-center gap-4">
                <span className="text-black text-sm font-bold tracking-widest uppercase">
                  USS {user.username.toUpperCase()}
                </span>
                <span className="text-black/60 text-xs font-bold">{shipRegistry}</span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-6">
                <span className="text-black/60 text-xs font-bold">SECTOR 001</span>
                <span className="text-black text-sm font-bold">STARDATE {stardate}</span>
              </div>
            </div>
            {/* Sub-header data bars */}
            <div className="h-4 flex gap-[2px] px-2 pt-1">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    backgroundColor: i % 5 === 0 ? '#9370db' : i % 5 === 1 ? '#f59e0b' : i % 5 === 2 ? '#cc6666' : i % 3 === 0 ? '#22d3ee' : '#f59e0b',
                    opacity: 0.3 + Math.sin(i * 0.3) * 0.4
                  }}
                />
              ))}
            </div>
          </div>

          {/* Top-Right Corner Elbow */}
          <div className="flex flex-col items-end">
            <div className="h-16 w-48 bg-[#9370db] rounded-bl-[50px] flex items-center pl-6">
              <span className="text-black text-sm font-bold">2025</span>
            </div>
            <div className="h-16 w-8 bg-[#9370db]" />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          LEFT SIDEBAR
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="absolute left-0 top-[88px] bottom-[88px] w-64 z-20 flex">
        {/* Left Edge Bar */}
        <div className="w-8 bg-[#f59e0b] flex flex-col">
          <div className="h-12 bg-[#cc6666] rounded-br-[20px]" />
          <div className="flex-1" />
          <div className="h-12 bg-[#cc6666] rounded-tr-[20px]" />
        </div>

        {/* Left Panel Content */}
        <div className="flex-1 bg-black/80 backdrop-blur-sm border-r-4 border-[#f59e0b] overflow-y-auto">
          {/* Section: Officer Profile */}
          <div className="border-b-2 border-[#f59e0b]/30">
            <div className="bg-[#f59e0b] px-4 py-2">
              <span className="text-black text-[11px] font-bold tracking-widest">OFFICER PROFILE</span>
            </div>
            <div className="p-4 flex flex-col items-center">
              <Avatar className="h-20 w-20 border-4 border-[#f59e0b] mb-3">
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback className="bg-[#f59e0b]/20 text-[#f59e0b] text-2xl font-bold">
                  {user.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-[#f59e0b] text-sm font-bold text-center">{user.name || user.username}</div>
              <div className="text-[#9370db] text-[10px] tracking-widest">@{user.username}</div>
              <div className="text-[#cc6666] text-[9px] mt-1 tracking-widest">CLEARANCE LEVEL 7</div>
            </div>
          </div>

          {/* Section: Operations Data */}
          <div className="border-b-2 border-[#f59e0b]/30">
            <div className="bg-[#9370db] px-4 py-2">
              <span className="text-black text-[11px] font-bold tracking-widest">OPERATIONS DATA</span>
            </div>
            <div className="p-3 space-y-2">
              <LcarsDataRow label="COMMITS" value={summary?.totalCommits || 0} color="#f59e0b" />
              <LcarsDataRow label="PULL REQUESTS" value={summary?.totalPRs || 0} color="#22d3ee" />
              <LcarsDataRow label="ISSUES CLOSED" value={summary?.totalIssues || 0} color="#9370db" />
              <LcarsDataRow label="STARS EARNED" value={summary?.totalStarsEarned || 0} color="#cc6666" />
              <LcarsDataRow label="DAY STREAK" value={summary?.longestStreak || 0} color="#f59e0b" />
            </div>
          </div>

          {/* Section: Language Matrix */}
          <div className="border-b-2 border-[#f59e0b]/30">
            <div className="bg-[#cc6666] px-4 py-2">
              <span className="text-black text-[11px] font-bold tracking-widest">LANGUAGE MATRIX</span>
            </div>
            <div className="p-3 space-y-2">
              {yearStats?.languages.slice(0, 6).map((lang, i) => (
                <div key={lang.language} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: lang.color || '#f59e0b' }}
                  />
                  <span className="text-[10px] text-[#ffebb8] flex-1 truncate uppercase tracking-wider">
                    {lang.language}
                  </span>
                  <div className="w-16 h-2 bg-black/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${lang.contributionShare}%`,
                        backgroundColor: lang.color || '#f59e0b',
                        transitionDelay: `${i * 100}ms`
                      }}
                    />
                  </div>
                  <span className="text-[9px] text-[#9370db] w-8 text-right">
                    {lang.contributionShare.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Power Allocation */}
          <div>
            <div className="bg-[#22d3ee] px-4 py-2">
              <span className="text-black text-[11px] font-bold tracking-widest">POWER SYSTEMS</span>
            </div>
            <div className="p-3">
              <PowerAllocationGrid />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          RIGHT SIDEBAR
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="absolute right-0 top-[88px] bottom-[88px] w-64 z-20 flex">
        {/* Right Panel Content */}
        <div className="flex-1 bg-black/80 backdrop-blur-sm border-l-4 border-[#9370db] overflow-y-auto">
          {/* Section: Commendations */}
          <div className="border-b-2 border-[#9370db]/30">
            <div className="bg-[#9370db] px-4 py-2 flex items-center justify-between">
              <span className="text-black text-[11px] font-bold tracking-widest">COMMENDATIONS</span>
              <span className="text-black/60 text-[9px] font-bold">{achievements.length}</span>
            </div>
            <div className="p-3 space-y-2 max-h-40 overflow-y-auto">
              {achievements.length > 0 ? achievements.slice(0, 5).map((a) => (
                <div key={a.code} className="flex items-center gap-2 p-2 bg-[#9370db]/10 border border-[#9370db]/30 rounded">
                  <Trophy className="h-3 w-3 text-[#f59e0b] flex-shrink-0" />
                  <span className="text-[10px] text-[#ffebb8] truncate">{a.name}</span>
                </div>
              )) : (
                <div className="text-[10px] text-[#9370db]/50 italic text-center py-4">NO COMMENDATIONS LOGGED</div>
              )}
            </div>
          </div>

          {/* Section: Fleet Registry */}
          <div className="border-b-2 border-[#9370db]/30">
            <div className="bg-[#cc6666] px-4 py-2 flex items-center justify-between">
              <span className="text-black text-[11px] font-bold tracking-widest">FLEET REGISTRY</span>
              <span className="text-black/60 text-[9px] font-bold">{yearStats?.repos.length || 0}</span>
            </div>
            <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
              {yearStats?.repos.slice(0, 5).map((repo) => (
                <div key={repo.fullName} className="p-2 bg-black/30 border border-[#cc6666]/30 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#22d3ee] truncate flex-1 font-bold">
                      {repo.fullName.split('/')[1]?.toUpperCase()}
                    </span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded ${
                      repo.role === 'FLAGSHIP' ? 'bg-[#9370db]/30 text-[#9370db]' :
                      repo.role === 'PATROL' ? 'bg-[#22d3ee]/30 text-[#22d3ee]' :
                      'bg-[#f59e0b]/30 text-[#f59e0b]'
                    }`}>
                      {repo.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[9px] text-[#ffebb8]/60">
                    <span className="flex items-center gap-1">
                      <Star className="h-2.5 w-2.5" /> {repo.starsGained2025}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitCommit className="h-2.5 w-2.5" /> {repo.commitsByUser2025}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Crew Manifest */}
          <div className="border-b-2 border-[#9370db]/30">
            <div className="bg-[#f59e0b] px-4 py-2 flex items-center justify-between">
              <span className="text-black text-[11px] font-bold tracking-widest">CREW MANIFEST</span>
              <span className="text-black/60 text-[9px] font-bold">{yearStats?.collaborators.length || 0}</span>
            </div>
            <div className="p-3">
              <div className="flex flex-wrap gap-1.5">
                {yearStats?.collaborators.slice(0, 12).map((collab) => (
                  <Avatar
                    key={collab.username}
                    className="h-8 w-8 border-2 border-[#f59e0b]"
                    title={`@${collab.username}`}
                  >
                    <AvatarImage src={collab.avatarUrl || undefined} />
                    <AvatarFallback className="bg-[#f59e0b]/20 text-[#f59e0b] text-[10px]">
                      {collab.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {(yearStats?.collaborators.length || 0) > 12 && (
                  <div className="h-8 w-8 rounded-full border-2 border-[#f59e0b] bg-black flex items-center justify-center text-[9px] text-[#f59e0b]">
                    +{(yearStats?.collaborators.length || 0) - 12}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: System Status */}
          <div>
            <div className="bg-[#22d3ee] px-4 py-2">
              <span className="text-black text-[11px] font-bold tracking-widest">SYSTEM STATUS</span>
            </div>
            <div className="p-3">
              <SystemStatusPanel />
            </div>
          </div>
        </div>

        {/* Right Edge Bar */}
        <div className="w-8 bg-[#9370db] flex flex-col">
          <div className="h-12 bg-[#cc6666] rounded-bl-[20px]" />
          <div className="flex-1" />
          <div className="h-12 bg-[#cc6666] rounded-tl-[20px]" />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          CENTER MAIN DISPLAY
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="absolute left-64 right-64 top-[96px] bottom-[96px] z-10 flex flex-col p-4">
        {/* Main Stats Display */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Transmission Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#22d3ee] animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
            <Radio className="h-5 w-5 text-[#22d3ee] animate-pulse" />
            <span className="text-[#22d3ee] uppercase tracking-[0.4em] text-xs">Mission Report Active</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#22d3ee] animate-pulse"
                  style={{ animationDelay: `${(4 - i) * 150}ms` }}
                />
              ))}
            </div>
          </div>

          {/* Big Number Display */}
          <div className="text-center mb-8">
            <div className="text-[120px] font-bold text-[#f59e0b] leading-none tabular-nums tracking-tight">
              {(summary?.totalContributions || 0).toLocaleString()}
            </div>
            <div className="text-[#9370db] uppercase tracking-[0.5em] text-sm mt-2">
              Total Contributions
            </div>
          </div>

          {/* Contribution Graph */}
          <div className="w-full max-w-2xl mb-8">
            <div className="bg-black/60 border-2 border-[#f59e0b]/30 rounded-lg p-4">
              <div className="text-[10px] text-[#f59e0b] uppercase tracking-widest mb-3">
                Contribution Frequency Analysis
              </div>
              <div className="flex items-end justify-between gap-1 h-24">
                {(summary?.contributionsByMonth || Array(12).fill({ count: 0 })).map((m, i) => {
                  const maxCount = Math.max(...(summary?.contributionsByMonth?.map(x => x.count) || [1]));
                  const height = maxCount > 0 ? Math.max(10, (m.count / maxCount) * 100) : 10;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t transition-all duration-500"
                        style={{
                          height: `${height}%`,
                          backgroundColor: i % 2 === 0 ? '#f59e0b' : '#9370db',
                          opacity: 0.6 + (height / 200)
                        }}
                      />
                      <span className="text-[8px] text-[#ffebb8]/40">
                        {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 w-full max-w-3xl">
            <StatDisplay icon={<GitCommit className="h-5 w-5" />} label="COMMITS" value={summary?.totalCommits || 0} color="#f59e0b" />
            <StatDisplay icon={<GitPullRequest className="h-5 w-5" />} label="PULL REQ" value={summary?.totalPRs || 0} color="#22d3ee" />
            <StatDisplay icon={<AlertCircle className="h-5 w-5" />} label="ISSUES" value={summary?.totalIssues || 0} color="#9370db" />
            <StatDisplay icon={<Flame className="h-5 w-5" />} label="STREAK" value={summary?.longestStreak || 0} color="#cc6666" suffix=" days" />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          BOTTOM LCARS FRAME
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        {/* Bottom data bars */}
        <div className="h-4 flex gap-[2px] px-8 pb-1">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                backgroundColor: i % 4 === 0 ? '#f59e0b' : i % 4 === 1 ? '#9370db' : i % 4 === 2 ? '#cc6666' : '#22d3ee',
                opacity: 0.2 + Math.abs(30 - i) / 60
              }}
            />
          ))}
        </div>

        <div className="flex">
          {/* Bottom-Left Corner Elbow */}
          <div className="flex flex-col-reverse">
            <div className="h-16 w-48 bg-[#cc6666] rounded-tr-[50px] flex items-center justify-end pr-6">
              <span className="text-black text-[10px] font-bold tracking-widest">INITIALIZED.DEV</span>
            </div>
            <div className="h-12 w-8 bg-[#cc6666]" />
          </div>

          {/* Bottom Bar */}
          <div className="flex-1 bg-black/80 border-t-4 border-[#cc6666] backdrop-blur-sm">
            <div className="flex items-center justify-between px-6 py-3">
              {/* Left: Crew avatars */}
              <div className="flex items-center gap-3">
                <span className="text-[9px] text-[#f59e0b] uppercase tracking-widest">Crew</span>
                <div className="flex -space-x-1.5">
                  {yearStats?.collaborators.slice(0, 5).map((collab) => (
                    <Avatar key={collab.username} className="h-7 w-7 border-2 border-[#f59e0b]">
                      <AvatarImage src={collab.avatarUrl || undefined} />
                      <AvatarFallback className="bg-[#f59e0b]/20 text-[#f59e0b] text-[8px]">
                        {collab.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>

              {/* Center: Action buttons */}
              <div className="flex items-center gap-2">
                <LcarsButton onClick={handleRefresh} disabled={isRefreshing} color="#22d3ee" title="Refresh">
                  <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">REFRESH</span>
                </LcarsButton>
                <LcarsButton onClick={copyShareLink} color="#f59e0b" title="Share">
                  {copied ? <Check className="h-3 w-3" /> : <Share2 className="h-3 w-3" />}
                  <span className="hidden sm:inline">{copied ? 'COPIED' : 'SHARE'}</span>
                </LcarsButton>
                <LcarsButton onClick={toggleFullscreen} color="#9370db" title="Fullscreen">
                  <Maximize className="h-3 w-3" />
                </LcarsButton>
                <LcarsButton onClick={() => setIsMuted(!isMuted)} color="#22d3ee" title="Sound">
                  {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                </LcarsButton>
                <LcarsButton onClick={() => window.location.href = '/settings'} color="#f59e0b" title="Settings">
                  <Settings className="h-3 w-3" />
                </LcarsButton>
                <div className="w-px h-6 bg-[#cc6666]/30 mx-1" />
                <LcarsButton onClick={() => signOut({ callbackUrl: '/' })} color="#cc6666" title="Logout">
                  <LogOut className="h-3 w-3" />
                </LcarsButton>
              </div>

              {/* Right: User info & status */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[10px] text-[#22d3ee]">{user.username}</div>
                  <div className="text-[8px] text-[#f59e0b]/50">COMMAND LEVEL 7</div>
                </div>
                <span className="text-[#22d3ee] flex items-center gap-1 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  ONLINE
                </span>
              </div>
            </div>
          </div>

          {/* Bottom-Right Corner Elbow */}
          <div className="flex flex-col-reverse items-end">
            <div className="h-16 w-48 bg-[#22d3ee] rounded-tl-[50px] flex items-center pl-6">
              <span className="text-black text-[10px] font-bold tracking-widest">YEAR IN REVIEW</span>
            </div>
            <div className="h-12 w-8 bg-[#22d3ee]" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SETUP SCREEN
// ═══════════════════════════════════════════════════════════════════════════

function LcarsSetupScreen({
  user,
  isRefreshing,
  onRefresh,
  stardate
}: {
  user: { username: string; name: string | null };
  isRefreshing: boolean;
  onRefresh: () => void;
  stardate: string;
}) {
  return (
    <div className="fixed inset-0 bg-black font-mono flex items-center justify-center">
      {/* Scan lines */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,235,184,0.15) 2px, rgba(255,235,184,0.15) 4px)`
        }}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex h-20">
        <div className="w-56 bg-[#f59e0b] rounded-br-[50px] flex items-center justify-end pr-8">
          <span className="text-black font-bold tracking-widest">LCARS 47</span>
        </div>
        <div className="flex-1 bg-gradient-to-r from-[#f59e0b] via-[#cc6666] to-[#9370db] flex items-center px-8">
          <span className="text-black font-bold tracking-[0.3em] text-sm">SYSTEM INITIALIZATION REQUIRED</span>
        </div>
        <div className="w-56 bg-[#9370db] rounded-bl-[50px] flex items-center pl-8">
          <span className="text-black font-bold">2025</span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-lg w-full mx-4 z-10">
        {/* LCARS Frame */}
        <div className="flex">
          <div className="w-24 h-16 bg-[#f59e0b] rounded-tl-[40px]" />
          <div className="flex-1 flex flex-col">
            <div className="h-8 bg-[#f59e0b]" />
            <div className="flex-1 flex">
              <div className="w-4 bg-[#f59e0b]" />
              <div className="flex-1 bg-black border-t-4 border-l-4 border-[#f59e0b]" />
            </div>
          </div>
          <div className="w-8 flex flex-col">
            <div className="h-8 bg-[#22d3ee]" />
            <div className="flex-1 bg-[#22d3ee]/20" />
          </div>
        </div>

        {/* Content */}
        <div className="flex">
          <div className="w-24 bg-[#f59e0b] flex flex-col gap-2 p-2">
            {['01', '02', '03', '04'].map(n => (
              <div key={n} className="h-8 bg-[#cc6666] rounded-l-full flex items-center justify-end pr-2">
                <span className="text-black text-xs font-bold">{n}</span>
              </div>
            ))}
          </div>
          <div className="flex-1 bg-black border-l-4 border-[#f59e0b] p-8">
            <div className="flex items-center gap-3 mb-6">
              <Radio className="h-6 w-6 text-[#22d3ee] animate-pulse" />
              <span className="text-[#22d3ee] uppercase tracking-widest text-sm">Awaiting Command Authorization</span>
            </div>

            <h2 className="text-2xl text-[#f59e0b] uppercase tracking-wider mb-2">
              Welcome, {user.name || user.username}
            </h2>
            <p className="text-[#22d3ee]/70 text-sm mb-8">
              Initialize stellar cartography subsystems to generate mission report for stardate {stardate}
            </p>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="w-full py-4 bg-[#f59e0b] hover:bg-[#f59e0b]/80 text-black font-bold uppercase tracking-widest rounded-r-full rounded-l-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
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
                  <div className={`h-1 rounded-full mb-1 ${i === 1 ? 'bg-[#22d3ee] animate-pulse' : 'bg-[#cc6666]'}`} />
                  <span className="text-[10px] text-[#f59e0b]/50">{sys}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-8 bg-[#22d3ee]/20" />
        </div>

        {/* Bottom frame */}
        <div className="flex">
          <div className="w-24 h-16 bg-[#f59e0b] rounded-bl-[40px]" />
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex">
              <div className="w-4 bg-[#f59e0b]" />
              <div className="flex-1 bg-black border-b-4 border-l-4 border-[#f59e0b]" />
            </div>
            <div className="h-8 bg-[#cc6666]" />
          </div>
          <div className="w-8 flex flex-col">
            <div className="flex-1 bg-[#22d3ee]/20" />
            <div className="h-8 bg-[#22d3ee]" />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 flex h-16">
        <div className="w-56 bg-[#cc6666] rounded-tr-[50px]" />
        <div className="flex-1 bg-gradient-to-r from-[#cc6666] via-[#9370db] to-[#22d3ee] flex items-center justify-center">
          <span className="text-black font-bold tracking-[0.2em] text-xs">
            INITIALIZED.DEV // STARFLEET DEVELOPER COMMAND
          </span>
        </div>
        <div className="w-56 bg-[#22d3ee] rounded-tl-[50px]" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOADING SCREEN
// ═══════════════════════════════════════════════════════════════════════════

function LcarsLoadingScreen({ username }: { username: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => p >= 100 ? 100 : p + Math.random() * 15);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col font-mono">
      {/* Scan lines */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,235,184,0.15) 2px, rgba(255,235,184,0.15) 4px)`
        }}
      />

      {/* Top bar */}
      <div className="flex h-20">
        <div className="w-56 bg-[#f59e0b] rounded-br-[50px] flex items-center justify-end pr-8">
          <span className="text-black font-bold tracking-widest">LCARS 47</span>
        </div>
        <div className="flex-1 bg-gradient-to-r from-[#f59e0b] via-[#cc6666] to-[#9370db] flex items-center px-8">
          <span className="text-black font-bold tracking-[0.3em] text-sm">LOADING MISSION REPORT</span>
        </div>
        <div className="w-56 bg-[#9370db] rounded-bl-[50px] flex items-center pl-8">
          <span className="text-black font-bold">{progress.toFixed(0)}%</span>
        </div>
      </div>

      {/* Main loading content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          {/* Animated circles */}
          <div className="relative w-48 h-48 mx-auto mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 border-2 border-[#22d3ee] rounded-full animate-ping"
                style={{
                  animationDelay: `${i * 0.4}s`,
                  animationDuration: '2s',
                  opacity: 0.3 - i * 0.05
                }}
              />
            ))}
            <div className="absolute inset-4 border-4 border-[#f59e0b] rounded-full animate-pulse" />
            <div className="absolute inset-8 border-2 border-[#9370db] rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold text-[#f59e0b]">{progress.toFixed(0)}%</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-80 mx-auto mb-6">
            <div className="h-3 bg-black/50 border border-[#f59e0b]/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#f59e0b] via-[#cc6666] to-[#9370db] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="text-[#22d3ee] uppercase tracking-[0.4em] text-sm animate-pulse">
            Initializing @{username}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex h-16">
        <div className="w-56 bg-[#cc6666] rounded-tr-[50px]" />
        <div className="flex-1 bg-gradient-to-r from-[#cc6666] via-[#9370db] to-[#22d3ee] flex items-center justify-center">
          <span className="text-black font-bold tracking-[0.2em] text-xs">
            INITIALIZED.DEV // STARFLEET DEVELOPER COMMAND
          </span>
        </div>
        <div className="w-56 bg-[#22d3ee] rounded-tl-[50px]" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function LcarsDataRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-full min-h-[20px] rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] text-[#ffebb8]/70 uppercase tracking-wider flex-1">{label}</span>
      <span className="text-sm font-bold tabular-nums" style={{ color }}>
        {value.toLocaleString()}
      </span>
    </div>
  );
}

function PowerAllocationGrid() {
  const systems = ['WARP', 'PHSR', 'SHLD', 'SENS', 'LIFE', 'AUX'];
  const values = [85, 60, 95, 70, 100, 45];

  return (
    <div className="space-y-2">
      {systems.map((sys, i) => (
        <div key={sys} className="flex items-center gap-2">
          <span className="text-[9px] text-[#ffebb8]/50 w-8">{sys}</span>
          <div className="flex-1 flex gap-[2px]">
            {[...Array(10)].map((_, j) => (
              <div
                key={j}
                className="flex-1 h-2 rounded-sm transition-all"
                style={{
                  backgroundColor: j < values[i] / 10 ? (i % 2 === 0 ? '#22d3ee' : '#f59e0b') : '#333',
                  opacity: j < values[i] / 10 ? 0.5 + (j / 20) : 0.2
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SystemStatusPanel() {
  const systems = [
    { icon: <Cpu className="h-3 w-3" />, name: 'CORE', status: 98 },
    { icon: <Database className="h-3 w-3" />, name: 'DATA', status: 100 },
    { icon: <Shield className="h-3 w-3" />, name: 'SHLD', status: 95 },
    { icon: <Globe className="h-3 w-3" />, name: 'COMM', status: 87 },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {systems.map((sys) => (
        <div key={sys.name} className="flex items-center gap-2 p-2 bg-black/30 rounded border border-[#22d3ee]/20">
          <div className="text-[#22d3ee]">{sys.icon}</div>
          <div className="flex-1">
            <div className="text-[8px] text-[#ffebb8]/50">{sys.name}</div>
            <div className="h-1 bg-black/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${sys.status}%`,
                  backgroundColor: sys.status > 90 ? '#22c55e' : sys.status > 70 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
          </div>
          <span className="text-[9px] text-[#22d3ee]">{sys.status}%</span>
        </div>
      ))}
    </div>
  );
}

function StatDisplay({
  icon,
  label,
  value,
  color,
  suffix = ''
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  suffix?: string;
}) {
  return (
    <div className="bg-black/60 border-2 rounded-lg p-4 text-center" style={{ borderColor: `${color}40` }}>
      <div className="flex justify-center mb-2" style={{ color }}>{icon}</div>
      <div className="text-2xl font-bold tabular-nums" style={{ color }}>
        {value.toLocaleString()}{suffix}
      </div>
      <div className="text-[9px] uppercase tracking-widest mt-1" style={{ color: `${color}99` }}>
        {label}
      </div>
    </div>
  );
}

function LcarsButton({
  children,
  onClick,
  disabled,
  color,
  title
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  color: string;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex items-center gap-1.5 px-3 py-1.5 text-black text-[10px] font-bold uppercase tracking-widest rounded-full transition-all disabled:opacity-50 hover:opacity-80 cursor-pointer"
      style={{ backgroundColor: color }}
    >
      {children}
    </button>
  );
}
