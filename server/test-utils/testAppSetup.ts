import express, { Express, Router } from 'express'
import { NotFound } from 'http-errors'
import routes from '../routes'
import nunjucksSetup from '../utils/nunjucksSetup'
import i18nSetup from '../utils/i18nSetup'
import setUpWebRequestParsing from '../middleware/setupRequestParsing'
import errorHandler from '../errorHandler'
import { flashMock, sessionMock } from './testMocks'
import setupAuthentication from '../middleware/setupAuthentication'
import unauthenticatedRoutes from '../routes/unauthenticatedRoutes'

const testAppSetup = (): Express => {
  const app = express()

  i18nSetup(app)
  nunjucksSetup(app)
  app.use((request, _response, next) => {
    request.session = sessionMock
    request.flash = flashMock
    next()
  })

  app.use(setUpWebRequestParsing())
  app.use(unauthenticatedRoutes())
  app.use(setupAuthentication())
  app.use(routes())

  const testRouter = Router()
  testRouter.get('/create-error', (_request, _response, next) => {
    next(new Error('An error happened!'))
  })
  app.use(testRouter)

  app.use((_request, _response, next) => next(new NotFound()))
  app.use(errorHandler())

  return app
}

export default testAppSetup
