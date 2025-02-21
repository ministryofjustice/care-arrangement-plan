import { Router } from 'express'
import paths from '../constants/paths'
import courtOrderCheckRoutes from './courtOrderCheck'
import existingCourtOrderRoutes from './existingCourtOrder'

const routes = (): Router => {
  const router = Router()
  router.get(paths.START, (_request, response) => {
    response.render('pages/index')
  })

  courtOrderCheckRoutes(router)
  existingCourtOrderRoutes(router)

  return router
}

export default routes
