import { Router } from 'express'
import i18n from 'i18n'
import paths from '../constants/paths'
import formatNames from '../utils/formatNames'

const taskListRoutes = (router: Router) => {
  router.get(paths.TASK_LIST, (request, response) => {
    const { namesOfChildren } = request.session

    response.render('pages/taskList', {
      title: `${i18n.__('taskList.titlePrefix')} ${formatNames(namesOfChildren)}`,
      // TODO - this should only be true when all tasks are complete
      showContinue: true,
    })
  })
}

export default taskListRoutes
