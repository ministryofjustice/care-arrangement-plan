import { Router } from 'express'
import i18n from 'i18n'
import { ValidationError } from 'express-validator'
import paths from '../constants/paths'
import formFields from '../constants/formFields'

const aboutTheChildrenRoutes = (router: Router) => {
  router.get(paths.ABOUT_THE_CHILDREN, (request, response) => {
    const { numberOfChildren } = request.session

    if (numberOfChildren == null) {
      return response.redirect(paths.NUMBER_OF_CHILDREN)
    }

    return response.render('pages/aboutTheChildren', {
      errors: request.flash('errors'),
      formValues: request.flash('formValues')?.[0],
      title:
        numberOfChildren === 1 ? i18n.__('aboutTheChildren.singleTitle') : i18n.__('aboutTheChildren.multipleTitle'),
      backLinkHref: paths.NUMBER_OF_CHILDREN,
      numberOfChildren,
    })
  })

  router.post(paths.ABOUT_THE_CHILDREN, (request, response) => {
    const { numberOfChildren } = request.session

    const errors: ValidationError[] = []
    const values: Record<string, string> = {}

    for (let i = 0; i < numberOfChildren; i++) {
      const fieldName = formFields.CHILD_NAME + i
      const value: string = request.body[fieldName]?.trim()
      if (!value) {
        // TODO C5141-1013: Add error message
        errors.push({
          location: 'body',
          msg: 'Invalid value',
          path: fieldName,
          type: 'field',
        })
      } else {
        values[fieldName] = value
      }
    }

    if (errors.length > 0) {
      request.flash('errors', errors)
      request.flash('formValues', values)
      return response.redirect(paths.ABOUT_THE_CHILDREN)
    }

    request.session.namesOfChildren = Object.values(values)

    return response.redirect(paths.ABOUT_THE_ADULTS)
  })
}

export default aboutTheChildrenRoutes
