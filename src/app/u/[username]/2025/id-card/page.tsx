import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { IDCardClient } from './id-card-client';

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;

  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: 'insensitive',
      }
    },
    select: { name: true, username: true },
  });

  if (!user) {
    return {
      title: 'ID Card Not Found | initialized.dev',
    };
  }

  const displayName = user.name || user.username;

  return {
    title: `${displayName}'s Starfleet ID | initialized.dev`,
    description: `${displayName}'s official Starfleet Developer Command identification card`,
    openGraph: {
      title: `${displayName}'s Starfleet ID Card`,
      description: `Official Starfleet Developer Command identification for ${displayName}`,
      url: `https://initialized.dev/u/${user.username}/2025/id-card`,
      images: [`/api/og/id-card?username=${user.username}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayName}'s Starfleet ID Card`,
      description: `Official Starfleet Developer Command identification for ${displayName}`,
      images: [`/api/og/id-card?username=${user.username}`],
    },
  };
}

export default async function IDCardPage({ params }: PageProps) {
  const { username } = await params;
  const session = await auth();

  // Find user (case-insensitive)
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: 'insensitive',
      }
    },
    include: {
      settings: {
        where: { year: 2025 },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Check if public profile is enabled
  const settings = user.settings[0];
  const isPublic = settings?.publicProfileEnabled ?? true;

  if (!isPublic) {
    notFound();
  }

  // Get year stats for additional info
  const yearStats = await prisma.yearStats.findUnique({
    where: {
      userId_year: {
        userId: user.id,
        year: 2025,
      },
    },
    include: {
      languages: {
        take: 3,
        orderBy: { contributionShare: 'desc' },
      },
    },
  });

  // Get achievements with details
  const achievements = await prisma.userAchievement.findMany({
    where: {
      userId: user.id,
      year: 2025,
    },
    include: {
      achievement: true,
    },
    orderBy: {
      earnedAt: 'desc',
    },
  });

  const summary = yearStats?.summaryJson as {
    totalContributions?: number;
    totalCommits?: number;
    longestStreak?: number;
  } | null;

  // Check if current viewer is logged in and if they're viewing their own card
  const isLoggedIn = !!session?.user;
  const isOwnCard = session?.user?.id === user.id;

  return (
    <IDCardClient
      user={{
        username: user.username,
        name: user.name,
        avatarUrl: user.avatarUrl,
        githubCreatedAt: user.githubCreatedAt?.toISOString() || null,
        githubId: user.githubId,
      }}
      stats={{
        totalContributions: summary?.totalContributions || 0,
        totalCommits: summary?.totalCommits || 0,
        longestStreak: summary?.longestStreak || 0,
        achievementCount: achievements.length,
        topLanguages: yearStats?.languages.map(l => l.language) || [],
      }}
      achievements={achievements.map(a => ({
        code: a.achievement.code,
        name: a.achievement.name,
      }))}
      viewer={{
        isLoggedIn,
        isOwnCard,
        username: session?.user?.username || null,
      }}
    />
  );
}
