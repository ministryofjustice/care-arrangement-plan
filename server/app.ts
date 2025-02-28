import express from 'express'

import { NotFound } from 'http-errors'

import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'

import setUpCsrf from './middleware/setUpCsrf'
import setUpHealthCheck from './middleware/setUpHealthCheck'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpWebSession from './middleware/setUpWebSession'
import setUpi18n from './middleware/setUpi18n'

import routes from './routes'

const createApp = (): express.Application => {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(setUpi18n())
  nunjucksSetup(app)
  app.use(setUpHealthCheck())
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  app.use(setUpCsrf())

  app.use(routes())

  app.use((_request, _response, next) => next(new NotFound()))
  app.use(errorHandler())

  return app
}

export default createApp
