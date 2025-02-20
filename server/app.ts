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

import routes from './routes'
import i18nSetup from './utils/i18nSetup'
import config from './config'

const createApp = (): express.Application => {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  i18nSetup(app)
  nunjucksSetup(app)
  app.use(setUpHealthCheck())
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  app.use(setUpCsrf())

  app.use(routes())

  app.use((_request, _response, next) => next(new NotFound()))
  app.use(errorHandler(config.production))

  return app
}

export default createApp
