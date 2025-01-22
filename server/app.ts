import express from 'express'

import createError from 'http-errors'

import nunjucksSetup from './utils/nunjucksSetup'

import setUpCsrf from './middleware/setUpCsrf'
import setUpHealthCheck from './middleware/setUpHealthCheck'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpWebSession from './middleware/setUpWebSession'

import routes from './routes'

const createApp = (): express.Application => {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(setUpHealthCheck())
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app)
  app.use(setUpCsrf())

  app.use(routes())

  app.use((request, response, next) => next(createError(404, 'Not found')))

  return app
}

export default createApp
