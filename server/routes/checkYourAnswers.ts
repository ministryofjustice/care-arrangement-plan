import { Router } from 'express'
import i18n from 'i18n'
import paths from '../constants/paths'
import { formatNames } from '../utils/formValueUtils'

const checkYourAnswersRoutes = (router: Router) => {
  router.get(paths.CHECK_YOUR_ANSWERS, (request, response) => {
    const { initialAdultName, secondaryAdultName } = request.session

    response.render('pages/checkYourAnswers', {
      title: `${i18n.__('checkYourAnswers.title')}`,
      backLinkHref: paths.TASK_LIST,
      values: {
        childrenNames: request.sessionHelpers.formattedChildrenNames(),
        adultNames: formatNames([initialAdultName, secondaryAdultName]),
        whatWillHappen: request.sessionHelpers.whatWillHappenAnswer(),
      },
    })
  })
}

export default checkYourAnswersRoutes
