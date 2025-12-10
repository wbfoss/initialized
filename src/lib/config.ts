// Application configuration constants
// Centralized configuration to avoid hardcoded values

export const APP_CONFIG = {
  // Current yearbook year - update this when rolling over to new year
  CURRENT_YEAR: 2025,

  // Year range for validation
  MIN_YEAR: 2020,
  MAX_YEAR: 2030,

  // Rate limiting defaults
  RATE_LIMITS: {
    STATS_REFRESH_MAX: 5,
    STATS_REFRESH_WINDOW_MS: 60 * 60 * 1000, // 1 hour
    SETTINGS_MAX: 20,
    SETTINGS_WINDOW_MS: 60 * 1000, // 1 minute
    GENERAL_MAX: 100,
    GENERAL_WINDOW_MS: 60 * 1000, // 1 minute
    PUBLIC_PROFILE_MAX: 30,
    PUBLIC_PROFILE_WINDOW_MS: 60 * 1000, // 1 minute
  },

  // GitHub API
  GITHUB_API_URL: 'https://api.github.com',
  GITHUB_GRAPHQL_URL: 'https://api.github.com/graphql',

  // Pagination limits
  MAX_REPOS_TO_FETCH: 100,
  MAX_COLLABORATORS_TO_RETURN: 20,
  TOP_LANGUAGES_LIMIT: 10,
  TOP_REPOS_LIMIT: 10,
} as const;

// Environment variable helpers
export function getAuthSecret(): string {
  // NextAuth v5 uses AUTH_SECRET
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET environment variable is required');
  }
  return secret;
}
