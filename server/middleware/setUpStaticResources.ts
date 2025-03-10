import path from 'path'
import compression from 'compression'
import express, { Router } from 'express'
import noCache from 'nocache'

import config from '../config'

const setUpStaticResources = (): Router => {
  const router = express.Router()

  router.use(compression())

  //  Static Resources Configuration
  const staticResourcesConfig = { maxAge: config.staticResourceCacheDuration, redirect: false }

  Array.of('/dist/assets', '/node_modules/govuk-frontend/dist/govuk/assets').forEach(dir => {
    router.use('/assets', express.static(path.join(process.cwd(), dir), staticResourcesConfig))
  })

  // Don't cache dynamic resources
  router.use(noCache())

  return router
}

export default setUpStaticResources
