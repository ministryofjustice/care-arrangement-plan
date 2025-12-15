import flash from 'connect-flash';
import { RedisStore } from 'connect-redis';
import { Router } from 'express';
import session, { MemoryStore, Store } from 'express-session';

import config from '../config';
import cookieNames from '../constants/cookieNames';
import createCacheClient from '../data/cacheClient';
import logger from '../logging/logger';;

const setUpWebSession = (): Router => {
  let store: Store;
  if (config.cache.enabled) {
    const client = createCacheClient();
    client.connect().catch((err: Error) => logger.error(`Error connecting to cache`, err));
    store = new RedisStore({ client });
  } else {
    store = new MemoryStore();
  }

  const router = Router();
  router.use(
    session({
      store,
      name: cookieNames.SESSION,
      cookie: { secure: config.useHttps, sameSite: 'lax', maxAge: config.session.expiryMinutes * 60 * 1000 },
      secret: config.session.secret,
      resave: true, // Ensures session is saved on every request, preventing race conditions with Redis
      saveUninitialized: false,
      rolling: true,
    }),
  );

  // Update a value in the cookie so that the set-cookie will be sent.
  // Only changes every minute so that it's not sent with every request.
  router.use((request, _, next) => {
    request.session.nowInMinutes = Math.floor(Date.now() / 60e3);
    next();
  });

  router.use(flash());

  return router;
};

export default setUpWebSession;
