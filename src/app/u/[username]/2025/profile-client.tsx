'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  GitCommit,
  GitPullRequest,
  AlertCircle,
  Star,
  Flame,
  Trophy,
  Zap,
  Database,
  Cpu,
  Shield,
  Radio,
  Globe,
  Server,
  Activity,
  Users,
  Code,
  GitBranch,
  Maximize,
  Share2,
  Check,
} from 'lucide-react';

interface PublicProfileProps {
  user: {
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
  };
  achievements: Array<{
    code: string;
    name: string;
    description: string;
    icon: string | null;
  }>;
  themeVariant: string;
}

interface SummaryStats {
  totalContributions: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalStarsEarned: number;
  longestStreak: number;
  currentStreak: number;
  contributionsByMonth?: Array<{ month: number; count: number }>;
}

export function PublicProfileClient({
  user,
  yearStats,
  achievements,
}: PublicProfileProps) {
  const summary = yearStats.summaryJson as SummaryStats;
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const stardate = `${new Date().getFullYear()}.${Math.floor((Date.now() % 31536000000) / 86400000).toString().padStart(3, '0')}`;
  const shipRegistry = `NCC-${user.username.length * 1000 + 2025}`;

  useEffect(() => {
    setMounted(true);
  }, []);

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

  return (
    <div className="fixed inset-0 overflow-hidden bg-black font-mono select-none">
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
        <div className="flex-1 bg-black/80 backdrop-blur-sm border-r-4 border-[#f59e0b]">
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
              <LcarsDataRow label="COMMITS" value={summary.totalCommits} color="#f59e0b" />
              <LcarsDataRow label="PULL REQUESTS" value={summary.totalPRs} color="#22d3ee" />
              <LcarsDataRow label="ISSUES CLOSED" value={summary.totalIssues} color="#9370db" />
              <LcarsDataRow label="STARS EARNED" value={summary.totalStarsEarned} color="#cc6666" />
              <LcarsDataRow label="DAY STREAK" value={summary.longestStreak} color="#f59e0b" />
            </div>
          </div>

          {/* Section: Language Matrix */}
          <div className="border-b-2 border-[#f59e0b]/30">
            <div className="bg-[#cc6666] px-4 py-2">
              <span className="text-black text-[11px] font-bold tracking-widest">LANGUAGE MATRIX</span>
            </div>
            <div className="p-3 space-y-2">
              {yearStats.languages.slice(0, 6).map((lang, i) => (
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
        <div className="flex-1 bg-black/80 backdrop-blur-sm border-l-4 border-[#9370db]">
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
              <span className="text-black/60 text-[9px] font-bold">{yearStats.repos.length}</span>
            </div>
            <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
              {yearStats.repos.slice(0, 5).map((repo) => (
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
              <span className="text-black/60 text-[9px] font-bold">{yearStats.collaborators.length}</span>
            </div>
            <div className="p-3">
              <div className="flex flex-wrap gap-1.5">
                {yearStats.collaborators.slice(0, 12).map((collab) => (
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
                {yearStats.collaborators.length > 12 && (
                  <div className="h-8 w-8 rounded-full border-2 border-[#f59e0b] bg-black flex items-center justify-center text-[9px] text-[#f59e0b]">
                    +{yearStats.collaborators.length - 12}
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
            <span className="text-[#22d3ee] uppercase tracking-[0.4em] text-xs">Personnel File Active</span>
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
              {summary.totalContributions.toLocaleString()}
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
                {(summary.contributionsByMonth || Array(12).fill({ count: Math.random() * 100 })).map((m, i) => {
                  const height = Math.max(10, (m.count / Math.max(...(summary.contributionsByMonth?.map(x => x.count) || [100]))) * 100);
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
            <StatDisplay icon={<GitCommit className="h-5 w-5" />} label="COMMITS" value={summary.totalCommits} color="#f59e0b" />
            <StatDisplay icon={<GitPullRequest className="h-5 w-5" />} label="PULL REQ" value={summary.totalPRs} color="#22d3ee" />
            <StatDisplay icon={<AlertCircle className="h-5 w-5" />} label="ISSUES" value={summary.totalIssues} color="#9370db" />
            <StatDisplay icon={<Flame className="h-5 w-5" />} label="STREAK" value={summary.longestStreak} color="#cc6666" suffix=" days" />
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
            <div className="flex items-center justify-between px-8 py-3">
              {/* Left info */}
              <div className="flex items-center gap-6 text-[10px]">
                <span className="text-[#f59e0b]/60">FEDERATION STANDARD TIME</span>
                <span className="text-[#22d3ee]/60">QUADRANT: ALPHA</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={copyShareLink}
                  className="flex items-center gap-2 px-4 py-2 bg-[#f59e0b] hover:bg-[#f59e0b]/80 text-black text-[10px] font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Share2 className="h-3 w-3" />}
                  {copied ? 'COPIED' : 'SHARE'}
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center gap-2 px-4 py-2 bg-[#9370db] hover:bg-[#9370db]/80 text-black text-[10px] font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer"
                >
                  <Maximize className="h-3 w-3" />
                  FULLSCREEN
                </button>
                <Link
                  href="/"
                  className="flex items-center gap-2 px-4 py-2 bg-[#22d3ee] hover:bg-[#22d3ee]/80 text-black text-[10px] font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer"
                >
                  CREATE YOURS
                </Link>
              </div>

              {/* Right info */}
              <div className="flex items-center gap-4 text-[10px]">
                <span className="text-[#9370db]/60">BUILD: 2025.DEC</span>
                <span className="text-[#cc6666] flex items-center gap-1">
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
// COMPONENTS
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
          <span className="text-black font-bold tracking-[0.3em] text-sm">LOADING PERSONNEL FILE</span>
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
            Accessing @{username}
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
