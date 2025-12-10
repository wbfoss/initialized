// Simple rate limiting for API routes
// For production with high traffic, consider using Redis or Vercel KV

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (works for single instance, for multi-instance use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Track if cleanup is already scheduled (avoid multiple intervals in serverless)
let cleanupScheduled = false;

function scheduleCleanup() {
  if (cleanupScheduled) return;
  cleanupScheduled = true;

  // Clean up expired entries periodically
  const cleanup = () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  };

  // Run cleanup every minute, but only if there's something to clean
  setInterval(cleanup, 60000);
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check and update rate limit for a given identifier
 * Uses atomic-style check to prevent race conditions
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  scheduleCleanup();

  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // If no entry or entry expired, create new one
  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(identifier, newEntry);
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // Atomically check and increment
  // First check if we would exceed the limit
  const newCount = entry.count + 1;

  if (newCount > config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Update the count atomically by replacing the entire entry
  const updatedEntry: RateLimitEntry = {
    count: newCount,
    resetAt: entry.resetAt,
  };
  rateLimitStore.set(identifier, updatedEntry);

  return {
    success: true,
    remaining: config.maxRequests - newCount,
    resetAt: entry.resetAt,
  };
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };
}

// Default configs for different endpoints
export const RATE_LIMITS = {
  // Stats refresh - expensive operation, limit to 5 per hour
  statsRefresh: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  // Settings update - moderate limit
  settings: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
  },
  // General API - higher limit
  general: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  // Public profile API - prevent scraping
  publicProfile: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  },
} as const;
