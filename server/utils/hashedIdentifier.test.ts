import crypto from 'crypto';

import { generateHashedIdentifier, getDailySalt } from './hashedIdentifier';

describe('hashedIdentifier', () => {
  const originalEnv = process.env.HASH_SECRET;

  beforeAll(() => {
    process.env.HASH_SECRET = 'test-secret-key';
  });

  afterAll(() => {
    process.env.HASH_SECRET = originalEnv;
  });

  describe('getDailySalt', () => {
    it('generates a date-based salt string', () => {
      const salt = getDailySalt();
      expect(salt).toMatch(/^\d{4}-\d{1,2}-\d{1,2}$/);
    });

    it('generates the same salt when called multiple times on the same day', () => {
      const salt1 = getDailySalt();
      const salt2 = getDailySalt();
      expect(salt1).toBe(salt2);
    });
  });

  describe('generateHashedIdentifier', () => {
    it('generates a 16-character hex hash', () => {
      const hash = generateHashedIdentifier('192.168.1.1', 'Mozilla/5.0', '2025-01-15');
      expect(hash).toHaveLength(16);
      expect(hash).toMatch(/^[0-9a-f]{16}$/);
    });

    it('generates consistent hashes for same IP + UA on same day', () => {
      const ip = '192.168.1.1';
      const ua = 'Mozilla/5.0';
      const salt = '2025-01-15';

      const hash1 = generateHashedIdentifier(ip, ua, salt);
      const hash2 = generateHashedIdentifier(ip, ua, salt);

      expect(hash1).toBe(hash2);
    });

    it('generates different hashes for different days', () => {
      const ip = '192.168.1.1';
      const ua = 'Mozilla/5.0';

      const hash1 = generateHashedIdentifier(ip, ua, '2025-01-15');
      const hash2 = generateHashedIdentifier(ip, ua, '2025-01-16');

      expect(hash1).not.toBe(hash2);
    });

    it('generates different hashes for different IPs', () => {
      const salt = '2025-01-15';
      const ua = 'Mozilla/5.0';

      const hash1 = generateHashedIdentifier('192.168.1.1', ua, salt);
      const hash2 = generateHashedIdentifier('192.168.1.2', ua, salt);

      expect(hash1).not.toBe(hash2);
    });

    it('generates different hashes for different User-Agents', () => {
      const salt = '2025-01-15';
      const ip = '192.168.1.1';

      const hash1 = generateHashedIdentifier(ip, 'Mozilla/5.0', salt);
      const hash2 = generateHashedIdentifier(ip, 'Chrome/120.0', salt);

      expect(hash1).not.toBe(hash2);
    });

    it('handles missing IP gracefully', () => {
      const hash = generateHashedIdentifier(undefined, 'Mozilla/5.0', '2025-01-15');
      expect(hash).toBeTruthy();
      expect(hash).toHaveLength(16);
    });

    it('handles missing User-Agent gracefully', () => {
      const hash = generateHashedIdentifier('192.168.1.1', undefined, '2025-01-15');
      expect(hash).toBeTruthy();
      expect(hash).toHaveLength(16);
    });

    it('handles missing IP and User-Agent gracefully', () => {
      const hash = generateHashedIdentifier(undefined, undefined, '2025-01-15');
      expect(hash).toBeTruthy();
      expect(hash).toHaveLength(16);
    });

    it('generates different hashes for undefined vs defined values', () => {
      const salt = '2025-01-15';
      const ua = 'Mozilla/5.0';

      const hashWithUndefined = generateHashedIdentifier(undefined, ua, salt);
      const hashWithIP = generateHashedIdentifier('192.168.1.1', ua, salt);

      expect(hashWithUndefined).not.toBe(hashWithIP);
    });

    it('uses daily salt when no salt is provided', () => {
      const ip = '192.168.1.1';
      const ua = 'Mozilla/5.0';

      const hash1 = generateHashedIdentifier(ip, ua);
      const hash2 = generateHashedIdentifier(ip, ua);

      // Should be consistent within the same day
      expect(hash1).toBe(hash2);
    });

    it('generates different hashes than SHA256 of just the IP', () => {
      const ip = '192.168.1.1';
      const ua = 'Mozilla/5.0';
      const salt = '2025-01-15';

      const hashedId = generateHashedIdentifier(ip, ua, salt);
      const simpleHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);

      // Ensures we're properly mixing IP + UA + salt
      expect(hashedId).not.toBe(simpleHash);
    });
  });
});
