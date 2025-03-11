import { Router } from 'express'
import i18n from 'i18n'
import paths from '../constants/paths'
import { formatListOfStrings } from '../utils/formValueUtils'

const checkYourAnswersRoutes = (router: Router) => {
  router.get(paths.CHECK_YOUR_ANSWERS, (request, response) => {
    const { initialAdultName, secondaryAdultName, specialDays } = request.session

    response.render('pages/checkYourAnswers', {
      title: `${i18n.__('checkYourAnswers.title')}`,
      backLinkHref: paths.TASK_LIST,
      values: {
        collectiveChildrenName: request.sessionHelpers.collectiveChildrenName(),
        childrenNames: request.sessionHelpers.formattedChildrenNames(),
        adultNames: formatListOfStrings([initialAdultName, secondaryAdultName]),
        parentNotMostlyLivedWith: request.sessionHelpers.parentNotMostlyLivedWith(),
        mostlyLive: request.formattedAnswers.mostlyLive(),
        whichSchedule: request.formattedAnswers.whichSchedule(),
        willOvernightsHappen: request.formattedAnswers.willOvernightsHappen(),
        whichDaysOvernight: request.formattedAnswers.whichDaysOvernight(),
        willDaytimeVisitsHappen: request.formattedAnswers.willDaytimeVisitsHappen(),
        whichDaysDaytimeVisits: request.formattedAnswers.whichDaysDaytimeVisits(),
        whatWillHappen: specialDays.whatWillHappen.noDecisionRequired
          ? i18n.__('doNotNeedToDecide')
          : specialDays.whatWillHappen.answer,
      },
    })
  })
}

export default checkYourAnswersRoutes
