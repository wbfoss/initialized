'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
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
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Cpu,
  Radio,
  Zap,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const DashboardScene = dynamic(
  () => import('@/components/three/DashboardScene').then((mod) => mod.DashboardScene),
  { ssr: false }
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

export function DashboardClient({ user, yearStats, achievements, settings }: DashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const summary = yearStats?.summaryJson as SummaryStats | undefined;
  const needsRefresh = !yearStats;

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

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
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
          <div className="text-center">
            {/* LCARS Header Bar */}
            <div className="mb-8 flex items-center justify-center gap-2">
              <div className="h-2 w-32 rounded-l-full bg-amber-500" />
              <div className="h-2 w-8 bg-sky-400" />
              <div className="h-2 w-16 rounded-r-full bg-amber-600" />
            </div>

            <div className="mb-6 inline-flex items-center gap-3 rounded-full border-2 border-amber-500/50 bg-black/80 px-6 py-3">
              <Radio className="h-5 w-5 text-amber-500 animate-pulse" />
              <span className="font-mono text-amber-500 uppercase tracking-widest">Awaiting Authorization</span>
            </div>

            <h2 className="mb-2 font-mono text-2xl text-sky-400 uppercase tracking-wider">
              Welcome, {user.name || user.username}
            </h2>
            <p className="mb-8 max-w-md mx-auto font-mono text-sm text-amber-500/70">
              Initialize stellar cartography systems to generate your 2025 mission report
            </p>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="group relative overflow-hidden rounded-full border-2 border-amber-500 bg-amber-500/20 px-8 py-4 font-mono text-amber-500 uppercase tracking-widest transition-all hover:bg-amber-500 hover:text-black disabled:opacity-50"
            >
              {isRefreshing ? (
                <span className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Initializing Systems...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <Zap className="h-5 w-5" />
                  Engage
                </span>
              )}
            </button>

            {/* LCARS Footer Bar */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <div className="h-2 w-16 rounded-l-full bg-amber-600" />
              <div className="h-2 w-8 bg-sky-400" />
              <div className="h-2 w-32 rounded-r-full bg-amber-500" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* LCARS Top Header */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-start">
            {/* Left corner piece */}
            <div className="flex flex-col">
              <div className="h-8 w-24 rounded-br-3xl bg-amber-500" />
              <div className="h-16 w-4 bg-amber-500" />
            </div>

            {/* Top bar */}
            <div className="flex-1 flex items-center h-8">
              <div className="h-full w-full bg-gradient-to-r from-amber-500 via-amber-600 to-sky-500 flex items-center justify-between px-4">
                <span className="font-mono text-xs text-black font-bold uppercase tracking-wider">
                  LCARS 2025 // {user.username.toUpperCase()}
                </span>
                <span className="font-mono text-xs text-black font-bold">
                  STARDATE {new Date().toISOString().slice(0, 10).replace(/-/g, '.')}
                </span>
              </div>
            </div>

            {/* Right corner piece */}
            <div className="flex flex-col items-end">
              <div className="h-8 w-24 rounded-bl-3xl bg-sky-500" />
              <div className="h-16 w-4 bg-sky-500" />
            </div>
          </div>

          {/* Center HUD - Main Stats */}
          <div className="absolute top-28 left-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center gap-6 rounded-full border border-amber-500/30 bg-black/60 px-8 py-4 backdrop-blur-md">
              <div className="text-center">
                <p className="font-mono text-3xl font-bold text-amber-500">
                  {(summary?.totalContributions || 0).toLocaleString()}
                </p>
                <p className="font-mono text-[10px] text-amber-500/70 uppercase tracking-widest">Contributions</p>
              </div>
              <div className="h-10 w-px bg-amber-500/30" />
              <div className="text-center">
                <p className="font-mono text-3xl font-bold text-sky-400">
                  {summary?.longestStreak || 0}
                </p>
                <p className="font-mono text-[10px] text-sky-400/70 uppercase tracking-widest">Day Streak</p>
              </div>
            </div>
          </div>

          {/* LEFT PANEL - Stats (Always Visible) */}
          <div className="absolute left-0 top-28 bottom-20 z-20">
            <div className="h-full w-64 bg-black/80 border-r-4 border-amber-500 backdrop-blur-md">
              {/* Panel Header */}
              <div className="bg-amber-500 px-4 py-2">
                <span className="font-mono text-sm font-bold text-black uppercase tracking-wider">Operations Data</span>
              </div>

              <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100%-3rem)]">
                <LcarsStatRow icon={<GitCommit />} label="Commits" value={summary?.totalCommits || 0} color="amber" />
                <LcarsStatRow icon={<GitPullRequest />} label="Pull Requests" value={summary?.totalPRs || 0} color="sky" />
                <LcarsStatRow icon={<AlertCircle />} label="Issues" value={summary?.totalIssues || 0} color="amber" />
                <LcarsStatRow icon={<Star />} label="Stars Earned" value={summary?.totalStarsEarned || 0} color="sky" />
                <LcarsStatRow icon={<Flame />} label="Current Streak" value={summary?.currentStreak || 0} color="orange" />

                {/* Languages */}
                <div className="pt-3 border-t border-amber-500/30">
                  <p className="font-mono text-[10px] text-amber-500 uppercase tracking-widest mb-3">Language Matrix</p>
                  <div className="space-y-2">
                    {yearStats?.languages.slice(0, 5).map((lang) => (
                      <div key={lang.language} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: lang.color || '#f59e0b' }} />
                        <span className="font-mono text-xs text-zinc-300 flex-1">{lang.language}</span>
                        <span className="font-mono text-xs text-amber-500">{lang.contributionShare.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Achievements & Repos */}
          <div className={`absolute right-0 top-28 bottom-20 z-20 transition-transform duration-300 ${rightPanelOpen ? 'translate-x-0' : 'translate-x-[calc(100%-3rem)]'}`}>
            <div className="flex h-full">
              {/* Toggle Button */}
              <button
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
                className="h-24 w-12 self-center bg-sky-500 hover:bg-sky-400 flex items-center justify-center rounded-l-lg transition-colors"
              >
                {rightPanelOpen ? <ChevronRight className="h-6 w-6 text-black" /> : <ChevronLeft className="h-6 w-6 text-black" />}
              </button>

              <div className="w-72 bg-black/90 border-l-4 border-sky-500 backdrop-blur-md">
                {/* Panel Header */}
                <div className="bg-sky-500 px-4 py-2">
                  <span className="font-mono text-sm font-bold text-black uppercase tracking-wider">Mission Logs</span>
                </div>

                <div className="p-4 space-y-4 max-h-[calc(100%-3rem)] overflow-y-auto">
                  {/* Achievements */}
                  <div>
                    <p className="font-mono text-[10px] text-sky-400 uppercase tracking-widest mb-3">Commendations</p>
                    <div className="space-y-2">
                      {achievements.slice(0, 6).map((achievement) => (
                        <div key={achievement.code} className="flex items-center gap-2 p-2 rounded border border-amber-500/30 bg-amber-500/10">
                          <Trophy className="h-4 w-4 text-amber-500" />
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-xs text-amber-500 truncate">{achievement.name}</p>
                          </div>
                        </div>
                      ))}
                      {achievements.length === 0 && (
                        <p className="font-mono text-xs text-zinc-500">No commendations yet</p>
                      )}
                    </div>
                  </div>

                  {/* Top Repos */}
                  <div className="pt-4 border-t border-sky-500/30">
                    <p className="font-mono text-[10px] text-sky-400 uppercase tracking-widest mb-3">Fleet Registry</p>
                    <div className="space-y-2">
                      {yearStats?.repos.slice(0, 4).map((repo) => (
                        <div key={repo.fullName} className="p-2 rounded border border-sky-500/30 bg-sky-500/10">
                          <p className="font-mono text-xs text-sky-400 truncate">{repo.fullName.split('/')[1]}</p>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" /> {repo.starsGained2025}
                            </span>
                            <span className="flex items-center gap-1">
                              <GitCommit className="h-3 w-3" /> {repo.commitsByUser2025}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM PANEL - Crew & Actions */}
          <div className={`absolute bottom-0 left-28 right-28 z-20 transition-transform duration-300 ${bottomPanelOpen ? 'translate-y-0' : 'translate-y-[calc(100%-3rem)]'}`}>
            <div className="flex flex-col">
              {/* Toggle Button */}
              <button
                onClick={() => setBottomPanelOpen(!bottomPanelOpen)}
                className="w-24 h-12 self-center bg-amber-600 hover:bg-amber-500 flex items-center justify-center rounded-t-lg transition-colors"
              >
                {bottomPanelOpen ? <ChevronDown className="h-6 w-6 text-black" /> : <ChevronUp className="h-6 w-6 text-black" />}
              </button>

              <div className="bg-black/90 border-t-4 border-amber-600 backdrop-blur-md">
                <div className="flex items-center justify-between p-4">
                  {/* Crew Section */}
                  <div className="flex items-center gap-4">
                    <p className="font-mono text-[10px] text-amber-500 uppercase tracking-widest">Crew Manifest</p>
                    <div className="flex -space-x-2">
                      {yearStats?.collaborators.slice(0, 8).map((collab) => (
                        <Avatar
                          key={collab.username}
                          className="h-10 w-10 border-2 border-amber-500 ring-2 ring-black"
                          title={`@${collab.username}`}
                        >
                          <AvatarImage src={collab.avatarUrl || undefined} />
                          <AvatarFallback className="bg-amber-500/20 text-amber-500 font-mono text-xs">
                            {collab.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {(yearStats?.collaborators.length || 0) > 8 && (
                        <div className="h-10 w-10 rounded-full border-2 border-amber-500 bg-black flex items-center justify-center font-mono text-xs text-amber-500">
                          +{(yearStats?.collaborators.length || 0) - 8}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <LcarsButton onClick={handleRefresh} disabled={isRefreshing} color="sky">
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </LcarsButton>
                    <LcarsButton onClick={copyShareLink} color="amber">
                      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                      <span>Share</span>
                    </LcarsButton>
                    <LcarsButton onClick={() => window.location.href = '/settings'} color="amber">
                      <Settings className="h-4 w-4" />
                      <span>Config</span>
                    </LcarsButton>
                    <LcarsButton onClick={() => signOut({ callbackUrl: '/' })} color="orange">
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </LcarsButton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LCARS Bottom Corners */}
          <div className="absolute bottom-0 left-0 z-10 flex flex-col-reverse">
            <div className="h-8 w-24 rounded-tr-3xl bg-amber-600" />
            <div className="h-16 w-4 bg-amber-600" />
          </div>
          <div className="absolute bottom-0 right-0 z-10 flex flex-col-reverse items-end">
            <div className="h-8 w-24 rounded-tl-3xl bg-sky-600" />
            <div className="h-16 w-4 bg-sky-600" />
          </div>

          {/* User Avatar - Bottom Right Corner */}
          <div className="absolute bottom-12 right-8 z-30">
            <div className="flex items-center gap-3 rounded-full border-2 border-sky-500 bg-black/80 p-1 pr-4">
              <Avatar className="h-10 w-10 border-2 border-sky-500">
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback className="bg-sky-500/20 text-sky-500 font-mono">
                  {user.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-mono text-sm text-sky-400">{user.username}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LcarsStatRow({
  icon,
  label,
  value,
  color
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'amber' | 'sky' | 'orange';
}) {
  const colors = {
    amber: 'border-amber-500 bg-amber-500/20 text-amber-500',
    sky: 'border-sky-500 bg-sky-500/20 text-sky-500',
    orange: 'border-orange-500 bg-orange-500/20 text-orange-500',
  };

  return (
    <div className={`flex items-center gap-3 p-2 rounded border ${colors[color]}`}>
      <span className="opacity-70">{icon}</span>
      <span className="font-mono text-xs flex-1">{label}</span>
      <span className="font-mono text-lg font-bold">{value.toLocaleString()}</span>
    </div>
  );
}

function LcarsButton({
  children,
  onClick,
  disabled,
  color
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  color: 'amber' | 'sky' | 'orange';
}) {
  const colors = {
    amber: 'bg-amber-500 hover:bg-amber-400 text-black',
    sky: 'bg-sky-500 hover:bg-sky-400 text-black',
    orange: 'bg-orange-500 hover:bg-orange-400 text-black',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${colors[color]}`}
    >
      {children}
    </button>
  );
}
