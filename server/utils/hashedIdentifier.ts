import crypto from 'crypto';

import config from '../config';
import logger from '../logging/logger';

export const getDailySalt = (): string => {
  const now = new Date();
  const dateKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
  return dateKey;
};

export const generateHashedIdentifier = (
  ip: string | undefined,
  userAgent: string | undefined,
  salt?: string
): string => {
  const actualSalt = salt || getDailySalt();
  const data = `${ip || 'unknown'}-${userAgent || 'unknown'}-${actualSalt}`;

  const secret = config.analytics.hashSecret;
  if (!secret) {
    logger.error('HASH_SECRET environment variable is not set');
    return 'unknown';
  }

  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex')
    .substring(0, 16); // Truncate for brevity in logs
};
