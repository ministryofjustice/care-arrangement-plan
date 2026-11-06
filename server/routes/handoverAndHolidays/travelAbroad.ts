import { Router } from 'express';

import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { getBackUrl } from '../../utils/sessionHelpers';

const travelAbroadRoutes = (router: Router) => {
  router.get(paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD,
    checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_ABROAD),
    (request, response) => {
    response.render('pages/handoverAndHolidays/travelAbroad', {
      errors: request.flash('errors'),
      title: request.__('handoverAndHolidays.travelAbroad.title'),
      backLinkHref: getBackUrl(request.session, paths.TASK_LIST)
    });
  });

  router.post(
    paths.HANDOVER_HOLIDAYS_TRAVEL_ABROAD,
    checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_ABROAD),
    (request, response) => {
    addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_ABROAD);
    response.redirect(paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS);
  });
};

export default travelAbroadRoutes;
