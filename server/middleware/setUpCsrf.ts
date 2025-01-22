import { Router } from 'express'
import { csrfSync } from 'csrf-sync'

const testMode = process.env.NODE_ENV === 'test'

const setUpCsrf = (): Router => {
  const router = Router({ mergeParams: true })

  // CSRF protection
  if (!testMode) {
    const { csrfSynchronisedProtection } = csrfSync()

    router.use(csrfSynchronisedProtection)
  }

  router.use((request, response, next) => {
    if (typeof request.csrfToken === 'function') {
      response.locals.csrfToken = request.csrfToken()
    }
    next()
  })

  return router
}

export default setUpCsrf
