import { Router } from 'express'
import i18n from 'i18n'
import paths from '../constants/paths'
import formatNames from '../utils/formatNames'

const checkYourAnswersRoutes = (router: Router) => {
  router.get(paths.CHECK_YOUR_ANSWERS, (request, response) => {
    const { namesOfChildren, initialAdultName, secondaryAdultName } = request.session

    response.render('pages/checkYourAnswers', {
      title: `${i18n.__('checkYourAnswers.title')}`,
      backLinkHref: paths.TASK_LIST,
      values: {
        ...request.session,
        childrenNames: formatNames(namesOfChildren),
        adultNames: formatNames([initialAdultName, secondaryAdultName]),
      },
    })
  })
}

export default checkYourAnswersRoutes
