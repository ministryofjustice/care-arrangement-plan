import { Router } from 'express'
import i18n from 'i18n'
import { body, matchedData, validationResult } from 'express-validator'
import paths from '../../constants/paths'
import formFields from '../../constants/formFields'
import { whichDays, dayValues } from '../../@types/fields'
import { Days } from '../../@types/session'

const daysOfWeek: dayValues[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const whichDaysOvernightRoutes = (router: Router) => {
  router.get(paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT, (request, response) => {
    const { overnightVisits } = request.session.livingAndVisiting

    const formValues = {
      [formFields.WHICH_DAYS_OVERNIGHT_DESCRIBE_ARRANGEMENT]: overnightVisits.whichDays?.describeArrangement,
      [formFields.WHICH_DAYS_OVERNIGHT]: overnightVisits.whichDays?.describeArrangement
        ? 'other'
        : daysOfWeek.filter(day => overnightVisits.whichDays?.days?.[day]),
      ...request.flash('formValues')?.[0],
    }

    response.render('pages/livingAndVisiting/whichDaysOvernight', {
      errors: request.flash('errors'),
      formValues,
      title: i18n.__('livingAndVisiting.whichDaysOvernight.title'),
      backLinkHref: paths.LIVING_VISITING_MOSTLY_LIVE,
    })
  })

  router.post(
    paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT,
    // TODO C5141-1013: Add error messages
    body(formFields.WHICH_DAYS_OVERNIGHT_DESCRIBE_ARRANGEMENT)
      .if(body(formFields.WHICH_DAYS_OVERNIGHT).equals('other'))
      .trim()
      .notEmpty(),
    body(formFields.WHICH_DAYS_OVERNIGHT).exists().toArray(),
    body(formFields.WHICH_DAYS_OVERNIGHT).custom(
      // This is prevented by JS in the page, but possible for people with JS disabled to submit
      (whichDaysOvernight: whichDays) => !(whichDaysOvernight.length > 1 && whichDaysOvernight.includes('other')),
    ),
    (request, response) => {
      const formData = matchedData<{
        [formFields.WHICH_DAYS_OVERNIGHT_DESCRIBE_ARRANGEMENT]: string
        [formFields.WHICH_DAYS_OVERNIGHT]: whichDays
      }>(request, { onlyValidData: false })

      const errors = validationResult(request)

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array())
        request.flash('formValues', formData)
        return response.redirect(paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT)
      }

      const {
        [formFields.WHICH_DAYS_OVERNIGHT]: whichDaysOvernight,
        [formFields.WHICH_DAYS_OVERNIGHT_DESCRIBE_ARRANGEMENT]: describeArrangement,
      } = formData

      request.session.livingAndVisiting = {
        ...request.session.livingAndVisiting,
        overnightVisits: {
          ...request.session.livingAndVisiting.overnightVisits,
          whichDays:
            whichDaysOvernight[0] === 'other'
              ? { describeArrangement }
              : {
                  days: daysOfWeek.reduce((acc, day) => {
                    acc[day] = whichDaysOvernight.includes(day)
                    return acc
                  }, {} as Days),
                },
        },
      }

      return response.redirect(paths.LIVING_VISITING_WILL_DAYTIME_VISITS_HAPPEN)
    },
  )

  router.post(paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT_SKIP, (request, response) => {
    request.session.livingAndVisiting = {
      ...request.session.livingAndVisiting,
      overnightVisits: {
        willHappen: true,
        whichDays: {
          noDecisionRequired: true,
        },
      },
    }

    return response.redirect(paths.LIVING_VISITING_WILL_DAYTIME_VISITS_HAPPEN)
  })
}

export default whichDaysOvernightRoutes
