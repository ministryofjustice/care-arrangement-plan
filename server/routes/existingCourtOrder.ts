import { Router } from 'express'
import i18n from 'i18n'
import paths from '../constants/paths'

const existingCourtOrderRoutes = (router: Router) => {
  router.get(paths.EXISTING_COURT_ORDER, (_request, response) => {
    response.render('pages/existingCourtOrder', {
      title: i18n.__('existingCourtOrder.title'),
      backLinkHref: paths.COURT_ORDER_CHECK,
    })
  })
}

export default existingCourtOrderRoutes
