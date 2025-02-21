import { Router } from 'express'
import paths from '../constants/paths'

const existingCourtOrderRoutes = (router: Router) => {
  router.get(paths.EXISTING_COURT_ORDER, (_request, response) => {
    response.render('pages/existingCourtOrder', {
      title: 'You can still use this service',
      backLinkHref: paths.COURT_ORDER_CHECK,
    })
  })
}

export default existingCourtOrderRoutes
