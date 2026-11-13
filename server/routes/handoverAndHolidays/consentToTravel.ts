import { Router } from 'express';

import FORM_STEPS from '../../constants/formSteps';
import paths from '../../constants/paths';
import checkFormProgressFromConfig from '../../middleware/checkFormProgressFromConfig';
import addCompletedStep from '../../utils/addCompletedStep';
import { getRedirectUrlAfterFormSubmit } from '../../utils/sessionHelpers';

const consentToTravelRoutes = (router: Router) => {
  router.get(
    paths.HANDOVER_HOLIDAYS_TRAVEL_CONSENT,
    checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_CONSENT),
    (request, response) => {
      response.render('pages/handoverAndHolidays/consentToTravel', {
        title: request.__('handoverAndHolidays.consentToTravel.title'),
        backLinkHref: paths.HANDOVER_HOLIDAYS_TRAVEL_DOCUMENTS,
      });
    },
  );

  router.post(
    paths.HANDOVER_HOLIDAYS_TRAVEL_CONSENT,
    checkFormProgressFromConfig(FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_CONSENT),
    (request, response) => {
      addCompletedStep(request, FORM_STEPS.HANDOVER_HOLIDAYS_TRAVEL_CONSENT);

      if (request.body.saveAndComeBackLater === 'true') {
        return response.redirect(paths.TASK_LIST);
      }

      return response.redirect(
        getRedirectUrlAfterFormSubmit(request.session, paths.HANDOVER_HOLIDAYS_TRAVEL_INFORMATION),
      );
    },
  );
};

export default consentToTravelRoutes;
