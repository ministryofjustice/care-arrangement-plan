import { Router } from 'express'
import passwordRoutes from './password'
import cookiesRoutes from './cookies'

const routes = (): Router => {
  const router = Router()
  passwordRoutes(router)
  cookiesRoutes(router)

  return router
}

export default routes
