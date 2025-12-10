import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { yearQuerySchema, validateInput } from '@/lib/validations';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = checkRateLimit(
      `stats-overview:${session.user.id}`,
      RATE_LIMITS.general
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Input validation
    const { searchParams } = new URL(request.url);
    const validation = validateInput(yearQuerySchema, {
      year: searchParams.get('year') || undefined,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: `Invalid input: ${validation.error}` },
        { status: 400 }
      );
    }

    const { year } = validation.data;

    // Get year stats with related data
    const yearStats = await prisma.yearStats.findUnique({
      where: {
        userId_year: {
          userId: session.user.id,
          year,
        },
      },
      include: {
        repos: true,
        languages: true,
        collaborators: true,
      },
    });

    if (!yearStats) {
      return NextResponse.json(
        { error: 'Stats not found. Please refresh your data.' },
        { status: 404 }
      );
    }

    // Get user achievements for this year
    const achievements = await prisma.userAchievement.findMany({
      where: {
        userId: session.user.id,
        year,
      },
      include: {
        achievement: true,
      },
    });

    return NextResponse.json(
      {
        summary: yearStats.summaryJson,
        repos: yearStats.repos,
        languages: yearStats.languages,
        collaborators: yearStats.collaborators,
        achievements: achievements.map((ua) => ({
          code: ua.achievement.code,
          name: ua.achievement.name,
          description: ua.achievement.description,
          icon: ua.achievement.icon,
          earnedAt: ua.earnedAt,
        })),
        lastFetchedAt: yearStats.lastFetchedAt,
      },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    console.error('Error fetching stats overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
