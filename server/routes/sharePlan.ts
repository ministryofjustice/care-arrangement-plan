import { Router } from 'express'
import i18n from 'i18n'
import paths from '../constants/paths'
import { formattedChildrenNames, parentNotMostlyLivedWith } from '../utils/sessionHelpers'
import {
  whatWillHappen,
  mostlyLive,
  whichDaysDaytimeVisits,
  whichDaysOvernight,
  whichSchedule,
  willDaytimeVisitsHappen,
  willOvernightsHappen,
} from '../utils/formattedAnswersForPdf'

const sharePlanRoutes = (router: Router) => {
  router.get(paths.SHARE_PLAN, (request, response) => {
    const childrenNames = formattedChildrenNames(request.session)

    response.render('pages/sharePlan', {
      title: `${i18n.__('sharePlan.title', { names: childrenNames })}`,
      values: {
        ...request.session,
        childrenNames,
        parentNotMostlyLivedWith: parentNotMostlyLivedWith(request.session),
        mostlyLiveAnswer: mostlyLive(request.session),
        whichScheduleAnswer: whichSchedule(request.session),
        willOvernightsHappenAnswer: willOvernightsHappen(request.session),
        whichDaysOvernightAnswer: whichDaysOvernight(request.session),
        willDaytimeVisitsHappenAnswer: willDaytimeVisitsHappen(request.session),
        whichDaysDaytimeVisitsAnswer: whichDaysDaytimeVisits(request.session),
        whatWillHappenAnswer: whatWillHappen(request.session),
      },
    })
  })
}

export default sharePlanRoutes
