import { Router } from 'express'
import paths from '../constants/paths'
import courtOrderCheckRoutes from './courtOrderCheck'
import existingCourtOrderRoutes from './existingCourtOrder'
import numberOfChildrenRoutes from './numberOfChildren'

const routes = (): Router => {
  const router = Router()
  router.get(paths.START, (_request, response) => {
    response.render('pages/index')
  })

  courtOrderCheckRoutes(router)
  existingCourtOrderRoutes(router)
  numberOfChildrenRoutes(router)

  return router
}

export default routes
