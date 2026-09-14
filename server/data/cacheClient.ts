import { createClient } from 'redis';

import config from '../config';
import logger from '../logging/logger';

type CacheClient = ReturnType<typeof createClient>;

const reconnectStrategy = (attempts: number) => {
  // Exponential back off: 20ms, 40ms, 80ms..., capped to retry every 30 seconds
  const nextDelay = Math.min(2 ** attempts * 20, 30000);
  logger.info(`Retry cache connection attempt: ${attempts}, next attempt in: ${nextDelay}ms`);
  return nextDelay;
};

const createCacheClient = (): CacheClient => {
  const client = createClient({
    password: config.cache.password,
    socket: config.cache.tls_enabled
      ? {
          host: config.cache.host,
          tls: true,
          reconnectStrategy,
        }
      : {
          host: config.cache.host,
          reconnectStrategy,
        },
  });

  client.on('error', (e: Error) => logger.error('Cache client error', e));

  return client;
};

export default createCacheClient;
