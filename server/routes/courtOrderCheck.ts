import { Router } from 'express'
import { body, matchedData, validationResult } from 'express-validator'
import paths from '../constants/paths'
import formFields from '../constants/formFields'

const courtOrderCheckRoutes = (router: Router) => {
  router.get(paths.COURT_ORDER_CHECK, (request, response) => {
    response.render('pages/courtOrderCheck', {
      errors: request.flash('errors'),
      title: 'Do you already have a court order in place about your child arrangements?',
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

    return existingCourtOrder === 'Yes' ? response.redirect(paths.EXISTING_COURT_ORDER) : response.redirect(paths.START)
  })
}

export default courtOrderCheckRoutes
