import { Router } from 'express';

import paths from '../constants/paths';

import aboutTheAdultsRoutes from './aboutTheAdults';
import aboutTheChildrenRoutes from './aboutTheChildren';
import checkYourAnswersRoutes from './checkYourAnswers';
import childrenSafetyRoutesCheck from './childrenSafetyCheck';
import courtOrderCheckRoutes from './courtOrderCheck';
import decisionMakingRoutes from './decisionMaking';
import doWhatsBestRoutes from './doWhatsBest';
import existingCourtOrderRoutes from './existingCourtOrder';
import handoverAndHolidaysRoutes from './handoverAndHolidays';
import livingAndVisitingRoutes from './livingAndVisiting';
import numberOfChildrenRoutes from './numberOfChildren';
import otherThingsRoutes from './otherThings';
import pdfRoutes from './pdf';
import safetyCheckRoutes from './safetyCheck';
import sharePlanRoutes from './sharePlan';
import specialDaysRoutes from './specialDays';
import taskListRoutes from './taskList';
import accessibilityStatementRoutes from './accessibilityStatement';


const routes = (): Router => {
  const router = Router();
  router.get(paths.START, (_request, response) => {
    response.render('pages/index');
  });

  safetyCheckRoutes(router);
  childrenSafetyRoutesCheck(router);
  doWhatsBestRoutes(router);
  courtOrderCheckRoutes(router);
  existingCourtOrderRoutes(router);
  numberOfChildrenRoutes(router);
  aboutTheChildrenRoutes(router);
  aboutTheAdultsRoutes(router);
  taskListRoutes(router);
  checkYourAnswersRoutes(router);
  sharePlanRoutes(router);
  livingAndVisitingRoutes(router);
  handoverAndHolidaysRoutes(router);
  specialDaysRoutes(router);
  otherThingsRoutes(router);
  decisionMakingRoutes(router);
  pdfRoutes(router);
  accessibilityStatementRoutes(router);

  return router;
};

export default routes;
