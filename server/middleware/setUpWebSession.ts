import session, { MemoryStore, Store } from 'express-session'
import { RedisStore } from 'connect-redis'
import express, { Router } from 'express'
import flash from 'connect-flash'
import createValkeyClient from '../data/valkeyClient'
import config from '../config'
import logger from '../../logger'

const setUpWebSession = (): Router => {
  let store: Store
  if (config.valkey.enabled) {
    const client = createValkeyClient()
    client.connect().catch((err: Error) => logger.error(`Error connecting to Valkey`, err))
    store = new RedisStore({ client })
  } else {
    store = new MemoryStore()
  }

  const router = express.Router()
  router.use(
    session({
      store,
      name: 'pfl-care-arrangement-plan.session',
      cookie: { secure: config.useHttps, sameSite: 'lax', maxAge: config.session.expiryMinutes * 60 * 1000 },
      secret: config.session.secret,
      resave: false, // connect-redis implements touch so shouldn't need this
      saveUninitialized: false,
      rolling: true,
    }),
  )

  // Update a value in the cookie so that the set-cookie will be sent.
  // Only changes every minute so that it's not sent with every request.
  router.use((request, _, next) => {
    request.session.nowInMinutes = Math.floor(Date.now() / 60e3)
    next()
  })

  router.use(flash())

  return router
}

export default setUpWebSession
