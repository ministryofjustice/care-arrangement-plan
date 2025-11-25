import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express-serve-static-core';

import config from '../config';
import createRedisStore from '../utils/redisStoreFactory';

const setupRateLimit = () => {
  const router = Router();

  const rateLimitHandler = (request: Request, response: Response) => {
    const { production } = config;
    response.status(429).render('pages/errors/rateLimit', {
      production: config.production,
      title: production ? request.__('errors.rateLimit.title') : 'Too many requests',
    });
  };

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 250, // Limit each IP to 250 requests per 15 minutes
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    validate: { trustProxy: true },
    store: createRedisStore('general:'),
    skip: (req: Request) => {
      return '/health' === req.path || req.path.startsWith('/assets');
    },
    handler: rateLimitHandler,
  });

  // Stricter rate limit for download/PDF generation endpoints (resource-intensive)
  const downloadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // temporary fix until rate limit redis issue is resolved
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: true },
    store: createRedisStore('download:'),
    handler: rateLimitHandler,
    skipSuccessfulRequests: false, // Count all requests, even successful ones
  });

  // Stricter rate limit for authentication endpoint
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10, // Limit login attempts to 10 per 15 minutes per IP
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: true},
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
