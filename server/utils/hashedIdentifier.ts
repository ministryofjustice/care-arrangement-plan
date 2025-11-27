import crypto from 'crypto';

/**
 * Generates a rolling salt that changes every 24 hours
 * This ensures user identifiers rotate daily for privacy
 *
 * @returns A date-based salt string in format YYYY-M-D (UTC)
 */
export const getDailySalt = (): string => {
  const now = new Date();
  const dateKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
  return dateKey;
};

/**
 * Creates a privacy-preserving hashed identifier from IP + User-Agent
 * This identifier rotates every 24 hours and cannot be traced back to the original IP
 *
 * Pattern used by GOV.UK services like Notify and Pay for GDPR-compliant analytics.
 * Allows deduplication and journey tracking within a 24-hour window without long-term tracking.
 *
 * @param ip - The user's IP address (from req.ip)
 * @param userAgent - The user's User-Agent header
 * @param salt - Optional salt override for testing (defaults to daily rotating salt)
 * @returns A 16-character hex hash that uniquely identifies the user for 24 hours
 */
export const generateHashedIdentifier = (
  ip: string | undefined,
  userAgent: string | undefined,
  salt?: string
): string => {
  const actualSalt = salt || getDailySalt();
  const data = `${ip || 'unknown'}-${userAgent || 'unknown'}-${actualSalt}`;

  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex')
    .substring(0, 16); // Truncate for brevity in logs
};
