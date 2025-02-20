import express, { Express, Router } from 'express'
import { NotFound } from 'http-errors'

import routes from '../routes'
import nunjucksSetup from '../utils/nunjucksSetup'
import setUpWebSession from '../middleware/setUpWebSession'
import i18nSetup from '../utils/i18nSetup'
import setUpWebRequestParsing from '../middleware/setupRequestParsing'
import errorHandler from '../errorHandler'
import config from '../config'

const testAppSetup = (): Express => {
  const app = express()

  i18nSetup(app)
  nunjucksSetup(app)
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(routes())

  const testRouter = Router()
  testRouter.get('/create-error', (_request, _response, next) => {
    next(new Error('An error happened!'))
  })
  app.use(testRouter)

  app.use((_request, _response, next) => next(new NotFound()))
  app.use(errorHandler(config.production))

  return app
}

export default testAppSetup
