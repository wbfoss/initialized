// Demo user seed script for /u/demo/2025
// Run with: npx tsx prisma/seed.ts

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('🌱 Seeding demo user...');

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { username: 'demo' },
    update: {},
    create: {
      githubId: 'demo-github-id-12345',
      username: 'demo',
      name: 'Demo User',
      avatarUrl: 'https://avatars.githubusercontent.com/u/0?v=4',
      email: 'demo@initialized.dev',
    },
  });

  console.log(`✅ Created/updated demo user: ${demoUser.username}`);

  // Create demo settings (public profile enabled)
  await prisma.profileSettings.upsert({
    where: {
      userId_year: {
        userId: demoUser.id,
        year: 2025,
      },
    },
    update: {
      publicProfileEnabled: true,
    },
    create: {
      userId: demoUser.id,
      year: 2025,
      publicProfileEnabled: true,
      includePrivateRepos: false,
      themeVariant: 'nebula-blue',
    },
  });

  console.log('✅ Created demo settings');

  // Create demo year stats
  const summaryJson = {
    totalContributions: 2847,
    totalCommits: 1856,
    totalPRs: 234,
    totalIssues: 187,
    totalStarsEarned: 1250,
    contributionsByMonth: [
      { month: 1, count: 245 },
      { month: 2, count: 198 },
      { month: 3, count: 312 },
      { month: 4, count: 189 },
      { month: 5, count: 276 },
      { month: 6, count: 234 },
      { month: 7, count: 201 },
      { month: 8, count: 298 },
      { month: 9, count: 267 },
      { month: 10, count: 245 },
      { month: 11, count: 212 },
      { month: 12, count: 170 },
    ],
    topLanguages: [
      { language: 'TypeScript', percentage: 45.2, color: '#3178c6' },
      { language: 'JavaScript', percentage: 22.8, color: '#f7df1e' },
      { language: 'Python', percentage: 15.3, color: '#3572A5' },
      { language: 'Rust', percentage: 8.4, color: '#dea584' },
      { language: 'Go', percentage: 5.1, color: '#00ADD8' },
      { language: 'CSS', percentage: 3.2, color: '#563d7c' },
    ],
    longestStreak: 47,
    currentStreak: 12,
    mostActiveDay: 'Wednesday',
    mostActiveHour: 14,
  };

  const yearStats = await prisma.yearStats.upsert({
    where: {
      userId_year: {
        userId: demoUser.id,
        year: 2025,
      },
    },
    update: {
      summaryJson,
      lastFetchedAt: new Date(),
    },
    create: {
      userId: demoUser.id,
      year: 2025,
      summaryJson,
      lastFetchedAt: new Date(),
    },
  });

  console.log('✅ Created demo year stats');

  // Delete existing related data
  await prisma.repoStats.deleteMany({ where: { yearStatsId: yearStats.id } });
  await prisma.languageStats.deleteMany({ where: { yearStatsId: yearStats.id } });
  await prisma.collaboratorStats.deleteMany({ where: { yearStatsId: yearStats.id } });

  // Create demo repos
  const demoRepos = [
    {
      repoId: 'demo-repo-1',
      fullName: 'demo/awesome-project',
      description: 'An awesome full-stack web application with React and Node.js',
      starsGained2025: 523,
      commitsByUser2025: 456,
      prsByUser2025: 34,
      issuesByUser2025: 23,
      role: 'FLAGSHIP',
    },
    {
      repoId: 'demo-repo-2',
      fullName: 'demo/cli-tools',
      description: 'A collection of helpful CLI tools written in Rust',
      starsGained2025: 234,
      commitsByUser2025: 312,
      prsByUser2025: 28,
      issuesByUser2025: 15,
      role: 'PATROL',
    },
    {
      repoId: 'demo-repo-3',
      fullName: 'demo/ml-experiments',
      description: 'Machine learning experiments and notebooks',
      starsGained2025: 189,
      commitsByUser2025: 234,
      prsByUser2025: 19,
      issuesByUser2025: 12,
      role: 'PATROL',
    },
    {
      repoId: 'demo-repo-4',
      fullName: 'demo/design-system',
      description: 'A comprehensive design system for modern web apps',
      starsGained2025: 156,
      commitsByUser2025: 187,
      prsByUser2025: 45,
      issuesByUser2025: 34,
      role: 'PATROL',
    },
    {
      repoId: 'demo-repo-5',
      fullName: 'demo/api-gateway',
      description: 'High-performance API gateway built with Go',
      starsGained2025: 98,
      commitsByUser2025: 145,
      prsByUser2025: 12,
      issuesByUser2025: 8,
      role: 'PATROL',
    },
    {
      repoId: 'demo-repo-6',
      fullName: 'demo/dotfiles',
      description: 'Personal dotfiles and configurations',
      starsGained2025: 50,
      commitsByUser2025: 89,
      prsByUser2025: 5,
      issuesByUser2025: 3,
      role: 'SHUTTLE',
    },
  ];

  await prisma.repoStats.createMany({
    data: demoRepos.map((repo) => ({
      yearStatsId: yearStats.id,
      ...repo,
    })),
  });

  console.log('✅ Created demo repos');

  // Create demo language stats
  const demoLanguages = [
    { language: 'TypeScript', contributionShare: 45.2, color: '#3178c6' },
    { language: 'JavaScript', contributionShare: 22.8, color: '#f7df1e' },
    { language: 'Python', contributionShare: 15.3, color: '#3572A5' },
    { language: 'Rust', contributionShare: 8.4, color: '#dea584' },
    { language: 'Go', contributionShare: 5.1, color: '#00ADD8' },
    { language: 'CSS', contributionShare: 3.2, color: '#563d7c' },
  ];

  await prisma.languageStats.createMany({
    data: demoLanguages.map((lang) => ({
      yearStatsId: yearStats.id,
      ...lang,
      firstTimeIn2025: false,
    })),
  });

  console.log('✅ Created demo languages');

  // Create demo collaborators
  const demoCollaborators = [
    { githubId: 'collab-1', username: 'alice', avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4', interactionScore: 45 },
    { githubId: 'collab-2', username: 'bob', avatarUrl: 'https://avatars.githubusercontent.com/u/2?v=4', interactionScore: 38 },
    { githubId: 'collab-3', username: 'charlie', avatarUrl: 'https://avatars.githubusercontent.com/u/3?v=4', interactionScore: 32 },
    { githubId: 'collab-4', username: 'diana', avatarUrl: 'https://avatars.githubusercontent.com/u/4?v=4', interactionScore: 28 },
    { githubId: 'collab-5', username: 'eve', avatarUrl: 'https://avatars.githubusercontent.com/u/5?v=4', interactionScore: 24 },
  ];

  await prisma.collaboratorStats.createMany({
    data: demoCollaborators.map((collab) => ({
      yearStatsId: yearStats.id,
      ...collab,
    })),
  });

  console.log('✅ Created demo collaborators');

  // Create demo achievements
  const achievementDefs = [
    { code: 'STREAK_MASTER', name: 'Streak Master', description: 'Maintained a 30+ day contribution streak', icon: 'fire' },
    { code: 'CENTURY', name: 'Century', description: 'Made 100+ contributions in a single month', icon: 'trophy' },
    { code: 'POLYGLOT', name: 'Polyglot', description: 'Used 5+ programming languages', icon: 'languages' },
    { code: 'GALAXY_WANDERER', name: 'Galaxy Wanderer', description: 'Contributed to 10+ repositories', icon: 'rocket' },
    { code: 'CONSISTENT', name: 'Consistent', description: 'Made contributions every month', icon: 'calendar' },
    { code: 'THOUSAND_CLUB', name: 'Thousand Club', description: 'Made 1000+ contributions in the year', icon: 'star' },
  ];

  for (const def of achievementDefs) {
    const achievement = await prisma.achievement.upsert({
      where: { code: def.code },
      update: {},
      create: def,
    });

    await prisma.userAchievement.upsert({
      where: {
        userId_achievementId_year: {
          userId: demoUser.id,
          achievementId: achievement.id,
          year: 2025,
        },
      },
      update: {},
      create: {
        userId: demoUser.id,
        achievementId: achievement.id,
        year: 2025,
      },
    });
  }

  console.log('✅ Created demo achievements');

  console.log('\n🎉 Demo user seeded successfully!');
  console.log('   Visit: /u/demo/2025 to see the demo profile');

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
