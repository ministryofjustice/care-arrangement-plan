import { Router } from 'express'
import paths from '../constants/paths'
import courtOrderCheckRoutes from './courtOrderCheck'
import existingCourtOrderRoutes from './existingCourtOrder'
import numberOfChildrenRoutes from './numberOfChildren'
import aboutTheChildrenRoutes from './aboutTheChildren'
import aboutTheAdultsRoutes from './aboutTheAdults'

const routes = (): Router => {
  const router = Router()
  router.get(paths.START, (_request, response) => {
    response.render('pages/index')
  })

  courtOrderCheckRoutes(router)
  existingCourtOrderRoutes(router)
  numberOfChildrenRoutes(router)
  aboutTheChildrenRoutes(router)
  aboutTheAdultsRoutes(router)

  return router
}

export default routes
