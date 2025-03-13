import { Router } from 'express'
import paths from '../constants/paths'
import courtOrderCheckRoutes from './courtOrderCheck'
import existingCourtOrderRoutes from './existingCourtOrder'
import numberOfChildrenRoutes from './numberOfChildren'
import aboutTheChildrenRoutes from './aboutTheChildren'
import aboutTheAdultsRoutes from './aboutTheAdults'
import safetyCheckRoutes from './safetyCheck'
import childrenSafetyRoutesCheck from './childrenSafetyCheck'
import doWhatsBestRoutes from './doWhatsBest'
import taskListRoutes from './taskList'
import checkYourAnswersRoutes from './checkYourAnswers'
import sharePlanRoutes from './sharePlan'
import livingAndVisitingRoutes from './livingAndVisiting'
import specialDaysRoutes from './specialDays'
import pdfRoutes from './pdf'
import handoverAndHolidaysRoutes from './handoverAndHolidays'

const routes = (): Router => {
  const router = Router()
  router.get(paths.START, (_request, response) => {
    response.render('pages/index')
  })

  safetyCheckRoutes(router)
  childrenSafetyRoutesCheck(router)
  doWhatsBestRoutes(router)
  courtOrderCheckRoutes(router)
  existingCourtOrderRoutes(router)
  numberOfChildrenRoutes(router)
  aboutTheChildrenRoutes(router)
  aboutTheAdultsRoutes(router)
  taskListRoutes(router)
  checkYourAnswersRoutes(router)
  sharePlanRoutes(router)
  livingAndVisitingRoutes(router)
  handoverAndHolidaysRoutes(router)
  specialDaysRoutes(router)
  pdfRoutes(router)

  return router
}

export default routes
