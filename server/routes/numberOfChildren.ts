import { Router } from 'express'
import { body, matchedData, validationResult } from 'express-validator'
import i18n from 'i18n'
import paths from '../constants/paths'
import formFields from '../constants/formFields'

const numberOfChildrenRoutes = (router: Router) => {
  router.get(paths.NUMBER_OF_CHILDREN, (request, response) => {
    const formValues = {
      [formFields.NUMBER_OF_CHILDREN]: request.session.numberOfChildren,
      ...request.flash('formValues')?.[0],
    }

    response.render('pages/numberOfChildren', {
      errors: request.flash('errors'),
      formValues,
      title: i18n.__('numberOfChildren.title'),
      backLinkHref: paths.COURT_ORDER_CHECK,
    })
  })

  router.post(
    paths.NUMBER_OF_CHILDREN,
    // TODO C5141-1013: Add error message
    body(formFields.NUMBER_OF_CHILDREN).trim().isInt({ min: 1, max: 6 }),
    (request, response) => {
      const formData = matchedData<{
        [formFields.NUMBER_OF_CHILDREN]: string
      }>(request, { onlyValidData: false })
      const errors = validationResult(request)

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array())
        request.flash('formValues', formData)
        return response.redirect(paths.NUMBER_OF_CHILDREN)
      }

      const numberOfChildren = Number(formData[formFields.NUMBER_OF_CHILDREN])

      if (numberOfChildren !== request.session.numberOfChildren) {
        request.session.numberOfChildren = Number(formData[formFields.NUMBER_OF_CHILDREN])
        request.session.namesOfChildren = undefined
      }

      return response.redirect(paths.ABOUT_THE_CHILDREN)
    },
  )
}

export default numberOfChildrenRoutes
