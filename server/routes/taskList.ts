import { Router } from 'express'
import i18n from 'i18n'
import paths from '../constants/paths'
import formatNames from '../utils/formatNames'

const taskListRoutes = (router: Router) => {
  router.get(paths.TASK_LIST, (request, response) => {
    const { namesOfChildren, specialDays } = request.session

    const whatWillHappenComplete = specialDays?.whatWillHappen?.skipped || !!specialDays?.whatWillHappen?.answer

    response.render('pages/taskList', {
      title: i18n.__('taskList.title', { names: formatNames(namesOfChildren) }),
      // TODO - this should only be true when all tasks are complete
      showContinue: whatWillHappenComplete,
      whatWillHappenComplete,
    })
  })
}

export default taskListRoutes
