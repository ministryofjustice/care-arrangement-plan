import { Store } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';

import config from '../config';
import createCacheClient from '../data/cacheClient';

type CacheClient = ReturnType<typeof createCacheClient>;
let redisClient: CacheClient | undefined;

if (config.cache.enabled) {
    redisClient = createCacheClient();
    redisClient.connect().catch((err: Error) => console.error(`Error connecting to cache`, err)); 
}

/**
 * Creates a new, unique RedisStore instance with a specific prefix.
 * @param prefix The unique prefix for the Redis keys (e.g., 'general:', 'download:')
 * @returns A new RedisStore instance or undefined if cache is disabled.
 */
const createRedisStore = (prefix: string): Store | undefined => {
    if (config.cache.enabled && redisClient) {
        return new RedisStore({ 
            sendCommand: (...args: string[]) => redisClient!.sendCommand(args),
            prefix: prefix, // Ensures unique keys for this specific limiter
        });
    }
    // Rate-limit will default to using MemoryStore if undefined is returned here.
    return undefined; 
};

export default createRedisStore