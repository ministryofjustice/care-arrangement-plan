import { Router } from 'express'
import i18n from 'i18n'
import { body, matchedData, validationResult } from 'express-validator'
import paths from '../constants/paths'
import formFields from '../constants/formFields'
import { yesOrNo } from '../@types/fields'

const safetyCheckRoutes = (router: Router) => {
  router.get(paths.CHILDREN_SAFETY_CHECK, (request, response) => {
    response.render('pages/childrenSafetyCheck', {
      errors: request.flash('errors'),
      title: i18n.__('childrenSafetyCheck.title'),
      backLinkHref: paths.SAFETY_CHECK,
    })
  })

  router.get(paths.CHILDREN_NOT_SAFE, (_request, response) => {
    response.render('pages/childrenNotSafe', {
      title: i18n.__('childrenNotSafe.title'),
    })
  })

  // TODO C5141-1013: Add error message
  router.post(paths.CHILDREN_SAFETY_CHECK, body(formFields.CHILDREN_SAFETY_CHECK).exists(), (request, response) => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
      request.flash('errors', errors.array())
      return response.redirect(paths.CHILDREN_SAFETY_CHECK)
    }

    const { [formFields.CHILDREN_SAFETY_CHECK]: isSafe } = matchedData<{
      [formFields.CHILDREN_SAFETY_CHECK]: yesOrNo
    }>(request)

    return isSafe === 'Yes' ? response.redirect(paths.DO_WHATS_BEST) : response.redirect(paths.CHILDREN_NOT_SAFE)
  })
}

export default safetyCheckRoutes
