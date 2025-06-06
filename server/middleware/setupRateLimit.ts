import { rateLimit } from 'express-rate-limit'
import type { Request, Response } from 'express-serve-static-core';
import { RedisStore } from 'rate-limit-redis'

import config from '../config';
import createCacheClient from '../data/cacheClient';
import logger from '../logger';

const setupRateLimit = () => {
  let store: RedisStore;
  if (config.cache.enabled) {
    const client = createCacheClient();
    client.connect().catch((err: Error) => logger.error(`Error connecting to cache`, err));
    store = new RedisStore({ sendCommand: (...args: string[]) => client.sendCommand(args) });
  }

  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    validate: { trustProxy: false }, // Don't warn about trusting the proxy
    store,
    skip: (req: Request) => {
      return '/health' === req.path || req.path.startsWith('/assets');
    },
    handler: (request: Request, response: Response) => {
      const { production } = config;
      response.status(429).render('pages/errors/rateLimit', {
        production: config.production,
        title: production ? request.__('errors.rateLimit.title') : 'Too many requests',
      })
    }
  });
}

export default setupRateLimit;
