import { Router } from 'express'
import i18n from 'i18n'
import paths from '../constants/paths'

const taskListRoutes = (router: Router) => {
  router.get(paths.TASK_LIST, (request, response) => {
    const whatWillHappenComplete = request.sessionHelpers.whatWillHappenComplete()
    const mostlyLiveComplete = request.sessionHelpers.mostlyLiveComplete()

    response.render('pages/taskList', {
      title: i18n.__('taskList.title', { names: request.sessionHelpers.formattedChildrenNames() }),
      // TODO - this should only be true when all tasks are complete
      showContinue: whatWillHappenComplete && mostlyLiveComplete,
      whatWillHappenComplete,
      mostlyLiveComplete,
    })
  })
}

export default taskListRoutes
