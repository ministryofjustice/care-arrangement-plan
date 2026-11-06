import { Router } from 'express';

import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { getBackUrl } from '../../utils/sessionHelpers';

const travelInformationRoutes = (router: Router) => {
  router.get(paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION,
    checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION),
    (request, response) => {
    response.render('pages/handoverAndHolidays/travelInformation', {
      errors: request.flash('errors'),
      title: request.__('handoverAndHolidays.travelInformation.title'),
      backLinkHref: getBackUrl(request.session, paths.HANDOVER_HOLIDAYS_TRAVEL_CONSENT)
    });
  });

  router.post(
    paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION,
    checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION),
    (request, response) => {
    addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION);
    response.redirect(paths.TASK_LIST);
  });
};

export default travelInformationRoutes;
