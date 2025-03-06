import { Router } from 'express'
import i18n from 'i18n'
import { body, matchedData, validationResult } from 'express-validator'
import paths from '../../constants/paths'
import formFields from '../../constants/formFields'
import { whichDaysField } from '../../@types/fields'
import { convertWhichDaysFieldToSessionValue, convertWhichDaysSessionValueToField } from '../../utils/formValueUtils'

const whichDaysDaytimeVisitsRoutes = (router: Router) => {
  router.get(paths.LIVING_VISITING_WHICH_DAYS_DAYTIME_VISITS, (request, response) => {
    const { daytimeVisits } = request.session.livingAndVisiting

    const [previousDays, previousDescribeArrangement] = convertWhichDaysSessionValueToField(daytimeVisits.whichDays)

    const formValues = {
      [formFields.WHICH_DAYS_DAYTIME_VISITS]: previousDays,
      [formFields.WHICH_DAYS_DAYTIME_VISITS_DESCRIBE_ARRANGEMENT]: previousDescribeArrangement,
      ...request.flash('formValues')?.[0],
    }

    response.render('pages/livingAndVisiting/whichDaysDaytimeVisits', {
      errors: request.flash('errors'),
      formValues,
      title: i18n.__('livingAndVisiting.whichDaysDaytimeVisits.title'),
      backLinkHref: paths.LIVING_VISITING_WILL_DAYTIME_VISITS_HAPPEN,
    })
  })

  router.post(
    paths.LIVING_VISITING_WHICH_DAYS_DAYTIME_VISITS,
    // TODO C5141-1013: Add error messages
    body(formFields.WHICH_DAYS_DAYTIME_VISITS_DESCRIBE_ARRANGEMENT)
      .if(body(formFields.WHICH_DAYS_DAYTIME_VISITS).equals('other'))
      .trim()
      .notEmpty(),
    body(formFields.WHICH_DAYS_DAYTIME_VISITS).exists().toArray(),
    body(formFields.WHICH_DAYS_DAYTIME_VISITS).custom(
      // This is prevented by JS in the page, but possible for people with JS disabled to submit
      (whichDays: whichDaysField) => !(whichDays.length > 1 && whichDays.includes('other')),
    ),
    (request, response) => {
      const formData = matchedData<{
        [formFields.WHICH_DAYS_DAYTIME_VISITS_DESCRIBE_ARRANGEMENT]: string
        [formFields.WHICH_DAYS_DAYTIME_VISITS]: whichDaysField
      }>(request, { onlyValidData: false })

      const errors = validationResult(request)

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array())
        request.flash('formValues', formData)
        return response.redirect(paths.LIVING_VISITING_WHICH_DAYS_DAYTIME_VISITS)
      }

      const {
        [formFields.WHICH_DAYS_DAYTIME_VISITS]: whichDays,
        [formFields.WHICH_DAYS_DAYTIME_VISITS_DESCRIBE_ARRANGEMENT]: describeArrangement,
      } = formData

      request.session.livingAndVisiting = {
        ...request.session.livingAndVisiting,
        daytimeVisits: {
          ...request.session.livingAndVisiting.daytimeVisits,
          whichDays: convertWhichDaysFieldToSessionValue(whichDays, describeArrangement),
        },
      }

      return response.redirect(paths.TASK_LIST)
    },
  )

  router.post(paths.LIVING_VISITING_WHICH_DAYS_DAYTIME_VISITS_NOT_REQUIRED, (request, response) => {
    request.session.livingAndVisiting = {
      ...request.session.livingAndVisiting,
      daytimeVisits: {
        willHappen: true,
        whichDays: {
          noDecisionRequired: true,
        },
      },
    }

    return response.redirect(paths.TASK_LIST)
  })
}

export default whichDaysDaytimeVisitsRoutes
