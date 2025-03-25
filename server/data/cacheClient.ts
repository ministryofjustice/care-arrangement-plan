import { createClient } from 'redis';

import config from '../config';
import logger from '../logger';

type CacheClient = ReturnType<typeof createClient>;

const url = `${config.cache.tls_enabled ? 'rediss' : 'redis'}://${config.cache.host}`;

const createCacheClient = (): CacheClient => {
  const client = createClient({
    url,
    password: config.cache.password,
    socket: {
      reconnectStrategy: (attempts: number) => {
        // Exponential back off: 20ms, 40ms, 80ms..., capped to retry every 30 seconds
        const nextDelay = Math.min(2 ** attempts * 20, 30000);
        logger.info(`Retry cache connection attempt: ${attempts}, next attempt in: ${nextDelay}ms`);
        return nextDelay;
      },
    },
  });

  client.on('error', (e: Error) => logger.error('Cache client error', e));

  return client;
};

export default createCacheClient;
