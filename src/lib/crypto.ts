// Token encryption utilities for secure storage of OAuth tokens
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { getAuthSecret } from './config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;

// Cache the encryption key to avoid repeated derivation
let cachedKey: Buffer | null = null;

// Derive encryption key from AUTH_SECRET
function getEncryptionKey(): Buffer {
  if (cachedKey) {
    return cachedKey;
  }
  const secret = getAuthSecret();
  // Use a fixed salt derived from the secret itself for consistency
  const salt = scryptSync(secret, 'initialized-salt', SALT_LENGTH);
  cachedKey = scryptSync(secret, salt, KEY_LENGTH);
  return cachedKey;
}

/**
 * Encrypts a string value using AES-256-GCM
 * Returns base64 encoded string: iv:authTag:encryptedData
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  // Combine iv:authTag:encrypted as base64
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypts a string that was encrypted with encrypt()
 */
export function decrypt(encryptedValue: string): string {
  const key = getEncryptionKey();
  const parts = encryptedValue.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted value format');
  }

  const [ivBase64, authTagBase64, encryptedBase64] = parts;
  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedBase64, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Check if a value is encrypted (has the expected format)
 */
export function isEncrypted(value: string): boolean {
  const parts = value.split(':');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}
