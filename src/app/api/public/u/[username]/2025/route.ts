import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    username: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { username } = await params;
    const year = 2025;

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        settings: {
          where: { year },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if public profile is enabled
    const settings = user.settings[0];
    if (!settings?.publicProfileEnabled) {
      return NextResponse.json(
        { error: 'This profile is not public' },
        { status: 403 }
      );
    }

    // Get year stats (without private data)
    const yearStats = await prisma.yearStats.findUnique({
      where: {
        userId_year: {
          userId: user.id,
          year,
        },
      },
      include: {
        repos: {
          select: {
            fullName: true,
            description: true,
            starsGained2025: true,
            commitsByUser2025: true,
            prsByUser2025: true,
            issuesByUser2025: true,
            role: true,
            languagesJson: true,
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
      return NextResponse.json(
        { error: 'Stats not available' },
        { status: 404 }
      );
    }

    // Get user achievements
    const achievements = await prisma.userAchievement.findMany({
      where: {
        userId: user.id,
        year,
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

    return NextResponse.json({
      user: {
        username: user.username,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      year,
      summary: yearStats.summaryJson,
      repos: yearStats.repos,
      languages: yearStats.languages,
      collaborators: yearStats.collaborators,
      achievements: achievements.map((ua) => ua.achievement),
      themeVariant: settings.themeVariant,
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
