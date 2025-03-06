import { Router } from 'express'
import i18n from 'i18n'
import { body, matchedData, validationResult } from 'express-validator'
import paths from '../../constants/paths'
import formFields from '../../constants/formFields'
import { whereMostlyLive } from '../../@types/fields'

const mostlyLiveRoutes = (router: Router) => {
  router.get(paths.LIVING_VISITING_MOSTLY_LIVE, (request, response) => {
    const formValues = {
      [formFields.MOSTLY_LIVE_DESCRIBE_ARRANGEMENT]: request.session.livingAndVisiting?.mostlyLive?.describeArrangement,
      [formFields.MOSTLY_LIVE_WHERE]: request.session.livingAndVisiting?.mostlyLive?.where,
      ...request.flash('formValues')?.[0],
    }

    response.render('pages/livingAndVisiting/mostlyLive', {
      errors: request.flash('errors'),
      title: i18n.__('livingAndVisiting.mostlyLive.title', {
        childName: request.sessionHelpers.collectiveChildrenName(),
      }),
      values: request.session,
      formValues,
      backLinkHref: paths.TASK_LIST,
    })
  })

  router.post(
    paths.LIVING_VISITING_MOSTLY_LIVE,
    // TODO C5141-1013: Add error messages
    body(formFields.MOSTLY_LIVE_WHERE).exists(),
    body(formFields.MOSTLY_LIVE_DESCRIBE_ARRANGEMENT)
      .if(body(formFields.MOSTLY_LIVE_WHERE).equals('other'))
      .trim()
      .notEmpty(),
    (request, response) => {
      const formData = matchedData<{
        [formFields.MOSTLY_LIVE_DESCRIBE_ARRANGEMENT]: string
        [formFields.MOSTLY_LIVE_WHERE]: whereMostlyLive
      }>(request, { onlyValidData: false })
      const errors = validationResult(request)

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array())
        request.flash('formValues', formData)
        return response.redirect(paths.LIVING_VISITING_MOSTLY_LIVE)
      }

      const {
        [formFields.MOSTLY_LIVE_WHERE]: where,
        [formFields.MOSTLY_LIVE_DESCRIBE_ARRANGEMENT]: describeArrangement,
      } = formData

      if (where !== request.session.livingAndVisiting?.mostlyLive?.where) {
        request.session.livingAndVisiting = {
          mostlyLive: { where, describeArrangement: where === 'other' ? describeArrangement : undefined },
        }
      }

      switch (where) {
        case 'other':
          return response.redirect(paths.TASK_LIST)
        case 'split':
          return response.redirect(paths.LIVING_VISITING_WHICH_SCHEDULE)
        default:
          return response.redirect(paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN)
      }
    },
  )
}

export default mostlyLiveRoutes
