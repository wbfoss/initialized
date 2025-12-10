import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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

    const includePrivate = user.settings[0]?.includePrivateRepos || false;

    // Fetch data from GitHub with individual error handling
    let profile, contributions, repos, collaborators, ownedOrgs, totalOwnedStars;
    try {
      // First, fetch owned orgs (needed for repo ownership check and star count)
      ownedOrgs = await fetchUserOwnedOrgs(account.accessToken);

      // Then fetch all other data in parallel
      [profile, contributions, repos, collaborators, totalOwnedStars] = await Promise.all([
        fetchUserCoreProfile(account.accessToken),
        fetchUserContributionsForYear(account.accessToken, user.username, year),
        fetchUserReposForYear(account.accessToken, user.username, year, includePrivate, ownedOrgs),
        fetchCollaboratorsForYear(account.accessToken, user.username, year),
        fetchTotalOwnedRepoStars(account.accessToken, user.username, ownedOrgs),
      ]);
    } catch (githubError) {
      console.error('GitHub API error:', githubError);
      return NextResponse.json(
        { error: 'Failed to fetch data from GitHub. Please try again.' },
        { status: 502 }
      );
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

      // Upsert achievements
      for (const code of earnedAchievementCodes) {
        const achievementDef = ACHIEVEMENTS.find((a) => a.code === code);
        if (!achievementDef) continue;

        // Get or create the achievement
        const achievement = await tx.achievement.upsert({
          where: { code },
          update: {},
          create: {
            code,
            name: achievementDef.name,
            description: achievementDef.description,
            icon: achievementDef.icon,
          },
        });

        // Link to user
        await tx.userAchievement.upsert({
          where: {
            userId_achievementId_year: {
              userId: user.id,
              achievementId: achievement.id,
              year,
            },
          },
          update: {},
          create: {
            userId: user.id,
            achievementId: achievement.id,
            year,
          },
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
    return NextResponse.json(
      { error: 'Failed to refresh stats. Please try again.' },
      { status: 500 }
    );
  }
}
