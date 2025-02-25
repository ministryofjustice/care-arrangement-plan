import { Router } from 'express'
import i18n from 'i18n'
import { body, matchedData, validationResult } from 'express-validator'
import paths from '../constants/paths'
import formFields from '../constants/formFields'

const aboutTheAdultsRoutes = (router: Router) => {
  router.get(paths.ABOUT_THE_ADULTS, (request, response) => {
    response.render('pages/aboutTheAdults', {
      errors: request.flash('errors'),
      formValues: request.flash('formValues')?.[0],
      title: i18n.__('aboutTheAdults.title'),
      backLinkHref: paths.ABOUT_THE_CHILDREN,
    })
  })

  router.post(
    paths.ABOUT_THE_ADULTS,
    body(formFields.INITIAL_ADULT_NAME).trim().notEmpty(),
    body(formFields.SECONDARY_ADULT_NAME).trim().notEmpty(),
    (request, response) => {
      const formData = matchedData<{
        [formFields.INITIAL_ADULT_NAME]: string
        [formFields.SECONDARY_ADULT_NAME]: string
      }>(request, { onlyValidData: false })
      const errors = validationResult(request)

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array())
        request.flash('formValues', formData)
        return response.redirect(paths.ABOUT_THE_ADULTS)
      }

      request.session.initialAdultName = formData[formFields.INITIAL_ADULT_NAME]
      request.session.secondaryAdultName = formData[formFields.SECONDARY_ADULT_NAME]

      return response.redirect(paths.TASK_LIST)
    },
  )
}

export default aboutTheAdultsRoutes
