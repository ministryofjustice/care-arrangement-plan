import { Router } from 'express'
import i18n from 'i18n'
import { body, validationResult } from 'express-validator'
import paths from '../constants/paths'
import formFields from '../constants/formFields'

const doWhatsBestRoutes = (router: Router) => {
  router.get(paths.DO_WHATS_BEST, (request, response) => {
    response.render('pages/doWhatsBest', {
      errors: request.flash('errors'),
      title: i18n.__('doWhatsBest.title'),
      backLinkHref: paths.CHILDREN_SAFETY_CHECK,
    })
  })

  // TODO C5141-1013: Add error message
  router.post(paths.DO_WHATS_BEST, body(formFields.DO_WHATS_BEST).exists(), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      request.flash('errors', errors.array())
      return response.redirect(paths.DO_WHATS_BEST)
    }

    return response.redirect(paths.COURT_ORDER_CHECK)
  })
}

export default doWhatsBestRoutes
