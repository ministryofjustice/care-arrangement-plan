import { Router } from 'express'
import i18n from 'i18n'
import paths from '../constants/paths'
import { formattedChildrenNames } from '../utils/sessionHelpers'

const sharePlanRoutes = (router: Router) => {
  router.get(paths.SHARE_PLAN, (request, response) => {
    const childrenNames = formattedChildrenNames(request.session)

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
