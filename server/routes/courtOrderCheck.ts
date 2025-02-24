import { Router } from 'express'
import { body, matchedData, validationResult } from 'express-validator'
import i18n from 'i18n'
import paths from '../constants/paths'
import formFields from '../constants/formFields'

const courtOrderCheckRoutes = (router: Router) => {
  router.get(paths.COURT_ORDER_CHECK, (request, response) => {
    response.render('pages/courtOrderCheck', {
      errors: request.flash('errors'),
      title: i18n.__('courtOrderCheck.title'),
      // TODO C5141-758 add correct back link
      backLinkHref: paths.START,
    })
  })

  router.post(paths.COURT_ORDER_CHECK, body(formFields.COURT_ORDER_CHECK).exists(), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      request.flash('errors', errors.array())
      return response.redirect(paths.COURT_ORDER_CHECK)
    }

    const { [formFields.COURT_ORDER_CHECK]: existingCourtOrder } = matchedData<{
      [formFields.COURT_ORDER_CHECK]: 'Yes' | 'No'
    }>(request)

    // TODO C5141-759 add correct link
    return existingCourtOrder === 'Yes' ? response.redirect(paths.EXISTING_COURT_ORDER) : response.redirect(paths.START)
  })
}

export default courtOrderCheckRoutes
