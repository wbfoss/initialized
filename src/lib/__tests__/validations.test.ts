import { describe, it, expect } from 'vitest';
import {
  statsRefreshSchema,
  settingsUpdateSchema,
  yearQuerySchema,
  usernameSchema,
  validateInput,
} from '../validations';

describe('Validation Schemas', () => {
  describe('statsRefreshSchema', () => {
    it('should accept valid year', () => {
      const result = statsRefreshSchema.safeParse({ year: 2025 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.year).toBe(2025);
      }
    });

    it('should use default year when not provided', () => {
      const result = statsRefreshSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.year).toBe(2025);
      }
    });

    it('should reject year out of range', () => {
      const result = statsRefreshSchema.safeParse({ year: 2015 });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer year', () => {
      const result = statsRefreshSchema.safeParse({ year: 2025.5 });
      expect(result.success).toBe(false);
    });
  });

  describe('settingsUpdateSchema', () => {
    it('should accept valid settings', () => {
      const result = settingsUpdateSchema.safeParse({
        year: 2025,
        publicProfileEnabled: true,
        includePrivateRepos: false,
        themeVariant: 'nebula-blue',
      });
      expect(result.success).toBe(true);
    });

    it('should accept partial settings', () => {
      const result = settingsUpdateSchema.safeParse({
        year: 2025,
        publicProfileEnabled: true,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid theme variant', () => {
      const result = settingsUpdateSchema.safeParse({
        year: 2025,
        themeVariant: 'invalid-theme',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('yearQuerySchema', () => {
    it('should transform string to number', () => {
      const result = yearQuerySchema.safeParse({ year: '2025' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.year).toBe(2025);
      }
    });

    it('should use default when undefined', () => {
      const result = yearQuerySchema.safeParse({ year: undefined });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.year).toBe(2025);
      }
    });
  });

  describe('usernameSchema', () => {
    it('should accept valid GitHub usernames', () => {
      expect(usernameSchema.safeParse('octocat').success).toBe(true);
      expect(usernameSchema.safeParse('user-name').success).toBe(true);
      expect(usernameSchema.safeParse('user123').success).toBe(true);
    });

    it('should reject invalid usernames', () => {
      expect(usernameSchema.safeParse('').success).toBe(false);
      expect(usernameSchema.safeParse('-invalid').success).toBe(false);
      expect(usernameSchema.safeParse('a'.repeat(40)).success).toBe(false);
    });
  });

  describe('validateInput', () => {
    it('should return success with valid data', () => {
      const result = validateInput(statsRefreshSchema, { year: 2025 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.year).toBe(2025);
      }
    });

    it('should return error with invalid data', () => {
      const result = validateInput(statsRefreshSchema, { year: 'invalid' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('year');
      }
    });
  });
});
