import { Router } from 'express'
import i18n from 'i18n'
import paths from '../constants/paths'
import formatNames from '../utils/formatNames'

const sharePlanRoutes = (router: Router) => {
  router.get(paths.SHARE_PLAN, (request, response) => {
    const { namesOfChildren } = request.session

    const childrenNames = formatNames(namesOfChildren)

    response.render('pages/sharePlan', {
      title: `${i18n.__('sharePlan.title', { names: childrenNames })}`,
      values: {
        ...request.session,
        childrenNames,
      },
    })
  })
}

export default sharePlanRoutes
