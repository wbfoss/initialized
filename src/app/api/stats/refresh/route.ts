import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { decrypt, isEncrypted } from '@/lib/crypto';
import { APP_CONFIG } from '@/lib/config';
import {
  fetchUserCoreProfile,
  fetchUserContributionsForYear,
  fetchUserReposForYear,
  fetchCollaboratorsForYear,
  fetchUserOwnedOrgs,
  fetchTotalOwnedRepoStars,
  computeAggregatedYearStats,
  calculateAchievements,
  ACHIEVEMENTS,
  GitHubTokenError,
} from '@/lib/github';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit';
import { statsRefreshSchema, validateInput } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting based on user ID
    const rateLimitResult = checkRateLimit(
      `refresh:${session.user.id}`,
      RATE_LIMITS.statsRefresh
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          resetAt: new Date(rateLimitResult.resetAt).toISOString(),
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Parse and validate input
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const validation = validateInput(statsRefreshSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: `Invalid input: ${validation.error}` },
        { status: 400 }
      );
    }

    const { year } = validation.data;

    // Get user and their OAuth account
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: true,
        settings: { where: { year } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const account = user.accounts.find((a) => a.provider === 'github');
    if (!account) {
      return NextResponse.json({ error: 'GitHub account not linked' }, { status: 400 });
    }

    // Validate access token exists
    if (!account.accessToken) {
      return NextResponse.json(
        { error: 'GitHub access token missing. Please re-authenticate.' },
        { status: 401 }
      );
    }

    // Decrypt the access token (handle both encrypted and legacy unencrypted tokens)
    let accessToken: string;
    try {
      accessToken = isEncrypted(account.accessToken)
        ? decrypt(account.accessToken)
        : account.accessToken;
    } catch (decryptError) {
      console.error('Failed to decrypt access token:', decryptError);
      return NextResponse.json(
        { error: 'Failed to decrypt access token. Please re-authenticate.' },
        { status: 401 }
      );
    }

    // Validate username exists
    if (!user.username) {
      return NextResponse.json(
        { error: 'Username not found. Please re-authenticate.' },
        { status: 400 }
      );
    }

    const includePrivate = user.settings[0]?.includePrivateRepos || false;

    // Fetch data from GitHub with individual error handling
    let profile, contributions, repos, collaborators, ownedOrgs, totalOwnedStars;

    try {
      ownedOrgs = await fetchUserOwnedOrgs(accessToken);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json({ error: `Failed to fetch orgs: ${msg}` }, { status: 502 });
    }

    try {
      profile = await fetchUserCoreProfile(accessToken);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json({ error: `Failed to fetch profile: ${msg}` }, { status: 502 });
    }

    try {
      contributions = await fetchUserContributionsForYear(accessToken, user.username, year);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json({ error: `Failed to fetch contributions: ${msg}` }, { status: 502 });
    }

    try {
      repos = await fetchUserReposForYear(accessToken, user.username, year, includePrivate, ownedOrgs);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json({ error: `Failed to fetch repos: ${msg}` }, { status: 502 });
    }

    try {
      collaborators = await fetchCollaboratorsForYear(accessToken, user.username, year);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json({ error: `Failed to fetch collaborators: ${msg}` }, { status: 502 });
    }

    try {
      totalOwnedStars = await fetchTotalOwnedRepoStars(accessToken, user.username, ownedOrgs);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json({ error: `Failed to fetch stars: ${msg}` }, { status: 502 });
    }

    // Compute aggregated stats
    const aggregatedStats = computeAggregatedYearStats({
      profile,
      contributions,
      repos,
      collaborators,
      totalOwnedStars,
    });

    // Calculate achievements
    const earnedAchievementCodes = calculateAchievements(aggregatedStats);

    // Use transaction for database operations
    await prisma.$transaction(async (tx) => {
      // Upsert YearStats
      const yearStats = await tx.yearStats.upsert({
        where: {
          userId_year: {
            userId: user.id,
            year,
          },
        },
        update: {
          summaryJson: aggregatedStats as object,
          lastFetchedAt: new Date(),
        },
        create: {
          userId: user.id,
          year,
          summaryJson: aggregatedStats as object,
          lastFetchedAt: new Date(),
        },
      });

      // Delete old related data
      await Promise.all([
        tx.repoStats.deleteMany({ where: { yearStatsId: yearStats.id } }),
        tx.languageStats.deleteMany({ where: { yearStatsId: yearStats.id } }),
        tx.collaboratorStats.deleteMany({ where: { yearStatsId: yearStats.id } }),
      ]);

      // Insert new repo stats
      if (aggregatedStats.topRepos.length > 0) {
        await tx.repoStats.createMany({
          data: aggregatedStats.topRepos.map((repo) => ({
            yearStatsId: yearStats.id,
            repoId: repo.repoId,
            fullName: repo.fullName,
            description: repo.description,
            starsGained2025: repo.stargazersCount,
            commitsByUser2025: repo.commitsByUser,
            prsByUser2025: repo.prsByUser,
            issuesByUser2025: repo.issuesByUser,
            role: repo.role,
            languagesJson: repo.languages,
          })),
        });
      }

      // Insert new language stats
      if (aggregatedStats.topLanguages.length > 0) {
        await tx.languageStats.createMany({
          data: aggregatedStats.topLanguages.map((lang) => ({
            yearStatsId: yearStats.id,
            language: lang.language,
            contributionShare: lang.percentage,
            firstTimeIn2025: false,
            color: lang.color,
          })),
        });
      }

      // Insert new collaborator stats
      if (aggregatedStats.collaborators.length > 0) {
        await tx.collaboratorStats.createMany({
          data: aggregatedStats.collaborators.map((collab) => ({
            yearStatsId: yearStats.id,
            githubId: collab.githubId,
            username: collab.username,
            avatarUrl: collab.avatarUrl,
            interactionScore: collab.interactionScore,
          })),
        });
      }

      // Batch upsert achievements - first ensure all achievement definitions exist
      const achievementDefsToCreate = earnedAchievementCodes
        .map((code) => ACHIEVEMENTS.find((a) => a.code === code))
        .filter((def): def is NonNullable<typeof def> => def !== undefined);

      // Create all achievements that don't exist yet
      for (const def of achievementDefsToCreate) {
        await tx.achievement.upsert({
          where: { code: def.code },
          update: {},
          create: {
            code: def.code,
            name: def.name,
            description: def.description,
            icon: def.icon,
          },
        });
      }

      // Get all achievement IDs in one query
      const achievements = await tx.achievement.findMany({
        where: { code: { in: earnedAchievementCodes } },
        select: { id: true, code: true },
      });

      // Delete old user achievements for this year and create new ones
      await tx.userAchievement.deleteMany({
        where: { userId: user.id, year },
      });

      if (achievements.length > 0) {
        await tx.userAchievement.createMany({
          data: achievements.map((achievement) => ({
            userId: user.id,
            achievementId: achievement.id,
            year,
          })),
        });
      }
    });

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalContributions: aggregatedStats.totalContributions,
          totalCommits: aggregatedStats.totalCommits,
          totalPRs: aggregatedStats.totalPRs,
          totalIssues: aggregatedStats.totalIssues,
        },
        achievements: earnedAchievementCodes,
      },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    console.error('Error refreshing stats:', error);

    // Handle token expiration/invalid token errors
    if (error instanceof GitHubTokenError) {
      return NextResponse.json(
        {
          error: error.message,
          code: 'TOKEN_EXPIRED',
          requiresReauth: true,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to refresh stats. Please try again.' },
      { status: 500 }
    );
  }
}
