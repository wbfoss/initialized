import { describe, it, expect } from 'vitest';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '../rate-limit';

describe('Rate Limiting', () => {
  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const identifier = `test-${Date.now()}-1`;
      const config = { maxRequests: 5, windowMs: 60000 };

      const result = checkRateLimit(identifier, config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should decrement remaining count', () => {
      const identifier = `test-${Date.now()}-2`;
      const config = { maxRequests: 3, windowMs: 60000 };

      let result = checkRateLimit(identifier, config);
      expect(result.remaining).toBe(2);

      result = checkRateLimit(identifier, config);
      expect(result.remaining).toBe(1);

      result = checkRateLimit(identifier, config);
      expect(result.remaining).toBe(0);
    });

    it('should block requests exceeding limit', () => {
      const identifier = `test-${Date.now()}-3`;
      const config = { maxRequests: 2, windowMs: 60000 };

      checkRateLimit(identifier, config);
      checkRateLimit(identifier, config);
      const result = checkRateLimit(identifier, config);

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should have correct reset time', () => {
      const identifier = `test-${Date.now()}-4`;
      const config = { maxRequests: 5, windowMs: 60000 };
      const now = Date.now();

      const result = checkRateLimit(identifier, config);
      expect(result.resetAt).toBeGreaterThan(now);
      expect(result.resetAt).toBeLessThanOrEqual(now + config.windowMs + 100);
    });
  });

  describe('getRateLimitHeaders', () => {
    it('should return correct headers', () => {
      const result = {
        success: true,
        remaining: 5,
        resetAt: Date.now() + 60000,
      };

      const headers = getRateLimitHeaders(result);
      expect(headers['X-RateLimit-Remaining']).toBe('5');
      expect(headers['X-RateLimit-Reset']).toBeDefined();
    });
  });

  describe('RATE_LIMITS', () => {
    it('should have statsRefresh config', () => {
      expect(RATE_LIMITS.statsRefresh.maxRequests).toBe(5);
      expect(RATE_LIMITS.statsRefresh.windowMs).toBe(60 * 60 * 1000);
    });

    it('should have settings config', () => {
      expect(RATE_LIMITS.settings.maxRequests).toBe(20);
      expect(RATE_LIMITS.settings.windowMs).toBe(60 * 1000);
    });
  });
});
