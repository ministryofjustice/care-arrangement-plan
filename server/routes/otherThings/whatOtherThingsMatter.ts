import { Router } from 'express'
import i18n from 'i18n'
import { body, matchedData, validationResult } from 'express-validator'
import paths from '../../constants/paths'
import formFields from '../../constants/formFields'

const whatOtherThingsMatterRoutes = (router: Router) => {
  router.get(paths.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER, (request, response) => {
    response.render('pages/otherThings/whatOtherThingsMatter', {
      errors: request.flash('errors'),
      title: i18n.__('otherThings.whatOtherThingsMatter.title'),
      initialWhatOtherThingsMatter: request.session.otherThings?.whatOtherThingsMatter?.answer,
      backLinkHref: paths.TASK_LIST,
    })
  })

  router.post(
    paths.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER,
    // TODO C5141-1013: Add error messages
    body(formFields.WHAT_OTHER_THINGS_MATTER).trim().notEmpty(),
    (request, response) => {
      const errors = validationResult(request)

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array())
        return response.redirect(paths.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER)
      }

      const { [formFields.WHAT_OTHER_THINGS_MATTER]: whatOtherThingsMatter } = matchedData<{
        [formFields.WHAT_OTHER_THINGS_MATTER]: string
      }>(request, { onlyValidData: false })

      request.session.otherThings = {
        ...request.session.otherThings,
        whatOtherThingsMatter: {
          noDecisionRequired: false,
          answer: whatOtherThingsMatter,
        },
      }

      return response.redirect(paths.TASK_LIST)
    },
  )

  router.post(paths.OTHER_THINGS_WHAT_OTHER_THINGS_MATTER_NOT_REQUIRED, (request, response) => {
    request.session.otherThings = {
      ...request.session.otherThings,
      whatOtherThingsMatter: {
        noDecisionRequired: true,
      },
    }

    return response.redirect(paths.TASK_LIST)
  })
}

export default whatOtherThingsMatterRoutes
