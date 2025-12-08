'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Twitter,
  Linkedin,
  Download,
  Link,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { AnimatedCounter } from '@/components/ui/animated-counter';

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
  const [shareOpen, setShareOpen] = useState(false);
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
    <div className="relative min-h-screen text-white">
      {/* 3D Background - Always visible */}
      {!needsRefresh && summary && (
        <div className="fixed inset-0 z-0">
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

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-xl font-bold text-transparent">
              initialized.dev
            </h1>
            <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-400">
              2025
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareOpen(true)}
              className="gap-2 border-zinc-700 bg-transparent hover:bg-zinc-800"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback>{user.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 border-zinc-800 bg-zinc-900">
                <DropdownMenuItem asChild>
                  <a href="/settings" className="flex cursor-pointer items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10">
        {needsRefresh ? (
          <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
            <div className="mb-8 rounded-full bg-purple-500/20 p-6 backdrop-blur-md">
              <RefreshCw className="h-12 w-12 text-purple-400" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold">Welcome, {user.name || user.username}!</h2>
            <p className="mb-6 max-w-md text-zinc-400">
              Let&apos;s generate your 2025 Year in Review. This will fetch your GitHub activity
              and create your personalized galactic dashboard.
            </p>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              size="lg"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Star className="h-5 w-5" />
                  Generate My 2025 Review
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Hero section - Let 3D breathe */}
            <div className="h-[60vh] flex items-end justify-center pb-8">
              <div className="text-center">
                <p className="text-zinc-400 mb-2">Your 2025 Journey</p>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                      <AnimatedCounter value={summary?.totalContributions || 0} />
                    </p>
                    <p className="text-sm text-zinc-500">Contributions</p>
                  </div>
                  <div className="h-12 w-px bg-zinc-700" />
                  <div className="text-center">
                    <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                      <AnimatedCounter value={summary?.longestStreak || 0} />
                    </p>
                    <p className="text-sm text-zinc-500">Day Streak</p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-zinc-600">Scroll down for details</p>
              </div>
            </div>

            {/* Stats Panel - Compact bottom section */}
            <div className="bg-gradient-to-t from-black via-black/95 to-transparent pt-16 pb-8">
              <div className="mx-auto max-w-6xl px-4 space-y-8">

                {/* Quick Stats Row */}
                <div className="flex flex-wrap justify-center gap-3">
                  <StatPill icon={<GitCommit className="h-4 w-4" />} label="Commits" value={summary?.totalCommits || 0} />
                  <StatPill icon={<GitPullRequest className="h-4 w-4" />} label="PRs" value={summary?.totalPRs || 0} />
                  <StatPill icon={<AlertCircle className="h-4 w-4" />} label="Issues" value={summary?.totalIssues || 0} />
                  <StatPill icon={<Star className="h-4 w-4" />} label="Stars" value={summary?.totalStarsEarned || 0} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="gap-1 text-zinc-500 hover:text-white"
                  >
                    <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

                {/* Languages - Inline pills */}
                {yearStats?.languages && yearStats.languages.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {yearStats.languages.slice(0, 8).map((lang) => (
                      <div
                        key={lang.language}
                        className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-black/60 px-3 py-1 text-xs backdrop-blur-sm"
                      >
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: lang.color || '#6b7280' }}
                        />
                        <span className="text-zinc-300">{lang.language}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Achievements - Compact row */}
                {achievements.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {achievements.slice(0, 6).map((achievement) => (
                      <div
                        key={achievement.code}
                        className="flex items-center gap-2 rounded-full border border-yellow-800/50 bg-yellow-500/10 px-3 py-1.5 backdrop-blur-sm"
                        title={achievement.description}
                      >
                        <Trophy className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-yellow-300">{achievement.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Top Repos - Minimal cards */}
                {yearStats?.repos && yearStats.repos.length > 0 && (
                  <div className="grid gap-3 md:grid-cols-3">
                    {yearStats.repos.slice(0, 3).map((repo) => (
                      <div
                        key={repo.fullName}
                        className="rounded-lg border border-zinc-800/50 bg-black/40 p-3 backdrop-blur-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-zinc-200 truncate">
                            {repo.fullName.split('/')[1]}
                          </span>
                          <span className="text-xs text-purple-400">{repo.role}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
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
                )}

                {/* Collaborators - Avatar row */}
                {yearStats?.collaborators && yearStats.collaborators.length > 0 && (
                  <div className="flex justify-center">
                    <div className="flex -space-x-2">
                      {yearStats.collaborators.slice(0, 8).map((collab) => (
                        <Avatar
                          key={collab.username}
                          className="h-8 w-8 border-2 border-black ring-1 ring-zinc-800"
                          title={`@${collab.username}`}
                        >
                          <AvatarImage src={collab.avatarUrl || undefined} />
                          <AvatarFallback className="text-xs bg-zinc-800">{collab.username?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                      ))}
                      {yearStats.collaborators.length > 8 && (
                        <div className="h-8 w-8 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">
                          +{yearStats.collaborators.length - 8}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your 2025 Review</DialogTitle>
            <DialogDescription>
              {settings?.publicProfileEnabled
                ? 'Your profile is public. Share this link with others!'
                : 'Enable public profile in settings to share your review.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Copy Link */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Profile Link</label>
              <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2">
                  <Link className="h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    readOnly
                    value={`https://initialized.dev/u/${user.username}/2025`}
                    className="flex-1 bg-transparent text-sm text-zinc-200 outline-none"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyShareLink}
                  className="border-zinc-700 bg-transparent hover:bg-zinc-800"
                >
                  {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Share on Social</label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="gap-2 border-zinc-700 bg-transparent hover:bg-zinc-800"
                  onClick={() => {
                    const text = `Check out my GitHub Year in Review 2025! ${summary?.totalContributions || 0} contributions and counting.`;
                    const url = `https://initialized.dev/u/${user.username}/2025`;
                    window.open(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
                      '_blank'
                    );
                  }}
                >
                  <Twitter className="h-4 w-4" />
                  X / Twitter
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 border-zinc-700 bg-transparent hover:bg-zinc-800"
                  onClick={() => {
                    const url = `https://initialized.dev/u/${user.username}/2025`;
                    window.open(
                      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
                      '_blank'
                    );
                  }}
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Button>
              </div>
            </div>

            {/* Copy Pre-written Text */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Copy Share Text</label>
              <div className="rounded-md border border-zinc-700 bg-zinc-800 p-3">
                <p className="text-sm text-zinc-300">
                  Just checked my GitHub Year in Review 2025 on @initialized_dev!{' '}
                  {summary?.totalContributions || 0} contributions, {summary?.longestStreak || 0} day streak.
                  Check yours at initialized.dev
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 border-zinc-700 bg-transparent hover:bg-zinc-800"
                onClick={() => {
                  const text = `Just checked my GitHub Year in Review 2025 on @initialized_dev! ${summary?.totalContributions || 0} contributions, ${summary?.longestStreak || 0} day streak. Check yours at initialized.dev https://initialized.dev/u/${user.username}/2025`;
                  navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                <Copy className="h-4 w-4" />
                Copy Text
              </Button>
            </div>

            {/* Download Card (placeholder for future) */}
            <Button
              variant="outline"
              className="w-full gap-2 border-zinc-700 bg-transparent hover:bg-zinc-800"
              onClick={() => {
                window.open(`/api/og/2025?username=${user.username}`, '_blank');
              }}
            >
              <Download className="h-4 w-4" />
              Download Share Card
            </Button>

            {!settings?.publicProfileEnabled && (
              <div className="rounded-md border border-yellow-800 bg-yellow-900/20 p-3">
                <p className="text-sm text-yellow-500">
                  Your profile is private. Enable it in{' '}
                  <a href="/settings" className="underline hover:text-yellow-400">
                    settings
                  </a>{' '}
                  to allow others to view it.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-black/60 px-4 py-2 backdrop-blur-sm">
      <span className="text-zinc-500">{icon}</span>
      <span className="text-sm font-medium text-zinc-200">{value.toLocaleString()}</span>
      <span className="text-xs text-zinc-500">{label}</span>
    </div>
  );
}
