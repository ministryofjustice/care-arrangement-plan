import express, { Express } from 'express'
import { NotFound } from 'http-errors'

import routes from '../routes'
import nunjucksSetup from '../utils/nunjucksSetup'
import setUpWebSession from '../middleware/setUpWebSession'

const testAppSetup = (): Express => {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app)
  app.use(setUpWebSession())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(routes())
  app.use((request, response, next) => next(new NotFound()))

  return app
}

export default testAppSetup
