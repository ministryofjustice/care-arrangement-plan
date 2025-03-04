import { Router } from 'express'
import i18n from 'i18n'
import paths from '../constants/paths'
import formatNames from '../utils/formatNames'

const checkYourAnswersRoutes = (router: Router) => {
  router.get(paths.CHECK_YOUR_ANSWERS, (request, response) => {
    const { namesOfChildren, initialAdultName, secondaryAdultName, specialDays } = request.session

    const whatWillHappen = specialDays.whatWillHappen.noDecisionRequired
      ? i18n.__('doNotNeedToDecide')
      : specialDays.whatWillHappen.answer

    response.render('pages/checkYourAnswers', {
      title: `${i18n.__('checkYourAnswers.title')}`,
      backLinkHref: paths.TASK_LIST,
      values: {
        childrenNames: formatNames(namesOfChildren),
        adultNames: formatNames([initialAdultName, secondaryAdultName]),
        whatWillHappen,
      },
    })
  })
}

export default checkYourAnswersRoutes
