import { Request, Router } from 'express';

import config from '../config';
import FORM_STEPS from '../constants/formSteps';
import paths from '../constants/paths';
import addCompletedStep from '../utils/addCompletedStep';

import aboutTheAdultsRoutes from './aboutTheAdults';
import aboutTheChildrenRoutes from './aboutTheChildren';
import accessibilityStatementRoutes from './accessibilityStatement';
import analyticsRoutes from './analytics';
import checkYourAnswersRoutes from './checkYourAnswers';
import childrenSafetyRoutesCheck from './childrenSafetyCheck';
import confirmationRoutes from './confirmation';
import courtOrderCheckRoutes from './courtOrderCheck';
import decisionMakingRoutes from './decisionMaking';
import doWhatsBestRoutes from './doWhatsBest';
import downloadRoutes from './downloads';
import existingCourtOrderRoutes from './existingCourtOrder';
import handoverAndHolidaysRoutes from './handoverAndHolidays';
import livingAndVisitingRoutes from './livingAndVisiting';
import numberOfChildrenRoutes from './numberOfChildren';
import otherThingsRoutes from './otherThings';
import safetyCheckRoutes from './safetyCheck';
import sharePlanRoutes from './sharePlan';
import specialDaysRoutes from './specialDays';
import taskListRoutes from './taskList';

function clearSessionData(request: Request): void {
  delete request.session.numberOfChildren;
  delete request.session.namesOfChildren;
  delete request.session.initialAdultName;
  delete request.session.secondaryAdultName;
  delete request.session.livingAndVisiting;
  delete request.session.handoverAndHolidays;
  delete request.session.specialDays;
  delete request.session.otherThings;
  delete request.session.decisionMaking;
  delete request.session.pageHistory;
  delete request.session.completedSteps;
  request.session.planStartTime = Date.now();
}

const routes = (): Router => {
  const router = Router();

  router.get(paths.START, (request, response) => {
    clearSessionData(request);
    if (config.isLiveService) {
      return response.redirect(paths.SAFETY_CHECK);
    }
    addCompletedStep(request, FORM_STEPS.START);
    response.render('pages/index');
  });

  router.post(paths.START, (request, response) => {
    clearSessionData(request);
    response.redirect(paths.SAFETY_CHECK);
  });

  analyticsRoutes(router);
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
  confirmationRoutes(router);
  livingAndVisitingRoutes(router);
  handoverAndHolidaysRoutes(router);
  specialDaysRoutes(router);
  otherThingsRoutes(router);
  decisionMakingRoutes(router);
  downloadRoutes(router);
  accessibilityStatementRoutes(router);

  return router;
};

export default routes;
