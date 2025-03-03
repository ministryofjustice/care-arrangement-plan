import { Router } from 'express'
import passwordRoutes from './password'

const routes = (): Router => {
  const router = Router()
  passwordRoutes(router)

  return router
}

export default routes
