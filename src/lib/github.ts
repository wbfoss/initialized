// GitHub API Service Layer
// Handles all GitHub API interactions for fetching user stats

const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

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
  collaborators: CollaboratorData[];
  longestStreak: number;
  currentStreak: number;
  mostActiveDay: string;
  mostActiveHour: number;
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
    throw new Error(`GitHub GraphQL error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    throw new Error(`GitHub GraphQL error: ${data.errors[0]?.message || 'Unknown error'}`);
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
    return data.viewer.organizations.nodes
      .filter((org) => org.viewerCanAdminister)
      .map((org) => org.login.toLowerCase());
  } catch (error) {
    console.error('Error fetching user orgs:', error);
    return [];
  }
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
    };
  }>(query, token, { username, from, to });

  // Extract commit timestamps for hour analysis
  const commitTimestamps: string[] = [];
  for (const repo of data.user.contributionsCollection.commitContributionsByRepository) {
    for (const commit of repo.contributions.nodes) {
      commitTimestamps.push(commit.occurredAt);
    }
  }

  return {
    totalContributions: data.user.contributionsCollection.contributionCalendar.totalContributions,
    weeks: data.user.contributionsCollection.contributionCalendar.weeks,
    restrictedContributionsCount: data.user.contributionsCollection.restrictedContributionsCount,
    totalCommitContributions: data.user.contributionsCollection.totalCommitContributions,
    totalPullRequestContributions: data.user.contributionsCollection.totalPullRequestContributions,
    totalIssueContributions: data.user.contributionsCollection.totalIssueContributions,
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
    };
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

    const repoData = result.user.repositoriesContributedTo;

    for (const repo of repoData.nodes) {
      // Skip private repos if not included
      if (repo.isPrivate && !includePrivate) continue;

      // Check if user owns this repo (user's own repo OR org where user is admin)
      const ownerLower = repo.owner.login.toLowerCase();
      const usernameLower = username.toLowerCase();
      const isOwner = ownerLower === usernameLower || ownedOrgs.includes(ownerLower);

      // Calculate language percentages
      const totalSize = repo.languages.edges.reduce((sum, edge) => sum + edge.size, 0);
      const languages = repo.languages.edges.map((edge) => ({
        name: edge.node.name,
        percentage: totalSize > 0 ? (edge.size / totalSize) * 100 : 0,
        color: edge.node.color,
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

    continueLoop = repoData.pageInfo.hasNextPage;
    cursor = repoData.pageInfo.endCursor;

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
              };
            };
          }>;
        };
        issueContributions: {
          nodes: Array<{
            issue: {
              participants: {
                nodes: Array<{ login: string; avatarUrl: string }>;
              };
            };
          }>;
        };
      };
    };
  }>(query, token, { username, from, to });

  const collaboratorMap = new Map<string, CollaboratorData>();

  // Process PR contributors
  for (const pr of data.user.contributionsCollection.pullRequestContributions.nodes) {
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

    for (const review of pr.pullRequest.reviews.nodes) {
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
  for (const issue of data.user.contributionsCollection.issueContributions.nodes) {
    for (const participant of issue.issue.participants.nodes) {
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
}): AggregatedStats & { commitTimestamps: string[] } {
  const { contributions, repos, collaborators } = raw;

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

  // Only count stars from repos the user owns
  const ownedReposStars = repos
    .filter((r) => r.isOwner)
    .reduce((sum, r) => sum + r.stargazersCount, 0);

  return {
    totalContributions: contributions.totalContributions,
    totalCommits: contributions.totalCommitContributions,
    totalPRs: contributions.totalPullRequestContributions,
    totalIssues: contributions.totalIssueContributions,
    totalStarsEarned: ownedReposStars,
    contributionsByMonth,
    topLanguages,
    topRepos: sortedRepos.slice(0, 10),
    collaborators,
    longestStreak,
    currentStreak,
    mostActiveDay,
    mostActiveHour,
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
    check: (stats) => stats.topRepos.length >= 10,
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
];

export function calculateAchievements(stats: AggregatedStats & { commitTimestamps?: string[] }): string[] {
  return ACHIEVEMENTS.filter((a) => a.check(stats)).map((a) => a.code);
}
