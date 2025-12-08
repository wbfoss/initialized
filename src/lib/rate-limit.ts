// Simple rate limiting for API routes
// For production with high traffic, consider using Redis or Vercel KV

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (works for single instance, for multi-instance use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

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
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // If no entry or entry expired, create new one
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count++;
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
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
} as const;
