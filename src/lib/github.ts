// GitHub API Service Layer
// Handles all GitHub API interactions for fetching user stats

import { APP_CONFIG } from './config';

const GITHUB_API_URL = APP_CONFIG.GITHUB_API_URL;
const GITHUB_GRAPHQL_URL = APP_CONFIG.GITHUB_GRAPHQL_URL;

// Custom error for expired/invalid tokens
export class GitHubTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubTokenError';
  }
}

// Types
export interface UserCoreProfile {
  id: number;
  login: string;
  name: string | null;
  avatarUrl: string;
  email: string | null;
  bio: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
}

export interface ContributionDay {
  date: string;
  contributionCount: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionData {
  totalContributions: number;
  weeks: ContributionWeek[];
  restrictedContributionsCount: number;
  totalCommitContributions: number;
  totalPullRequestContributions: number;
  totalIssueContributions: number;
  commitTimestamps: string[]; // ISO timestamps for calculating active hours
}

export interface RepoContributionData {
  repoId: string;
  fullName: string;
  description: string | null;
  isPrivate: boolean;
  isOwner: boolean; // Whether the user owns this repo
  primaryLanguage: string | null;
  languages: { name: string; percentage: number; color: string | null }[];
  stargazersCount: number;
  forksCount: number;
  commitsByUser: number;
  prsByUser: number;
  issuesByUser: number;
  role: 'FLAGSHIP' | 'PATROL' | 'SHUTTLE';
}

export interface CollaboratorData {
  githubId: string;
  username: string;
  avatarUrl: string | null;
  interactionScore: number;
}

export interface AggregatedStats {
  totalContributions: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalStarsEarned: number;
  contributionsByMonth: { month: number; count: number }[];
  topLanguages: { language: string; percentage: number; color: string | null }[];
  topRepos: RepoContributionData[];
  totalReposContributed: number; // Total number of repos contributed to (not limited to top 10)
  collaborators: CollaboratorData[];
  longestStreak: number;
  currentStreak: number;
  mostActiveDay: string;
  mostActiveHour: number;
  maxWeeklyContributions: number; // Maximum contributions in any single week
  followers: number; // GitHub followers count for rank calculation
}

// Helper for REST API calls
async function githubRest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${GITHUB_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    // Handle authentication errors specifically
    if (response.status === 401 || response.status === 403) {
      throw new GitHubTokenError(
        'GitHub access token is invalid or expired. Please re-authenticate.'
      );
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Helper for GraphQL API calls
async function githubGraphQL<T>(query: string, token: string, variables?: object): Promise<T> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    // Handle authentication errors specifically
    if (response.status === 401 || response.status === 403) {
      throw new GitHubTokenError(
        'GitHub access token is invalid or expired. Please re-authenticate.'
      );
    }
    throw new Error(`GitHub GraphQL error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    const errorMessage = data.errors[0]?.message || 'Unknown error';
    // Check for auth-related errors in GraphQL response
    if (errorMessage.toLowerCase().includes('unauthorized') ||
        errorMessage.toLowerCase().includes('bad credentials')) {
      throw new GitHubTokenError(
        'GitHub access token is invalid or expired. Please re-authenticate.'
      );
    }
    throw new Error(`GitHub GraphQL error: ${errorMessage}`);
  }

  return data.data;
}

// Fetch organizations where the user is an owner/admin
export async function fetchUserOwnedOrgs(token: string): Promise<string[]> {
  const query = `
    query {
      viewer {
        organizations(first: 100) {
          nodes {
            login
            viewerIsAMember
            viewerCanAdminister
          }
        }
      }
    }
  `;

  try {
    const data = await githubGraphQL<{
      viewer: {
        organizations: {
          nodes: Array<{
            login: string;
            viewerIsAMember: boolean;
            viewerCanAdminister: boolean;
          }>;
        };
      };
    }>(query, token, {});

    // Return orgs where user can administer (owner-level access)
    if (!data.viewer?.organizations?.nodes) {
      return [];
    }
    return data.viewer.organizations.nodes
      .filter((org) => org?.viewerCanAdminister)
      .map((org) => org.login.toLowerCase());
  } catch (error) {
    console.error('Error fetching user orgs:', error);
    return [];
  }
}

// Fetch total stars from ALL repos owned by user (personal + org repos where user is admin)
export async function fetchTotalOwnedRepoStars(
  token: string,
  username: string,
  ownedOrgs: string[]
): Promise<number> {
  let totalStars = 0;

  // 1. Fetch stars from user's personal repos
  const personalReposQuery = `
    query($username: String!, $first: Int!, $after: String) {
      user(login: $username) {
        repositories(first: $first, after: $after, ownerAffiliations: OWNER) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            stargazerCount
          }
        }
      }
    }
  `;

  interface PersonalReposResponse {
    user: {
      repositories: {
        pageInfo: { hasNextPage: boolean; endCursor: string };
        nodes: Array<{ stargazerCount: number }>;
      };
    };
  }

  let hasMore = true;
  let cursor: string | null = null;

  while (hasMore) {
    const data: PersonalReposResponse = await githubGraphQL<PersonalReposResponse>(
      personalReposQuery,
      token,
      { username, first: 100, after: cursor }
    );

    // Handle null user response
    if (!data.user?.repositories?.nodes) {
      break;
    }

    for (const repo of data.user.repositories.nodes) {
      totalStars += repo?.stargazerCount || 0;
    }

    hasMore = data.user.repositories.pageInfo?.hasNextPage || false;
    cursor = data.user.repositories.pageInfo?.endCursor || null;
  }

  // 2. Fetch stars from org repos where user is admin
  interface OrgReposResponse {
    organization: {
      repositories: {
        pageInfo: { hasNextPage: boolean; endCursor: string };
        nodes: Array<{ stargazerCount: number }>;
      };
    };
  }

  for (const orgLogin of ownedOrgs) {
    const orgReposQuery = `
      query($orgLogin: String!, $first: Int!, $after: String) {
        organization(login: $orgLogin) {
          repositories(first: $first, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              stargazerCount
            }
          }
        }
      }
    `;

    let orgHasMore = true;
    let orgCursor: string | null = null;

    while (orgHasMore) {
      try {
        const orgData: OrgReposResponse = await githubGraphQL<OrgReposResponse>(
          orgReposQuery,
          token,
          { orgLogin, first: 100, after: orgCursor }
        );

        // Handle null organization response
        if (!orgData.organization?.repositories?.nodes) {
          break;
        }

        for (const repo of orgData.organization.repositories.nodes) {
          totalStars += repo?.stargazerCount || 0;
        }

        orgHasMore = orgData.organization.repositories.pageInfo?.hasNextPage || false;
        orgCursor = orgData.organization.repositories.pageInfo?.endCursor || null;
      } catch (error) {
        console.error(`Error fetching org repos for ${orgLogin}:`, error);
        break;
      }
    }
  }

  return totalStars;
}

// Fetch user core profile
export async function fetchUserCoreProfile(token: string): Promise<UserCoreProfile> {
  const user = await githubRest<{
    id: number;
    login: string;
    name: string | null;
    avatar_url: string;
    email: string | null;
    bio: string | null;
    public_repos: number;
    followers: number;
    following: number;
    created_at: string;
  }>('/user', token);

  return {
    id: user.id,
    login: user.login,
    name: user.name,
    avatarUrl: user.avatar_url,
    email: user.email,
    bio: user.bio,
    publicRepos: user.public_repos,
    followers: user.followers,
    following: user.following,
    createdAt: user.created_at,
  };
}

// Fetch user contributions for a specific year using GraphQL
export async function fetchUserContributionsForYear(
  token: string,
  username: string,
  year: number
): Promise<ContributionData> {
  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;

  const query = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
          restrictedContributionsCount
          totalCommitContributions
          totalPullRequestContributions
          totalIssueContributions
          commitContributionsByRepository(maxRepositories: 50) {
            contributions(first: 100) {
              nodes {
                occurredAt
              }
            }
          }
        }
      }
    }
  `;

  const data = await githubGraphQL<{
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: ContributionWeek[];
        };
        restrictedContributionsCount: number;
        totalCommitContributions: number;
        totalPullRequestContributions: number;
        totalIssueContributions: number;
        commitContributionsByRepository: Array<{
          contributions: {
            nodes: Array<{ occurredAt: string }>;
          };
        }>;
      };
    } | null;
  }>(query, token, { username, from, to });

  // Handle null user (user doesn't exist or is deleted)
  if (!data.user) {
    throw new Error(`GitHub user '${username}' not found`);
  }

  const collection = data.user.contributionsCollection;

  // Handle null collection
  if (!collection) {
    return {
      totalContributions: 0,
      weeks: [],
      restrictedContributionsCount: 0,
      totalCommitContributions: 0,
      totalPullRequestContributions: 0,
      totalIssueContributions: 0,
      commitTimestamps: [],
    };
  }

  // Extract commit timestamps for hour analysis
  const commitTimestamps: string[] = [];
  for (const repo of collection.commitContributionsByRepository ?? []) {
    for (const commit of repo?.contributions?.nodes ?? []) {
      if (commit?.occurredAt) {
        commitTimestamps.push(commit.occurredAt);
      }
    }
  }

  return {
    totalContributions: collection.contributionCalendar?.totalContributions || 0,
    weeks: collection.contributionCalendar?.weeks ?? [],
    restrictedContributionsCount: collection.restrictedContributionsCount || 0,
    totalCommitContributions: collection.totalCommitContributions || 0,
    totalPullRequestContributions: collection.totalPullRequestContributions || 0,
    totalIssueContributions: collection.totalIssueContributions || 0,
    commitTimestamps,
  };
}

// Fetch user repos and their stats for a year
export async function fetchUserReposForYear(
  token: string,
  username: string,
  year: number,
  includePrivate: boolean = false,
  ownedOrgs: string[] = []
): Promise<RepoContributionData[]> {
  // First, get all repos the user has contributed to
  const query = `
    query($username: String!, $first: Int!, $after: String) {
      user(login: $username) {
        repositoriesContributedTo(
          first: $first
          after: $after
          contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]
          includeUserRepositories: true
        ) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            id
            nameWithOwner
            description
            isPrivate
            owner {
              login
            }
            primaryLanguage {
              name
              color
            }
            languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  name
                  color
                }
              }
            }
            stargazerCount
            forkCount
          }
        }
      }
    }
  `;

  interface RepoQueryResult {
    user: {
      repositoriesContributedTo: {
        pageInfo: { hasNextPage: boolean; endCursor: string };
        nodes: Array<{
          id: string;
          nameWithOwner: string;
          description: string | null;
          isPrivate: boolean;
          owner: { login: string };
          primaryLanguage: { name: string; color: string } | null;
          languages: {
            edges: Array<{
              size: number;
              node: { name: string; color: string | null };
            }>;
          };
          stargazerCount: number;
          forkCount: number;
        }>;
      };
    } | null;
  }

  const repos: RepoContributionData[] = [];
  let continueLoop: boolean = true;
  let cursor: string | null = null;

  while (continueLoop) {
    const result: RepoQueryResult = await githubGraphQL<RepoQueryResult>(query, token, {
      username,
      first: 50,
      after: cursor,
    });

    // Handle null user
    if (!result.user) {
      throw new Error(`GitHub user '${username}' not found`);
    }

    const repoData = result.user.repositoriesContributedTo;

    // Handle null repoData
    if (!repoData?.nodes) {
      break;
    }

    for (const repo of repoData.nodes) {
      // Skip null repos or private repos if not included
      if (!repo || (repo.isPrivate && !includePrivate)) continue;

      // Check if user owns this repo (user's own repo OR org where user is admin)
      const ownerLower = repo.owner?.login?.toLowerCase() || '';
      const usernameLower = username.toLowerCase();
      const isOwner = ownerLower === usernameLower || ownedOrgs.includes(ownerLower);

      // Calculate language percentages
      const languageEdges = repo.languages?.edges || [];
      const totalSize = languageEdges.reduce((sum, edge) => sum + (edge?.size || 0), 0);
      const languages = languageEdges.map((edge) => ({
        name: edge?.node?.name || 'Unknown',
        percentage: totalSize > 0 ? ((edge?.size || 0) / totalSize) * 100 : 0,
        color: edge?.node?.color || null,
      }));

      repos.push({
        repoId: repo.id,
        fullName: repo.nameWithOwner,
        description: repo.description,
        isPrivate: repo.isPrivate,
        isOwner,
        primaryLanguage: repo.primaryLanguage?.name || null,
        languages,
        stargazersCount: repo.stargazerCount,
        forksCount: repo.forkCount,
        commitsByUser: 0, // Will be filled later
        prsByUser: 0,
        issuesByUser: 0,
        role: 'SHUTTLE', // Will be calculated based on contributions
      });
    }

    continueLoop = repoData.pageInfo?.hasNextPage || false;
    cursor = repoData.pageInfo?.endCursor || null;

    // Limit to avoid rate limits
    if (repos.length >= 100) break;
  }

  return repos;
}

// Fetch collaborators the user has worked with
export async function fetchCollaboratorsForYear(
  token: string,
  username: string,
  year: number
): Promise<CollaboratorData[]> {
  // Use GraphQL to find users the person has interacted with via PRs
  const query = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          pullRequestContributions(first: 100) {
            nodes {
              pullRequest {
                author {
                  login
                  avatarUrl
                }
                reviews(first: 10) {
                  nodes {
                    author {
                      login
                      avatarUrl
                    }
                  }
                }
              }
            }
          }
          issueContributions(first: 100) {
            nodes {
              issue {
                participants(first: 10) {
                  nodes {
                    login
                    avatarUrl
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;

  const data = await githubGraphQL<{
    user: {
      contributionsCollection: {
        pullRequestContributions: {
          nodes: Array<{
            pullRequest: {
              author: { login: string; avatarUrl: string } | null;
              reviews: {
                nodes: Array<{
                  author: { login: string; avatarUrl: string } | null;
                }>;
              } | null;
            } | null;  // PR can be null if deleted
          }>;
        };
        issueContributions: {
          nodes: Array<{
            issue: {
              participants: {
                nodes: Array<{ login: string; avatarUrl: string }>;
              } | null;
            } | null;  // Issue can be null if deleted
          }>;
        };
      };
    } | null;
  }>(query, token, { username, from, to });

  // Handle null user
  if (!data.user) {
    throw new Error(`GitHub user '${username}' not found`);
  }

  const collaboratorMap = new Map<string, CollaboratorData>();
  const collection = data.user.contributionsCollection;

  // Process PR contributors
  for (const pr of collection.pullRequestContributions?.nodes ?? []) {
    // Skip if pullRequest is null (deleted PRs)
    if (!pr.pullRequest) continue;

    if (pr.pullRequest.author && pr.pullRequest.author.login !== username) {
      const login = pr.pullRequest.author.login;
      const existing = collaboratorMap.get(login);
      if (existing) {
        existing.interactionScore += 1;
      } else {
        collaboratorMap.set(login, {
          githubId: login,
          username: login,
          avatarUrl: pr.pullRequest.author.avatarUrl,
          interactionScore: 1,
        });
      }
    }

    for (const review of pr.pullRequest?.reviews?.nodes ?? []) {
      if (review.author && review.author.login !== username) {
        const login = review.author.login;
        const existing = collaboratorMap.get(login);
        if (existing) {
          existing.interactionScore += 2; // Reviews are more valuable
        } else {
          collaboratorMap.set(login, {
            githubId: login,
            username: login,
            avatarUrl: review.author.avatarUrl,
            interactionScore: 2,
          });
        }
      }
    }
  }

  // Process issue participants
  for (const issue of collection.issueContributions?.nodes ?? []) {
    // Skip if issue is null (deleted issues)
    if (!issue.issue) continue;

    for (const participant of issue.issue?.participants?.nodes ?? []) {
      if (participant.login !== username) {
        const login = participant.login;
        const existing = collaboratorMap.get(login);
        if (existing) {
          existing.interactionScore += 1;
        } else {
          collaboratorMap.set(login, {
            githubId: login,
            username: login,
            avatarUrl: participant.avatarUrl,
            interactionScore: 1,
          });
        }
      }
    }
  }

  // Sort by interaction score and return top 20
  return Array.from(collaboratorMap.values())
    .sort((a, b) => b.interactionScore - a.interactionScore)
    .slice(0, 20);
}

// Compute aggregated stats from raw data
export function computeAggregatedYearStats(raw: {
  profile: UserCoreProfile;
  contributions: ContributionData;
  repos: RepoContributionData[];
  collaborators: CollaboratorData[];
  totalOwnedStars: number; // Total stars from ALL owned repos (personal + org)
}): AggregatedStats & { commitTimestamps: string[] } {
  const { profile, contributions, repos, collaborators, totalOwnedStars } = raw;

  // Calculate contributions by month
  const contributionsByMonth: { month: number; count: number }[] = Array.from(
    { length: 12 },
    (_, i) => ({ month: i + 1, count: 0 })
  );

  for (const week of contributions.weeks) {
    for (const day of week.contributionDays) {
      const month = new Date(day.date).getMonth();
      contributionsByMonth[month].count += day.contributionCount;
    }
  }

  // Calculate max weekly contributions
  let maxWeeklyContributions = 0;
  for (const week of contributions.weeks) {
    const weekTotal = week.contributionDays.reduce((sum, day) => sum + day.contributionCount, 0);
    maxWeeklyContributions = Math.max(maxWeeklyContributions, weekTotal);
  }

  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const allDays = contributions.weeks.flatMap((w) => w.contributionDays).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const day of allDays) {
    if (day.contributionCount > 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Current streak from most recent days
  for (let i = allDays.length - 1; i >= 0; i--) {
    if (allDays[i].contributionCount > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Find most active day
  const dayActivity: Record<string, number> = {};
  for (const day of allDays) {
    const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' });
    dayActivity[dayName] = (dayActivity[dayName] || 0) + day.contributionCount;
  }
  const mostActiveDay = Object.entries(dayActivity).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Monday';

  // Calculate most active hour from commit timestamps
  const hourActivity: Record<number, number> = {};
  for (const timestamp of contributions.commitTimestamps) {
    const hour = new Date(timestamp).getUTCHours();
    hourActivity[hour] = (hourActivity[hour] || 0) + 1;
  }
  const mostActiveHour = contributions.commitTimestamps.length > 0
    ? parseInt(Object.entries(hourActivity).sort((a, b) => b[1] - a[1])[0]?.[0] || '14')
    : 14;

  // Aggregate language stats
  const languageMap = new Map<string, { total: number; color: string | null }>();
  for (const repo of repos) {
    for (const lang of repo.languages) {
      const existing = languageMap.get(lang.name);
      if (existing) {
        existing.total += lang.percentage;
      } else {
        languageMap.set(lang.name, { total: lang.percentage, color: lang.color });
      }
    }
  }

  const totalLangPercentage = Array.from(languageMap.values()).reduce((sum, l) => sum + l.total, 0);
  const topLanguages = Array.from(languageMap.entries())
    .map(([language, data]) => ({
      language,
      percentage: totalLangPercentage > 0 ? (data.total / totalLangPercentage) * 100 : 0,
      color: data.color,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 10);

  // Assign repo roles based on stars (since we use GitHub's contribution data for commits)
  const sortedRepos = [...repos].sort((a, b) => b.stargazersCount - a.stargazersCount);
  sortedRepos.forEach((repo, index) => {
    if (index === 0) repo.role = 'FLAGSHIP';
    else if (index < 5) repo.role = 'PATROL';
    else repo.role = 'SHUTTLE';
  });

  return {
    totalContributions: contributions.totalContributions,
    totalCommits: contributions.totalCommitContributions,
    totalPRs: contributions.totalPullRequestContributions,
    totalIssues: contributions.totalIssueContributions,
    totalStarsEarned: totalOwnedStars, // Use accurate count from ALL owned repos
    contributionsByMonth,
    topLanguages,
    topRepos: sortedRepos.slice(0, 10),
    totalReposContributed: repos.length, // Full count before slicing
    collaborators,
    longestStreak,
    currentStreak,
    mostActiveDay,
    mostActiveHour,
    maxWeeklyContributions,
    followers: profile.followers, // For rank calculation
    commitTimestamps: contributions.commitTimestamps,
  };
}

// Achievement definitions and calculation
export interface AchievementCheck {
  code: string;
  name: string;
  description: string;
  icon: string;
  check: (stats: AggregatedStats & { commitTimestamps?: string[] }) => boolean;
}

// Helper to check if any commit was made during specific hours
function hasCommitsDuringHours(timestamps: string[], startHour: number, endHour: number): boolean {
  for (const ts of timestamps) {
    const hour = new Date(ts).getUTCHours();
    if (startHour <= endHour) {
      // Normal range (e.g., 6-12)
      if (hour >= startHour && hour < endHour) return true;
    } else {
      // Wrapping range (e.g., 22-6 for night owl)
      if (hour >= startHour || hour < endHour) return true;
    }
  }
  return false;
}

export const ACHIEVEMENTS: AchievementCheck[] = [
  {
    code: 'NIGHT_OWL',
    name: 'Night Owl',
    description: 'Made commits between midnight and 4 AM',
    icon: 'moon',
    check: (stats) => {
      const timestamps = stats.commitTimestamps || [];
      return hasCommitsDuringHours(timestamps, 0, 4);
    },
  },
  {
    code: 'EARLY_BIRD',
    name: 'Early Bird',
    description: 'Made commits between 5 AM and 7 AM',
    icon: 'sun',
    check: (stats) => {
      const timestamps = stats.commitTimestamps || [];
      return hasCommitsDuringHours(timestamps, 5, 7);
    },
  },
  {
    code: 'STREAK_MASTER',
    name: 'Streak Master',
    description: 'Maintained a 30+ day contribution streak',
    icon: 'fire',
    check: (stats) => stats.longestStreak >= 30,
  },
  {
    code: 'CENTURY',
    name: 'Century',
    description: 'Made 100+ contributions in a single month',
    icon: 'trophy',
    check: (stats) => stats.contributionsByMonth.some((m) => m.count >= 100),
  },
  {
    code: 'POLYGLOT',
    name: 'Polyglot',
    description: 'Used 5+ programming languages',
    icon: 'languages',
    check: (stats) => stats.topLanguages.length >= 5,
  },
  {
    code: 'GALAXY_WANDERER',
    name: 'Galaxy Wanderer',
    description: 'Contributed to 10+ repositories',
    icon: 'rocket',
    check: (stats) => (stats.totalReposContributed ?? stats.topRepos.length) >= 10,
  },
  {
    code: 'TEAM_PLAYER',
    name: 'Team Player',
    description: 'Collaborated with 10+ developers',
    icon: 'users',
    check: (stats) => stats.collaborators.length >= 10,
  },
  {
    code: 'CONSISTENT',
    name: 'Consistent',
    description: 'Made contributions every month',
    icon: 'calendar',
    check: (stats) => stats.contributionsByMonth.every((m) => m.count > 0),
  },
  {
    code: 'THOUSAND_CLUB',
    name: 'Thousand Club',
    description: 'Made 1000+ contributions in the year',
    icon: 'star',
    check: (stats) => stats.totalContributions >= 1000,
  },
  {
    code: 'PR_MACHINE',
    name: 'PR Machine',
    description: 'Opened 50+ pull requests',
    icon: 'git-pull-request',
    check: (stats) => stats.totalPRs >= 50,
  },
  {
    code: 'STAR_COLLECTOR',
    name: 'Star Collector',
    description: 'Own repositories with 100+ total stars',
    icon: 'stars',
    check: (stats) => stats.totalStarsEarned >= 100,
  },
  {
    code: 'BUG_HUNTER',
    name: 'Bug Hunter',
    description: 'Opened 30+ issues',
    icon: 'bug',
    check: (stats) => stats.totalIssues >= 30,
  },
  {
    code: 'OPEN_SOURCERER',
    name: 'Open Sourcerer',
    description: 'Contributed to 5+ public repositories',
    icon: 'globe',
    check: (stats) => stats.topRepos.filter((r) => !r.isPrivate).length >= 5,
  },
  {
    code: 'FIRST_CONTACT',
    name: 'First Contact',
    description: 'Made your first contribution of the year',
    icon: 'hand',
    check: (stats) => stats.totalContributions >= 1,
  },
  {
    code: 'WARP_SPEED',
    name: 'Warp Speed',
    description: 'Made 50+ contributions in a single week',
    icon: 'zap',
    check: (stats) => (stats.maxWeeklyContributions ?? 0) >= 50,
  },
  {
    code: 'WEEKEND_WARRIOR',
    name: 'Weekend Warrior',
    description: 'Made contributions on weekends',
    icon: 'calendar-check',
    check: (stats) => {
      const timestamps = stats.commitTimestamps || [];
      return timestamps.some((ts) => {
        const day = new Date(ts).getUTCDay();
        return day === 0 || day === 6; // Sunday or Saturday
      });
    },
  },
];

export function calculateAchievements(stats: AggregatedStats & { commitTimestamps?: string[] }): string[] {
  return ACHIEVEMENTS.filter((a) => a.check(stats)).map((a) => a.code);
}

// Security clearance level based on GitHub profile metrics
export interface ClearanceLevel {
  level: number;
  title: string;
}

export interface ClearanceInput {
  githubCreatedAt: string | Date | null;
  followers?: number;
  totalContributions?: number;
}

export function calculateClearanceLevel(input: ClearanceInput | string | Date | null): ClearanceLevel {
  // Support legacy call with just date
  if (input === null || typeof input === 'string' || input instanceof Date) {
    return calculateClearanceLevelFromScore({
      githubCreatedAt: input,
      followers: 0,
      totalContributions: 0,
    });
  }
  return calculateClearanceLevelFromScore(input);
}

function calculateClearanceLevelFromScore(input: ClearanceInput): ClearanceLevel {
  const { githubCreatedAt, followers = 0, totalContributions = 0 } = input;

  // Calculate years on GitHub
  let yearsOnGitHub = 0;
  if (githubCreatedAt) {
    const createdDate = typeof githubCreatedAt === 'string' ? new Date(githubCreatedAt) : githubCreatedAt;
    const now = new Date();
    yearsOnGitHub = (now.getTime() - createdDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  }

  // Scoring system (max 100 points):
  // - Account age: 0-40 points (4 points per year, max at 10 years)
  // - Followers: 0-30 points (logarithmic scale)
  // - Contributions: 0-30 points (logarithmic scale)

  const ageScore = Math.min(yearsOnGitHub * 4, 40);

  // Followers: log scale - 10 followers = 10pts, 100 = 20pts, 1000 = 30pts
  const followerScore = followers > 0 ? Math.min(Math.log10(followers) * 10, 30) : 0;

  // Contributions: log scale - 100 = 10pts, 1000 = 20pts, 10000 = 30pts
  const contributionScore = totalContributions > 0 ? Math.min(Math.log10(totalContributions) * 10, 30) : 0;

  const totalScore = ageScore + followerScore + contributionScore;

  // Map score to rank (0-100 scale)
  if (totalScore >= 85) return { level: 10, title: 'FLEET ADMIRAL' };
  if (totalScore >= 75) return { level: 9, title: 'ADMIRAL' };
  if (totalScore >= 65) return { level: 8, title: 'VICE ADMIRAL' };
  if (totalScore >= 55) return { level: 7, title: 'COMMODORE' };
  if (totalScore >= 45) return { level: 6, title: 'CAPTAIN' };
  if (totalScore >= 35) return { level: 5, title: 'COMMANDER' };
  if (totalScore >= 25) return { level: 4, title: 'LT COMMANDER' };
  if (totalScore >= 15) return { level: 3, title: 'LIEUTENANT' };
  if (totalScore >= 8) return { level: 2, title: 'LT JUNIOR GRADE' };
  return { level: 1, title: 'ENSIGN' };
}
