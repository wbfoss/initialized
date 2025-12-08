import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PublicProfileClient } from './profile-client';

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: { name: true, username: true },
  });

  if (!user) {
    return {
      title: 'Profile Not Found | initialized.dev',
    };
  }

  const displayName = user.name || user.username;

  return {
    title: `${displayName}'s 2025 | initialized.dev`,
    description: `Check out ${displayName}'s GitHub Year in Review 2025 on initialized.dev`,
    openGraph: {
      title: `${displayName}'s 2025 Year in Review`,
      description: `Check out ${displayName}'s GitHub activity visualized as a galactic dashboard`,
      url: `https://initialized.dev/u/${username}/2025`,
      images: [`/api/og/2025?username=${username}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayName}'s 2025 Year in Review`,
      description: `Check out ${displayName}'s GitHub activity visualized as a galactic dashboard`,
      images: [`/api/og/2025?username=${username}`],
    },
  };
}

export default async function PublicProfile({ params }: PageProps) {
  const { username } = await params;

  // Find user
  const user = await prisma.user.findUnique({
    where: { username },
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
  // Default to public if no settings exist (publicProfileEnabled defaults to true)
  const settings = user.settings[0];
  const isPublic = settings?.publicProfileEnabled ?? true;

  if (!isPublic) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">Profile is Private</h1>
          <p className="text-zinc-400">
            @{username} has made their 2025 Year in Review private.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-medium text-white hover:from-blue-600 hover:to-purple-700"
          >
            Create your own
          </Link>
        </div>
      </div>
    );
  }

  // Get year stats
  const yearStats = await prisma.yearStats.findUnique({
    where: {
      userId_year: {
        userId: user.id,
        year: 2025,
      },
    },
    include: {
      repos: {
        select: {
          fullName: true,
          description: true,
          starsGained2025: true,
          commitsByUser2025: true,
          role: true,
        },
      },
      languages: {
        select: {
          language: true,
          contributionShare: true,
          color: true,
        },
      },
      collaborators: {
        select: {
          username: true,
          avatarUrl: true,
          interactionScore: true,
        },
      },
    },
  });

  if (!yearStats) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">No Data Available</h1>
          <p className="text-zinc-400">
            @{username} hasn&apos;t generated their 2025 Year in Review yet.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-medium text-white hover:from-blue-600 hover:to-purple-700"
          >
            Create your own
          </Link>
        </div>
      </div>
    );
  }

  // Get achievements
  const achievements = await prisma.userAchievement.findMany({
    where: {
      userId: user.id,
      year: 2025,
    },
    include: {
      achievement: {
        select: {
          code: true,
          name: true,
          description: true,
          icon: true,
        },
      },
    },
  });

  return (
    <PublicProfileClient
      user={{
        username: user.username,
        name: user.name,
        avatarUrl: user.avatarUrl,
        githubCreatedAt: user.githubCreatedAt?.toISOString() || null,
      }}
      yearStats={{
        summaryJson: yearStats.summaryJson,
        repos: yearStats.repos,
        languages: yearStats.languages,
        collaborators: yearStats.collaborators,
      }}
      achievements={achievements.map((ua) => ua.achievement)}
      themeVariant={settings?.themeVariant ?? 'nebula-blue'}
    />
  );
}
