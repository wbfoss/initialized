import { describe, it, expect, beforeAll } from 'vitest';
import { encrypt, decrypt, isEncrypted } from '../crypto';

describe('Crypto Utilities', () => {
  beforeAll(() => {
    // Set AUTH_SECRET for testing
    process.env.AUTH_SECRET = 'test-secret-key-for-encryption-testing-32chars!';
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt a string', () => {
      const plaintext = 'my-secret-token';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(encrypted).not.toBe(plaintext);
      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertext for same plaintext', () => {
      const plaintext = 'same-plaintext';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);

      // Different IVs should produce different ciphertext
      expect(encrypted1).not.toBe(encrypted2);

      // Both should decrypt to same value
      expect(decrypt(encrypted1)).toBe(plaintext);
      expect(decrypt(encrypted2)).toBe(plaintext);
    });

    it('should handle empty string', () => {
      const plaintext = '';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle special characters', () => {
      const plaintext = 'token-with-special!@#$%^&*()_+{}|:"<>?';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle unicode', () => {
      const plaintext = 'token-with-emoji-🚀-and-中文';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe('isEncrypted', () => {
    it('should return true for encrypted values', () => {
      const encrypted = encrypt('test');
      expect(isEncrypted(encrypted)).toBe(true);
    });

    it('should return false for plain text', () => {
      expect(isEncrypted('plain-text')).toBe(false);
      expect(isEncrypted('not:encrypted:properly:')).toBe(false);
    });

    it('should return false for empty strings', () => {
      expect(isEncrypted('')).toBe(false);
    });
  });
});
