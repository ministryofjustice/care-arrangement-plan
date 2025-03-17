import { createClient } from 'redis';

import config from '../config';
import logger from '../logger';

type ValkeyClient = ReturnType<typeof createClient>;

const url = `${config.valkey.tls_enabled ? 'rediss' : 'redis'}://${config.valkey.host}:${config.valkey.port}`;

const createValkeyClient = (): ValkeyClient => {
  const client = createClient({
    url,
    password: config.valkey.password,
    socket: {
      reconnectStrategy: (attempts: number) => {
        // Exponential back off: 20ms, 40ms, 80ms..., capped to retry every 30 seconds
        const nextDelay = Math.min(2 ** attempts * 20, 30000);
        logger.info(`Retry Valkey connection attempt: ${attempts}, next attempt in: ${nextDelay}ms`);
        return nextDelay;
      },
    },
  });

  client.on('error', (e: Error) => logger.error('Valkey client error', e));

  return client;
};

export default createValkeyClient;
