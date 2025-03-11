import { Router } from 'express'
import i18n from 'i18n'
import paths from '../constants/paths'
import { formattedChildrenNames, mostlyLiveComplete, whatWillHappenComplete } from '../utils/sessionHelpers'

const taskListRoutes = (router: Router) => {
  router.get(paths.TASK_LIST, (request, response) => {
    const isWhatWillHappenComplete = whatWillHappenComplete(request.session)
    const isMostlyLiveComplete = mostlyLiveComplete(request.session)

    response.render('pages/taskList', {
      title: i18n.__('taskList.title', { names: formattedChildrenNames(request.session) }),
      // TODO - this should only be true when all tasks are complete
      showContinue: isWhatWillHappenComplete && isMostlyLiveComplete,
      whatWillHappenComplete: isWhatWillHappenComplete,
      mostlyLiveComplete: isMostlyLiveComplete,
    })
  })
}

export default taskListRoutes
