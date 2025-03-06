import { Router } from 'express'
import { body, matchedData, validationResult } from 'express-validator'
import i18n from 'i18n'
import paths from '../../constants/paths'
import formFields from '../../constants/formFields'

const whichScheduleRoutes = (router: Router) => {
  router.get(paths.LIVING_VISITING_WHICH_SCHEDULE, (request, response) => {
    response.render('pages/livingAndVisiting/whichSchedule', {
      errors: request.flash('errors'),
      title: i18n.__('livingAndVisiting.whichSchedule.title'),
      initialSchedule: request.session.livingAndVisiting.whichSchedule?.answer,
      backLinkHref: paths.LIVING_VISITING_MOSTLY_LIVE,
    })
  })

  router.post(
    paths.LIVING_VISITING_WHICH_SCHEDULE,
    // TODO C5141-1013: Add error messages
    body(formFields.WHICH_SCHEDULE).trim().notEmpty(),
    (request, response) => {
      const errors = validationResult(request)

      if (!errors.isEmpty()) {
        request.flash('errors', errors.array())
        return response.redirect(paths.LIVING_VISITING_WHICH_SCHEDULE)
      }

      const { [formFields.WHICH_SCHEDULE]: whichSchedule } = matchedData<{
        [formFields.WHICH_SCHEDULE]: string
      }>(request, { onlyValidData: false })

      request.session.livingAndVisiting = {
        ...request.session.livingAndVisiting,
        whichSchedule: {
          noDecisionRequired: false,
          answer: whichSchedule,
        },
      }

      return response.redirect(paths.TASK_LIST)
    },
  )

  router.post(paths.LIVING_VISITING_WHICH_SCHEDULE_SKIP, (request, response) => {
    request.session.livingAndVisiting = {
      ...request.session.livingAndVisiting,
      whichSchedule: {
        noDecisionRequired: true,
      },
    }

    return response.redirect(paths.TASK_LIST)
  })
}

export default whichScheduleRoutes
