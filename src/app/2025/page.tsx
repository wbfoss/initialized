import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardClient } from './dashboard-client';

export default async function Dashboard2025() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/');
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect('/');
  }

  // Get year stats
  const yearStats = await prisma.yearStats.findUnique({
    where: {
      userId_year: {
        userId: session.user.id,
        year: 2025,
      },
    },
    include: {
      repos: true,
      languages: true,
      collaborators: true,
    },
  });

  // Get achievements
  const achievements = await prisma.userAchievement.findMany({
    where: {
      userId: session.user.id,
      year: 2025,
    },
    include: {
      achievement: true,
    },
  });

  // Get settings
  const settings = await prisma.profileSettings.findUnique({
    where: {
      userId_year: {
        userId: session.user.id,
        year: 2025,
      },
    },
  });

  return (
    <DashboardClient
      user={{
        id: user.id,
        username: user.username,
        name: user.name,
        avatarUrl: user.avatarUrl,
      }}
      yearStats={yearStats}
      achievements={achievements.map((ua) => ({
        code: ua.achievement.code,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        earnedAt: ua.earnedAt,
      }))}
      settings={settings}
    />
  );
}
