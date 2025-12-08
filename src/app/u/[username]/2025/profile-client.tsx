'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  GitCommit,
  GitPullRequest,
  AlertCircle,
  Star,
  Flame,
  Trophy,
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
}

export function PublicProfileClient({
  user,
  yearStats,
  achievements,
}: PublicProfileProps) {
  const summary = yearStats.summaryJson as SummaryStats;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link
            href="/"
            className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-xl font-bold text-transparent"
          >
            initialized.dev
          </Link>
          <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-400">
            2025
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Profile Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <Avatar className="mb-4 h-24 w-24 border-4 border-zinc-700">
            <AvatarImage src={user.avatarUrl || undefined} />
            <AvatarFallback className="text-2xl">
              {user.username?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-bold">{user.name || user.username}</h1>
          <p className="text-zinc-400">@{user.username}</p>
          <p className="mt-2 text-lg text-purple-400">2025 Year in Review</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<GitCommit className="h-5 w-5 text-blue-400" />}
            label="Contributions"
            value={summary.totalContributions}
          />
          <StatCard
            icon={<GitPullRequest className="h-5 w-5 text-green-400" />}
            label="Pull Requests"
            value={summary.totalPRs}
          />
          <StatCard
            icon={<AlertCircle className="h-5 w-5 text-yellow-400" />}
            label="Issues"
            value={summary.totalIssues}
          />
          <StatCard
            icon={<Flame className="h-5 w-5 text-orange-400" />}
            label="Longest Streak"
            value={summary.longestStreak}
            suffix=" days"
          />
        </div>

        {/* Repositories */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Top Repositories</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {yearStats.repos.slice(0, 6).map((repo) => (
              <Card key={repo.fullName} className="border-zinc-800 bg-zinc-900/50">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium text-zinc-200">
                      {repo.fullName}
                    </CardTitle>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        repo.role === 'FLAGSHIP'
                          ? 'bg-purple-500/20 text-purple-400'
                          : repo.role === 'PATROL'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-zinc-500/20 text-zinc-400'
                      }`}
                    >
                      {repo.role}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 line-clamp-2 text-sm text-zinc-400">
                    {repo.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {repo.starsGained2025}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitCommit className="h-4 w-4" />
                      {repo.commitsByUser2025}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Languages */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Languages</h2>
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                {yearStats.languages.map((lang) => (
                  <div
                    key={lang.language}
                    className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/50 px-4 py-2"
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: lang.color || '#6b7280' }}
                    />
                    <span className="text-sm font-medium text-zinc-200">
                      {lang.language}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {lang.contributionShare.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Collaborators */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Collaborators</h2>
          <div className="flex flex-wrap gap-4">
            {yearStats.collaborators.slice(0, 10).map((collab) => (
              <div key={collab.username} className="flex flex-col items-center gap-2">
                <Avatar className="h-12 w-12 border-2 border-zinc-700">
                  <AvatarImage src={collab.avatarUrl || undefined} />
                  <AvatarFallback>{collab.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-zinc-400">@{collab.username}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements */}
        {achievements.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-semibold">Achievements</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.code}
                  className="border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-800"
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="rounded-full bg-yellow-500/20 p-3">
                      <Trophy className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-200">{achievement.name}</p>
                      <p className="text-xs text-zinc-500">{achievement.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 font-medium text-white hover:from-blue-600 hover:to-purple-700"
          >
            Create Your Own 2025 Review
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 text-center text-sm text-zinc-500">
        <Link href="/" className="hover:text-white">
          initialized.dev
        </Link>
        {' · '}
        <a
          href="https://github.com/wbfoss/initialized"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white"
        >
          Open Source
        </a>
      </footer>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix = '',
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="rounded-full bg-zinc-800 p-3">{icon}</div>
        <div>
          <p className="text-2xl font-bold text-zinc-100">
            {value.toLocaleString()}
            {suffix}
          </p>
          <p className="text-sm text-zinc-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
