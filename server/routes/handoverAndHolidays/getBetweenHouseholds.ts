import { Router } from 'express'
import i18n from 'i18n'
import { body, matchedData, validationResult } from 'express-validator'
import paths from '../../constants/paths'
import formFields from '../../constants/formFields'
import { getBetweenHouseholdsField } from '../../@types/fields'

const getBetweenHouseholdsRoutes = (router: Router) => {
  router.get(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS, (request, response) => {
    const formValues = {
      [formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT]:
        request.session.handoverAndHolidays?.getBetweenHouseholds?.describeArrangement,
      [formFields.GET_BETWEEN_HOUSEHOLDS]: request.session.handoverAndHolidays?.getBetweenHouseholds?.how,
      ...request.flash('formValues')?.[0],
    }

    response.render('pages/handoverAndHolidays/getBetweenHouseholds', {
      errors: request.flash('errors'),
      title: i18n.__('handoverAndHolidays.getBetweenHouseholds.title'),
      values: request.session,
      formValues,
      backLinkHref: paths.TASK_LIST,
    })
  })

  router.post(
    paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS,
    // TODO C5141-1013: Add error messages
    body(formFields.GET_BETWEEN_HOUSEHOLDS).exists(),
    body(formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT)
      .if(body(formFields.GET_BETWEEN_HOUSEHOLDS).equals('other'))
      .trim()
      .notEmpty(),
    (request, response) => {
      const formData = matchedData<{
        [formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT]: string
        [formFields.GET_BETWEEN_HOUSEHOLDS]: getBetweenHouseholdsField
      }>(request, { onlyValidData: false })
      const errors = validationResult(request)

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array())
        request.flash('formValues', formData)
        return response.redirect(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS)
      }

      const {
        [formFields.GET_BETWEEN_HOUSEHOLDS]: howGetBetweenHouseholds,
        [formFields.GET_BETWEEN_HOUSEHOLDS_DESCRIBE_ARRANGEMENT]: describeArrangement,
      } = formData

      request.session.handoverAndHolidays = {
        ...request.session.handoverAndHolidays,
        getBetweenHouseholds: {
          noDecisionRequired: false,
          how: howGetBetweenHouseholds,
          describeArrangement: howGetBetweenHouseholds === 'other' ? describeArrangement : undefined,
        },
      }

      return response.redirect(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER)
    },
  )

  router.post(paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS_NOT_REQUIRED, (request, response) => {
    request.session.handoverAndHolidays = {
      ...request.session.handoverAndHolidays,
      getBetweenHouseholds: {
        noDecisionRequired: true,
      },
    }

    return response.redirect(paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER)
  })
}

export default getBetweenHouseholdsRoutes
