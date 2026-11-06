import { Router } from 'express';

import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';

const consentToTravelRoutes = (router: Router) => {
  router.get(
    paths.HANDOVER_HOLIDAYS_TRAVEL_CONSENT,
    checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_CONSENT),
    (request, response) => {
    response.render('pages/consentToTravel', {
      title: request.__('handoverAndHolidays.consentToTravel.title'),
      backLinkHref: paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS,
    });
  });

  router.post(
    paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION,
    checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION),
    (request, response) => {
    addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_CONSENT);
    response.redirect(paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION);
  });
};

export default consentToTravelRoutes;
