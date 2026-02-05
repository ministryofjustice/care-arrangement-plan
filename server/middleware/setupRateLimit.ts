import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express-serve-static-core';

import config from '../config';
import createRedisStore from '../utils/redisStoreFactory';

const setupRateLimit = () => {
  const router = Router();

  const isTestEnvironment = process.env.NODE_ENV === 'test';

  const rateLimitHandler = (request: Request, response: Response) => {
    const { production } = config;
    response.status(429).render('pages/errors/rateLimit', {
      production: config.production,
      title: production ? request.__('errors.rateLimit.title') : 'Too many requests',
    });
  };

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isTestEnvironment ? 15000 : 250, // Much higher limit for tests to avoid false failures
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    validate: { trustProxy: true },
    keyGenerator: (req: Request) => {
      return req.ip || 'unknown';
    },
    store: createRedisStore('general:'),
    skip: (req: Request) => {
      return '/health' === req.path || req.path.startsWith('/assets');
    },
    handler: rateLimitHandler,
  });

  // download/PDF generation endpoints (resource-intensive)
  const downloadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,// 15 minutes
    max: isTestEnvironment ? 1000 : 20,// Higher limit for tests
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: true },
    keyGenerator: (req: Request) => {
      return req.ip || 'unknown';
    },
    store: createRedisStore('download:'),
    handler: rateLimitHandler,
    skipSuccessfulRequests: false, // Count all requests, even successful ones
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isTestEnvironment ? 1000 : 10, // Higher limit for tests
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: true},
    keyGenerator: (req: Request) => {
      return req.ip || 'unknown';
    },
    store: createRedisStore('auth:'),
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
