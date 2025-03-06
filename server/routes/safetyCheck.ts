import { Router } from 'express'
import i18n from 'i18n'
import { body, matchedData, validationResult } from 'express-validator'
import paths from '../constants/paths'
import formFields from '../constants/formFields'
import { yesOrNo } from '../@types/fields'

const safetyCheckRoutes = (router: Router) => {
  router.get(paths.SAFETY_CHECK, (request, response) => {
    response.render('pages/safetyCheck', {
      errors: request.flash('errors'),
      title: i18n.__('safetyCheck.title'),
    })
  })

  router.get(paths.NOT_SAFE, (_request, response) => {
    response.render('pages/notSafe', {
      title: i18n.__('notSafe.title'),
    })
  })

  // TODO C5141-1013: Add error message
  router.post(paths.SAFETY_CHECK, body(formFields.SAFETY_CHECK).exists(), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      request.flash('errors', errors.array())
      return response.redirect(paths.SAFETY_CHECK)
    }

    const { [formFields.SAFETY_CHECK]: isSafe } = matchedData<{
      [formFields.SAFETY_CHECK]: yesOrNo
    }>(request)

    return isSafe === 'Yes' ? response.redirect(paths.CHILDREN_SAFETY_CHECK) : response.redirect(paths.NOT_SAFE)
  })
}

export default safetyCheckRoutes
