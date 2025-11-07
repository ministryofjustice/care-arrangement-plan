import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import type { Request, Response } from 'express-serve-static-core';
import { RedisStore } from 'rate-limit-redis';

import config from '../config';
import createCacheClient from '../data/cacheClient';
import logger from '../logger';

const setupRateLimit = () => {
  const router = Router();
  let store: RedisStore | undefined;

  if (config.cache.enabled) {
    const client = createCacheClient();
    client.connect().catch((err: Error) => logger.error(`Error connecting to cache`, err));
    store = new RedisStore({ sendCommand: (...args: string[]) => client.sendCommand(args) });
  }

  const rateLimitHandler = (request: Request, response: Response) => {
    const { production } = config;
    response.status(429).render('pages/errors/rateLimit', {
      production: config.production,
      title: production ? request.__('errors.rateLimit.title') : 'Too many requests',
    });
  };

  // General rate limit for all requests
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 250, // Limit each IP to 250 requests per 15 minutes
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    validate: { trustProxy: false }, // Don't warn about trusting the proxy
    store,
    skip: (req: Request) => {
      return '/health' === req.path || req.path.startsWith('/assets');
    },
    handler: rateLimitHandler,
  });

  // Stricter rate limit for download/PDF generation endpoints (resource-intensive)
  const downloadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit downloads to 20 per 15 minutes per IP
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
    store,
    handler: rateLimitHandler,
    skipSuccessfulRequests: false, // Count all requests, even successful ones
  });

  // Stricter rate limit for authentication endpoint
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit login attempts to 10 per 15 minutes per IP
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
    store,
    handler: rateLimitHandler,
    skipSuccessfulRequests: true, // Only count failed requests
  });

  // Apply specific limiters first (more specific routes)
  router.use('/download-pdf', downloadLimiter);
  router.use('/download-html', downloadLimiter);
  router.use('/print-pdf', downloadLimiter);
  router.use('/download-paper-form', downloadLimiter);
  router.use('/password', authLimiter);

  // Apply general limiter to all other routes
  router.use(generalLimiter);

  return router;
};

export default setupRateLimit;
