import express, { Express } from 'express'
import { NotFound } from 'http-errors'

import routes from '../routes'
import nunjucksSetup from '../utils/nunjucksSetup'
import setUpWebSession from '../middleware/setUpWebSession'
import i18nSetup from '../utils/i18nSetup'
import setUpWebRequestParsing from '../middleware/setupRequestParsing'

const testAppSetup = (): Express => {
  const app = express()

  i18nSetup(app)
  nunjucksSetup(app)
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(routes())
  app.use((_request, _response, next) => next(new NotFound()))

  return app
}

export default testAppSetup
