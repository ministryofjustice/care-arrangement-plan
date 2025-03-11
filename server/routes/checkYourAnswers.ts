import { Router } from 'express'
import i18n from 'i18n'
import paths from '../constants/paths'
import { formatListOfStrings } from '../utils/formValueUtils'
import { formattedChildrenNames, parentNotMostlyLivedWith } from '../utils/sessionHelpers'
import {
  mostlyLive,
  whatWillHappen,
  whichDaysDaytimeVisits,
  whichDaysOvernight,
  whichSchedule,
  willDaytimeVisitsHappen,
  willOvernightsHappen,
} from '../utils/formattedAnswersForCheckAnswers'

const checkYourAnswersRoutes = (router: Router) => {
  router.get(paths.CHECK_YOUR_ANSWERS, (request, response) => {
    const { initialAdultName, secondaryAdultName } = request.session

    response.render('pages/checkYourAnswers', {
      title: `${i18n.__('checkYourAnswers.title')}`,
      backLinkHref: paths.TASK_LIST,
      values: {
        childrenNames: formattedChildrenNames(request.session),
        adultNames: formatListOfStrings([initialAdultName, secondaryAdultName]),
        parentNotMostlyLivedWith: parentNotMostlyLivedWith(request.session),
        mostlyLive: mostlyLive(request.session),
        whichSchedule: whichSchedule(request.session),
        willOvernightsHappen: willOvernightsHappen(request.session),
        whichDaysOvernight: whichDaysOvernight(request.session),
        willDaytimeVisitsHappen: willDaytimeVisitsHappen(request.session),
        whichDaysDaytimeVisits: whichDaysDaytimeVisits(request.session),
        whatWillHappen: whatWillHappen(request.session),
      },
    })
  })
}

export default checkYourAnswersRoutes
